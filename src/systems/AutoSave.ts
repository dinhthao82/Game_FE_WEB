import type { RunState } from '@/types';
import type { RunRoster, AccountInventory, AccountData } from '@/types/RunRoster';
import type { HeroData } from '@/types/HeroData';

export interface UserProgress {
  version: number;
  account:   AccountData;
  inventory: AccountInventory;
  ghostPool: HeroData[];
  currentRun: {
    state:  RunState;
    roster: RunRoster;
  } | null;
}

const SAVE_KEY = 'tactics_save_v1';
const VERSION  = 1;

export function loadProgress(): UserProgress | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as UserProgress;
    if (data.version !== VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveProgress(p: UserProgress): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...p, version: VERSION }));
  } catch {
    console.error('[AutoSave] Failed to write localStorage');
  }
}

export function clearProgress(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function makeDefaultProgress(): UserProgress {
  return {
    version: VERSION,
    account: {
      accountId:             crypto.randomUUID(),
      totalCharSlots:        20,
      totalWins:             0,
      totalRunsCompleted:    0,
      bestRunBattlesCleared: 0,
      holyWeaponRegistry:   {},
      usedSeeds:            [],
    },
    inventory: {
      weapons:        [],
      promotionItems: [],
      skillBooks:     [],
      gold:           0,
    },
    ghostPool:   [],
    currentRun:  null,
  };
}
