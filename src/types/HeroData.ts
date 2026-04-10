import type {
  HeroClass, HeroGender, HeroLifecycle,
  HolyBlood, BloodRank,
  HairStyle, HairColor, SkinTone, EyeColor,
} from './enums';
import type { StatBlock, StatGrowths } from './StatBlock';

// ── Appearance ────────────────────────────────────────────────────────
export interface HeroAppearance {
  hairStyle: HairStyle;
  hairColor: HairColor;
  skinTone:  SkinTone;
  eyeColor:  EyeColor;
}

// ── Holy Blood ────────────────────────────────────────────────────────
export interface HeroHolyBlood {
  blood: HolyBlood;
  rank:  BloodRank;
}

// ── Loadout ───────────────────────────────────────────────────────────
export interface LoadoutSlot {
  defId: string;            // WeaponDefinition.id
  currentDurability: number;
}

// ── Name Record ───────────────────────────────────────────────────────
export interface NameRecord {
  originalName: string;
  changedName:  string | null;
  changeUsed:   boolean;
}

// ── Death Snapshot ────────────────────────────────────────────────────
export interface DeathSnapshot {
  battleId:   string;
  killedByClass: string;
  statsAtDeath: StatBlock;
}

// ── Hero ──────────────────────────────────────────────────────────────
export interface HeroData {
  heroId:         string;
  runId:          string;
  gender:         HeroGender;
  nameRecord:     NameRecord;
  lifecycleState: HeroLifecycle;
  deathSnapshot:  DeathSnapshot | null;

  baseClass:      HeroClass;
  currentClass:   HeroClass;
  isPromoted:     boolean;
  level:          number;
  promotionLevel: number | null;   // level at time of promote (10-20)
  experience:     number;

  baseStats:  StatBlock;
  stats:      StatBlock;           // runtime (includes holy blood bonus)
  growths:    StatGrowths;         // stored after promote multiplier applied

  holyBloods:     HeroHolyBlood[];
  knownSkillIds:  string[];
  combatLoadout:  LoadoutSlot[];   // max 5 slots

  appearance:     HeroAppearance;
  isResurrected:  boolean;
}
