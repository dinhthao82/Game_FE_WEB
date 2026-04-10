import type { Unit } from '@/entities/Unit';
import type { GridSystem, GridPos } from '@/systems/GridSystem';
import { WEAPONS_BY_ID } from '@/data/weapons';
import { CLASS_BY_ID } from '@/data/classes';

function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

export interface AIAction {
  unit:     Unit;
  moveTo:   GridPos;
  attackTarget: Unit | null;
}

/** Simple AI: advance toward nearest player, attack if in range */
export function planEnemyTurn(
  enemies:  Unit[],
  players:  Unit[],
  grid:     GridSystem,
  tileW:    number,
  tileH:    number,
): AIAction[] {
  const actions: AIAction[] = [];
  if (players.length === 0) return actions;

  // Track positions as enemies move so they don't stack
  const occupied = new Set<string>([
    ...players.map(u => `${u.gridPos.col},${u.gridPos.row}`),
  ]);

  for (const enemy of enemies) {
    const weaponId = enemy.heroData.combatLoadout[0]?.defId;
    const weapon   = weaponId ? WEAPONS_BY_ID[weaponId] : null;
    const [minR, maxR] = weapon ? weapon.range : [1, 1];
    const moveRange    = CLASS_BY_ID[enemy.heroData.currentClass]?.movementRange ?? 4;

    // Remove own pos from occupied before planning
    occupied.delete(`${enemy.gridPos.col},${enemy.gridPos.row}`);

    // Find nearest player
    const nearest = players.reduce((best, p) =>
      manhattan(enemy.gridPos, p.gridPos) < manhattan(enemy.gridPos, best.gridPos) ? p : best
    , players[0]);

    if (!nearest) { actions.push({ unit: enemy, moveTo: enemy.gridPos, attackTarget: null }); continue; }

    // BFS to find best tile to move toward nearest player while staying in move range
    const moveableTiles = grid.getMovementRange(
      enemy.gridPos.col, enemy.gridPos.row,
      moveRange, 'WALK',
      new Set(players.map(u => `${u.gridPos.col},${u.gridPos.row}`)),
    ).filter(t => !occupied.has(`${t.col},${t.row}`));

    // Among moveable tiles, find one adjacent to player (attack range)
    // Prefer: tile where manhattan(tile, player) is in [minR, maxR]
    let bestTile = enemy.gridPos;
    let bestDist = manhattan(enemy.gridPos, nearest.gridPos);

    for (const tile of moveableTiles) {
      const dist = manhattan(tile, nearest.gridPos);
      // Ideal: can attack from this tile
      if (dist >= minR && dist <= maxR) {
        bestTile = tile;
        bestDist = -1; // in attack range — can't do better
        break;
      }
      if (dist < bestDist) {
        bestDist = dist;
        bestTile = tile;
      }
    }

    // After moving, can attack?
    const distAfterMove = manhattan(bestTile, nearest.gridPos);
    const canAttack = distAfterMove >= minR && distAfterMove <= maxR;

    occupied.add(`${bestTile.col},${bestTile.row}`);
    actions.push({ unit: enemy, moveTo: bestTile, attackTarget: canAttack ? nearest : null });
  }

  return actions;
}
