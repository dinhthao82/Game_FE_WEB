// ── Class ─────────────────────────────────────────────────────────────
export type HeroClass =
  // Physical base
  | 'DARK_KNIGHT' | 'DRAGOON' | 'MONK' | 'NINJA' | 'KNIGHT'
  | 'HUNTER' | 'BARD' | 'MACHINIST'
  // Magic base
  | 'WHITE_MAGE' | 'BLACK_MAGE' | 'SUMMONER' | 'CALLER' | 'MYSTIC'
  // Promoted physical
  | 'PALADIN' | 'HOLY_DRAGOON' | 'MASTER_MONK' | 'EDGE_MASTER'
  | 'GRAND_KNIGHT' | 'SNIPER' | 'TROUBADOUR' | 'ENGINEER'
  // Promoted magic/hybrid
  | 'ARCHBISHOP' | 'ARCHMAGE' | 'EIDOLON_MASTER' | 'SAGE';

export type ClassCategory = 'PHYSICAL' | 'MAGIC' | 'HYBRID';
export type MovementType   = 'WALK' | 'CAVALRY' | 'FLY' | 'ARMORED';

// ── Weapon ────────────────────────────────────────────────────────────
export type WeaponType =
  | 'SWORD' | 'AXE' | 'LANCE' | 'BOW' | 'FIST' | 'CLUB' | 'HAMMER'
  | 'HARP' | 'ROD' | 'STAFF' | 'THROWN'
  | 'FIRE' | 'BLIZZARD' | 'THUNDER' | 'WIND' | 'LIGHT' | 'DARK' | 'SUMMON';

export type WeaponRank = 'D' | 'C' | 'B' | 'A' | 'HOLY';

export type WeaponTriangleGroup = 'PHYSICAL' | 'MAGIC' | 'LIGHT_DARK' | 'NONE';

// ── Holy Blood ────────────────────────────────────────────────────────
export enum HolyBlood {
  ODO      = 'ODO',
  BALDR    = 'BALDR',
  ULLR     = 'ULLR',
  NAGA     = 'NAGA',
  FJALAR   = 'FJALAR',
  BRAGI    = 'BRAGI',
  TORDO    = 'TORDO',
  NEIR     = 'NEIR',
}

export enum BloodRank {
  MINOR = 1,
  MAJOR = 2,
}

// ── Hero ──────────────────────────────────────────────────────────────
export type HeroGender        = 'MALE' | 'FEMALE';
export type HeroLifecycle     = 'ACTIVE' | 'GHOST' | 'DELETED';

// ── Appearance ────────────────────────────────────────────────────────
export enum HairStyle {
  SHORT_NEAT  = 'SHORT_NEAT',
  SHORT_MESSY = 'SHORT_MESSY',
  SWEPT_BACK  = 'SWEPT_BACK',
  HALF_TIED   = 'HALF_TIED',
  PONYTAIL    = 'PONYTAIL',
  TWIN_TAILS  = 'TWIN_TAILS',
  SHORT_BOB   = 'SHORT_BOB',
  LONG_LOOSE  = 'LONG_LOOSE',
  BRAIDED     = 'BRAIDED',
}

export enum HairColor {
  BLACK  = 'BLACK',
  BROWN  = 'BROWN',
  BLONDE = 'BLONDE',
  RED    = 'RED',
  SILVER = 'SILVER',
  WHITE  = 'WHITE',
}

export enum SkinTone {
  LIGHT  = 'LIGHT',
  MEDIUM = 'MEDIUM',
  DARK   = 'DARK',
}

export enum EyeColor {
  BROWN = 'BROWN',
  BLUE  = 'BLUE',
  GREEN = 'GREEN',
  GREY  = 'GREY',
  RED   = 'RED',
  GOLD  = 'GOLD',
}

// ── Terrain ───────────────────────────────────────────────────────────
export type TerrainType =
  | 'PLAIN' | 'FOREST' | 'MOUNTAIN' | 'FORT'
  | 'SEA' | 'VILLAGE' | 'THRONE';

// ── Skill ─────────────────────────────────────────────────────────────
export type SkillTrigger = 'PASSIVE' | 'ACTIVE';
