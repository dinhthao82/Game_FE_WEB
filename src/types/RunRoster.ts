import type { HeroData } from './HeroData';
import type { LoadoutSlot } from './HeroData';

export interface RunRoster {
  runId:        string;
  activeHeroes: HeroData[];
}

export interface AccountInventory {
  weapons:        (LoadoutSlot & { defId: string })[];
  promotionItems: string[];   // PromotionItemDefinition.id[]
  skillBooks:     string[];   // SkillBookDefinition.id[]
  gold:           number;
}

export interface AccountData {
  accountId:                string;
  totalCharSlots:           number;      // 20 base + Add Slot Char items
  totalWins:                number;
  totalRunsCompleted:       number;
  bestRunBattlesCleared:    number;
  holyWeaponRegistry:       Record<string, boolean>;
  usedSeeds:                number[];
}
