import type { WeaponType, WeaponRank, HolyBlood, BloodRank } from './enums';

export interface WeaponDefinition {
  id: string;
  displayName: string;
  type: WeaponType;
  rank: WeaponRank;
  might: number;
  hit: number;
  critBonus: number;
  weight: number;
  maxDurability: number;
  range: [number, number];   // [min, max]
  brave: boolean;
  isHoly: boolean;
  /** D/C rank weapons become DISABLED (stay in slot, 0 dur); B/A/HOLY weapons BREAK (removed from loadout) */
  onBreak: 'DISABLED' | 'BREAKS';
  holyBlood?: HolyBlood;
  bloodRankRequired?: BloodRank;
  statBonus?: Partial<{
    str: number; mag: number; def: number; res: number;
    spd: number; skl: number; lck: number; hp: number;
  }>;
  description?: string;
}

export interface SkillBookDefinition {
  id: string;
  displayName: string;
  rank: WeaponRank;
  skillId: string;
  description: string;
}

export interface PromotionItemDefinition {
  id: string;
  displayName: string;
  forClass: string;         // base class this promotes from
  toClass: string;          // promoted class
}

export type ItemDefinition =
  | (WeaponDefinition  & { itemKind: 'WEAPON' })
  | (SkillBookDefinition & { itemKind: 'SKILLBOOK' })
  | (PromotionItemDefinition & { itemKind: 'PROMOTION' })
  | { itemKind: 'GOLD'; id: string; displayName: string; amount: number }
  | { itemKind: 'CONSUMABLE'; id: string; displayName: string; mpRestore?: number; hpRestore?: number; description: string };
