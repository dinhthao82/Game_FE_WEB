export type Phase = 'PLAYER' | 'ENEMY';

export class TurnSystem {
  phase: Phase = 'PLAYER';
  turnNumber = 1;

  private actedIds = new Set<string>();

  hasActed(heroId: string): boolean {
    return this.actedIds.has(heroId);
  }

  markActed(heroId: string) {
    this.actedIds.add(heroId);
  }

  /** Call after all player units have acted — switches to enemy phase */
  endPlayerPhase() {
    this.phase = 'ENEMY';
    this.actedIds.clear();
  }

  /** Call after AI finishes — switches back to player phase */
  endEnemyPhase() {
    this.phase = 'PLAYER';
    this.turnNumber++;
    this.actedIds.clear();
  }

  /** All IDs acted? (used to auto-end phase) */
  allActed(ids: string[]): boolean {
    return ids.every(id => this.actedIds.has(id));
  }
}
