export interface DifficultyConfig {
  enemyLevelOffset:       number;
  enemyCountMultiplier:   number;
  reinforcementChance:    number;   // 0.0 – 1.0
  eliteEnemyChance:       number;
  bossPresent:            boolean;
}

export interface RunState {
  runId:                  string;
  seed:                   number;
  runNumber:              number;
  currentBattle:          number;
  totalBattles:           number;
  difficulty:             DifficultyConfig;
  completedBattleSeeds:   number[];
}

export function getDifficultyForRun(runNumber: number, battleIndex: number): DifficultyConfig {
  return {
    enemyLevelOffset:     Math.min(runNumber * 2, 20),
    enemyCountMultiplier: 1 + (runNumber - 1) * 0.15,
    reinforcementChance:  runNumber >= 3 ? (runNumber - 2) * 0.1 : 0,
    eliteEnemyChance:     runNumber >= 5 ? (runNumber - 4) * 0.12 : 0,
    bossPresent:          runNumber >= 2 && battleIndex >= 6,
  };
}
