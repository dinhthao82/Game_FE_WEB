import type { TerrainType, MovementType } from '@/types';
import { TERRAIN } from '@/data/terrain';

export interface GridPos { col: number; row: number; }

export class GridSystem {
  readonly tileW: number;
  readonly tileH: number;
  readonly cols:  number;
  readonly rows:  number;

  // terrain grid — row-major  [row][col]
  private grid: TerrainType[][];

  constructor(cols: number, rows: number, tileW = 32, tileH = 32) {
    this.cols  = cols;
    this.rows  = rows;
    this.tileW = tileW;
    this.tileH = tileH;
    this.grid  = Array.from({ length: rows }, () =>
      Array<TerrainType>(cols).fill('PLAIN'),
    );
  }

  // ── Grid access ─────────────────────────────────────────────────
  setTerrain(col: number, row: number, t: TerrainType) {
    this.grid[row][col] = t;
  }

  getTerrain(col: number, row: number): TerrainType {
    return this.grid[row]?.[col] ?? 'PLAIN';
  }

  inBounds(col: number, row: number): boolean {
    return col >= 0 && row >= 0 && col < this.cols && row < this.rows;
  }

  // ── Coordinate helpers ──────────────────────────────────────────
  worldToGrid(wx: number, wy: number): GridPos {
    return {
      col: Math.floor(wx / this.tileW),
      row: Math.floor(wy / this.tileH),
    };
  }

  gridToWorld(col: number, row: number): { x: number; y: number } {
    return { x: col * this.tileW, y: row * this.tileH };
  }

  centerOf(col: number, row: number): { x: number; y: number } {
    return {
      x: col * this.tileW + this.tileW / 2,
      y: row * this.tileH + this.tileH / 2,
    };
  }

  // ── Movement range (BFS flood-fill) ─────────────────────────────
  getMovementRange(
    col: number,
    row: number,
    movePoints: number,
    moveType: MovementType,
    occupiedByEnemy: Set<string>,   // "col,row" strings
  ): GridPos[] {
    const visited = new Map<string, number>();   // key → remaining MP
    const queue:   Array<{ col: number; row: number; mp: number }> = [];

    const key = (c: number, r: number) => `${c},${r}`;
    visited.set(key(col, row), movePoints);
    queue.push({ col, row, mp: movePoints });

    const result: GridPos[] = [];

    while (queue.length > 0) {
      const cur = queue.shift()!;
      result.push({ col: cur.col, row: cur.row });

      for (const [dc, dr] of [[0,-1],[0,1],[-1,0],[1,0]]) {
        const nc = cur.col + dc;
        const nr = cur.row + dr;
        if (!this.inBounds(nc, nr)) continue;

        const terrain  = this.getTerrain(nc, nr);
        const cost     = TERRAIN[terrain].moveCost[moveType];
        if (cost === null) continue;                    // impassable

        const remaining = cur.mp - cost;
        if (remaining < 0) continue;

        const k = key(nc, nr);
        if ((visited.get(k) ?? -1) >= remaining) continue;
        if (occupiedByEnemy.has(k)) continue;           // can't pass through enemy

        visited.set(k, remaining);
        queue.push({ col: nc, row: nr, mp: remaining });
      }
    }

    return result;
  }

  // ── Attack range (ring BFS) ──────────────────────────────────────
  getAttackRange(positions: GridPos[], minRange: number, maxRange: number): GridPos[] {
    const set = new Set<string>();
    const result: GridPos[] = [];
    const moved = new Set(positions.map(p => `${p.col},${p.row}`));

    for (const pos of positions) {
      for (let dr = -maxRange; dr <= maxRange; dr++) {
        for (let dc = -maxRange; dc <= maxRange; dc++) {
          const dist = Math.abs(dr) + Math.abs(dc);
          if (dist < minRange || dist > maxRange) continue;
          const nc = pos.col + dc;
          const nr = pos.row + dr;
          if (!this.inBounds(nc, nr)) continue;
          const k = `${nc},${nr}`;
          if (moved.has(k) || set.has(k)) continue;
          set.add(k);
          result.push({ col: nc, row: nr });
        }
      }
    }
    return result;
  }

  // ── A* pathfinding ───────────────────────────────────────────────
  findPath(
    start: GridPos,
    goal:  GridPos,
    moveType: MovementType,
    blocked: Set<string>,
  ): GridPos[] | null {
    const key = (p: GridPos) => `${p.col},${p.row}`;
    const h    = (p: GridPos) => Math.abs(p.col - goal.col) + Math.abs(p.row - goal.row);

    const open = new Map<string, { pos: GridPos; g: number; f: number; parent: string | null }>();
    const closed = new Set<string>();

    const startKey = key(start);
    open.set(startKey, { pos: start, g: 0, f: h(start), parent: null });

    const parents = new Map<string, string | null>();
    const gScores = new Map<string, number>();
    gScores.set(startKey, 0);

    while (open.size > 0) {
      // pick lowest f
      let bestKey = '';
      let bestF   = Infinity;
      for (const [k, v] of open) {
        if (v.f < bestF) { bestF = v.f; bestKey = k; }
      }
      const cur = open.get(bestKey)!;
      open.delete(bestKey);
      closed.add(bestKey);

      if (bestKey === key(goal)) {
        // reconstruct
        const path: GridPos[] = [];
        let k: string | null = bestKey;
        while (k !== null) {
          const [c, r] = k.split(',').map(Number);
          path.unshift({ col: c, row: r });
          k = parents.get(k) ?? null;
        }
        return path;
      }

      for (const [dc, dr] of [[0,-1],[0,1],[-1,0],[1,0]]) {
        const nc = cur.pos.col + dc;
        const nr = cur.pos.row + dr;
        if (!this.inBounds(nc, nr)) continue;
        const nk = `${nc},${nr}`;
        if (closed.has(nk) || blocked.has(nk)) continue;

        const terrain = this.getTerrain(nc, nr);
        const cost    = TERRAIN[terrain].moveCost[moveType];
        if (cost === null) continue;

        const g = (gScores.get(bestKey) ?? 0) + cost;
        if (g >= (gScores.get(nk) ?? Infinity)) continue;

        gScores.set(nk, g);
        parents.set(nk, bestKey);
        open.set(nk, { pos: { col: nc, row: nr }, g, f: g + h({ col: nc, row: nr }), parent: bestKey });
      }
    }
    return null;
  }
}
