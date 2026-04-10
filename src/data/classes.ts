import type { ClassDefinition } from '@/types';

export const CLASS_DEFS: ClassDefinition[] = [
  // ── DARK_KNIGHT ─────────────────────────────────────────────────
  {
    id: 'DARK_KNIGHT', displayName: 'Dark Knight',
    category: 'PHYSICAL', isBaseClass: true,
    movementType: 'WALK', movementRange: 4,
    usableWeapons: ['SWORD', 'AXE'],
    baseStats: { hp: 20, str: 7, mag: 1, def: 6, res: 2, spd: 5, skl: 5, lck: 3 },
    growths:   { hp: 80, str: 65, mag: 10, def: 55, res: 20, spd: 35, skl: 45, lck: 25 },
    classSkillIds: ['DARKWAVE', 'SHADOW_STEP', 'COVER'],
    promotionPaths: [{ promotedClass: 'PALADIN', requiredItem: 'LUSTROUS_CRYSTAL', requiredLevel: 10, statBonus: { hp: 8, str: 3, mag: 5, def: 3, res: 5 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── PALADIN ─────────────────────────────────────────────────────
  {
    id: 'PALADIN', displayName: 'Paladin',
    category: 'HYBRID', isBaseClass: false,
    movementType: 'WALK', movementRange: 5,
    usableWeapons: ['SWORD', 'LANCE', 'LIGHT'],
    baseStats: { hp: 28, str: 10, mag: 6, def: 9, res: 7, spd: 5, skl: 7, lck: 5 },
    growths:   { hp: 80, str: 65, mag: 20, def: 55, res: 35, spd: 35, skl: 45, lck: 25 },
    classSkillIds: ['SHADOW_STEP', 'COVER', 'HOLY_BLADE', 'DIVINE_VEIL'],
    promotionPaths: [],
    promotedFrom: 'DARK_KNIGHT', alternatePromotionSources: [],
  },
  // ── DRAGOON ─────────────────────────────────────────────────────
  {
    id: 'DRAGOON', displayName: 'Dragoon',
    category: 'PHYSICAL', isBaseClass: true,
    movementType: 'WALK', movementRange: 4,
    usableWeapons: ['LANCE'],
    baseStats: { hp: 18, str: 7, mag: 0, def: 5, res: 1, spd: 6, skl: 7, lck: 4 },
    growths:   { hp: 75, str: 60, mag: 5, def: 45, res: 15, spd: 40, skl: 50, lck: 30 },
    classSkillIds: ['JUMP', 'LANCE_PARRY', 'WYRMKIN'],
    promotionPaths: [{ promotedClass: 'HOLY_DRAGOON', requiredItem: 'SPEAR_OF_DRAGOON', requiredLevel: 10, statBonus: { hp: 5, str: 5, def: 4, spd: 2 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── MONK ────────────────────────────────────────────────────────
  {
    id: 'MONK', displayName: 'Monk',
    category: 'PHYSICAL', isBaseClass: true,
    movementType: 'WALK', movementRange: 4,
    usableWeapons: ['FIST', 'CLUB'],
    baseStats: { hp: 22, str: 8, mag: 0, def: 4, res: 2, spd: 7, skl: 6, lck: 5 },
    growths:   { hp: 85, str: 70, mag: 5, def: 35, res: 10, spd: 55, skl: 55, lck: 20 },
    classSkillIds: ['FOCUS', 'CHAKRA', 'COUNTER'],
    promotionPaths: [{ promotedClass: 'MASTER_MONK', requiredItem: 'POWER_SASH', requiredLevel: 10, statBonus: { hp: 5, str: 7, def: 2, spd: 4 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── NINJA ───────────────────────────────────────────────────────
  {
    id: 'NINJA', displayName: 'Ninja',
    category: 'PHYSICAL', isBaseClass: true,
    movementType: 'WALK', movementRange: 5,
    usableWeapons: ['SWORD', 'THROWN'],
    baseStats: { hp: 16, str: 6, mag: 1, def: 3, res: 2, spd: 9, skl: 8, lck: 6 },
    growths:   { hp: 55, str: 50, mag: 15, def: 25, res: 20, spd: 80, skl: 65, lck: 50 },
    classSkillIds: ['THROW', 'SMOKE_BOMB', 'DUAL_WIELD'],
    promotionPaths: [{ promotedClass: 'EDGE_MASTER', requiredItem: 'SHADOW_BLADE', requiredLevel: 10, statBonus: { hp: 3, str: 3, mag: 2, def: 1, res: 2, spd: 5 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── KNIGHT ──────────────────────────────────────────────────────
  {
    id: 'KNIGHT', displayName: 'Knight',
    category: 'PHYSICAL', isBaseClass: true,
    movementType: 'ARMORED', movementRange: 3,
    usableWeapons: ['SWORD'],
    baseStats: { hp: 24, str: 6, mag: 0, def: 9, res: 3, spd: 3, skl: 4, lck: 3 },
    growths:   { hp: 90, str: 50, mag: 5, def: 80, res: 30, spd: 20, skl: 35, lck: 20 },
    classSkillIds: ['PROTECT', 'SENTINEL', 'TAUNT'],
    promotionPaths: [{ promotedClass: 'GRAND_KNIGHT', requiredItem: 'KNIGHTS_CREST', requiredLevel: 10, statBonus: { hp: 8, str: 3, def: 7, res: 2, spd: 1 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── HUNTER ──────────────────────────────────────────────────────
  {
    id: 'HUNTER', displayName: 'Hunter',
    category: 'PHYSICAL', isBaseClass: true,
    movementType: 'WALK', movementRange: 4,
    usableWeapons: ['BOW'],
    baseStats: { hp: 16, str: 5, mag: 0, def: 3, res: 2, spd: 7, skl: 9, lck: 6 },
    growths:   { hp: 60, str: 45, mag: 10, def: 30, res: 25, spd: 55, skl: 75, lck: 40 },
    classSkillIds: ['AIMED_SHOT', 'ANIMAL_LORE', 'BARRAGE'],
    promotionPaths: [{ promotedClass: 'SNIPER', requiredItem: 'EAGLE_FEATHER', requiredLevel: 10, statBonus: { hp: 3, str: 3, mag: 1, def: 2, res: 2, spd: 3 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── BARD ────────────────────────────────────────────────────────
  {
    id: 'BARD', displayName: 'Bard',
    category: 'PHYSICAL', isBaseClass: true,
    movementType: 'WALK', movementRange: 4,
    usableWeapons: ['HARP'],
    baseStats: { hp: 14, str: 3, mag: 3, def: 2, res: 5, spd: 8, skl: 5, lck: 9 },
    growths:   { hp: 45, str: 20, mag: 20, def: 20, res: 35, spd: 60, skl: 40, lck: 75 },
    classSkillIds: ['SALVE', 'SERENADE', 'ELEGY'],
    promotionPaths: [{ promotedClass: 'TROUBADOUR', requiredItem: 'SILVER_HARP', requiredLevel: 10, statBonus: { hp: 2, str: 1, mag: 4, def: 1, res: 4, spd: 4 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── MACHINIST ───────────────────────────────────────────────────
  {
    id: 'MACHINIST', displayName: 'Machinist',
    category: 'PHYSICAL', isBaseClass: true,
    movementType: 'ARMORED', movementRange: 3,
    usableWeapons: ['HAMMER'],
    baseStats: { hp: 18, str: 5, mag: 2, def: 6, res: 4, spd: 4, skl: 8, lck: 5 },
    growths:   { hp: 65, str: 40, mag: 10, def: 50, res: 30, spd: 35, skl: 70, lck: 35 },
    classSkillIds: ['ANALYZE', 'AUTO_CROSSBOW', 'REPAIR'],
    promotionPaths: [{ promotedClass: 'ENGINEER', requiredItem: 'CLOCKWORK_GEAR', requiredLevel: 10, statBonus: { hp: 4, str: 3, mag: 2, def: 4, res: 2, spd: 2 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── WHITE_MAGE ──────────────────────────────────────────────────
  {
    id: 'WHITE_MAGE', displayName: 'White Mage',
    category: 'MAGIC', isBaseClass: true,
    movementType: 'WALK', movementRange: 3,
    usableWeapons: ['ROD', 'STAFF'],
    baseStats: { hp: 14, str: 1, mag: 6, def: 2, res: 8, spd: 5, skl: 4, lck: 6 },
    growths:   { hp: 40, str: 10, mag: 55, def: 20, res: 70, spd: 40, skl: 30, lck: 45 },
    classSkillIds: ['BLESSING', 'HOLY_WARD'],
    promotionPaths: [{ promotedClass: 'ARCHBISHOP', requiredItem: 'HOLY_WATER', requiredLevel: 10, statBonus: { hp: 3, mag: 5, def: 2, res: 7, spd: 2 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── BLACK_MAGE ──────────────────────────────────────────────────
  {
    id: 'BLACK_MAGE', displayName: 'Black Mage',
    category: 'MAGIC', isBaseClass: true,
    movementType: 'WALK', movementRange: 3,
    usableWeapons: ['ROD'],
    baseStats: { hp: 12, str: 1, mag: 8, def: 1, res: 5, spd: 6, skl: 5, lck: 4 },
    growths:   { hp: 35, str: 5, mag: 80, def: 10, res: 40, spd: 50, skl: 40, lck: 30 },
    classSkillIds: ['AMPLIFY', 'MP_BURST'],
    promotionPaths: [
      { promotedClass: 'ARCHMAGE', requiredItem: 'DARK_CRYSTAL', requiredLevel: 10, statBonus: { hp: 2, mag: 8, res: 3, spd: 3 } },
      { promotedClass: 'SAGE', requiredItem: 'FORBIDDEN_TOME', requiredLevel: 10, statBonus: { hp: 4, str: 1, mag: 7, def: 1, res: 5, spd: 2 } },
    ],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── SUMMONER ────────────────────────────────────────────────────
  {
    id: 'SUMMONER', displayName: 'Summoner',
    category: 'MAGIC', isBaseClass: true,
    movementType: 'WALK', movementRange: 3,
    usableWeapons: ['ROD'],
    baseStats: { hp: 13, str: 1, mag: 7, def: 2, res: 6, spd: 4, skl: 4, lck: 5 },
    growths:   { hp: 40, str: 5, mag: 75, def: 15, res: 55, spd: 35, skl: 35, lck: 40 },
    classSkillIds: ['LUNAR_BOND', 'PHASE'],
    promotionPaths: [{ promotedClass: 'EIDOLON_MASTER', requiredItem: 'LUNAR_TEAR', requiredLevel: 10, statBonus: { hp: 3, mag: 7, def: 1, res: 5, spd: 2 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── CALLER ──────────────────────────────────────────────────────
  {
    id: 'CALLER', displayName: 'Caller',
    category: 'MAGIC', isBaseClass: true,
    movementType: 'WALK', movementRange: 3,
    usableWeapons: ['ROD'],
    baseStats: { hp: 12, str: 1, mag: 6, def: 1, res: 5, spd: 4, skl: 4, lck: 5 },
    growths:   { hp: 35, str: 5, mag: 65, def: 10, res: 45, spd: 30, skl: 30, lck: 35 },
    classSkillIds: ['ECHO_CALL'],
    promotionPaths: [
      { promotedClass: 'SUMMONER', requiredItem: 'SUMMONERS_CREST', requiredLevel: 10, statBonus: { hp: 1, mag: 1, res: 1 } },
      { promotedClass: 'EIDOLON_MASTER', requiredItem: 'LUNAR_TEAR', requiredLevel: 10, statBonus: { hp: 4, mag: 7, def: 1, res: 5, spd: 2 } },
    ],
    promotedFrom: null, alternatePromotionSources: [],
  },
  // ── MYSTIC ──────────────────────────────────────────────────────
  {
    id: 'MYSTIC', displayName: 'Mystic',
    category: 'MAGIC', isBaseClass: true,
    movementType: 'WALK', movementRange: 3,
    usableWeapons: ['STAFF'],
    baseStats: { hp: 14, str: 1, mag: 7, def: 2, res: 7, spd: 5, skl: 4, lck: 5 },
    growths:   { hp: 40, str: 10, mag: 60, def: 15, res: 60, spd: 40, skl: 35, lck: 40 },
    classSkillIds: ['ARCANE_INSIGHT', 'FOCUS_MAGIC'],
    promotionPaths: [{ promotedClass: 'SAGE', requiredItem: 'FORBIDDEN_TOME', requiredLevel: 10, statBonus: { hp: 3, str: 1, mag: 6, def: 1, res: 6, spd: 2 } }],
    promotedFrom: null, alternatePromotionSources: [],
  },
];

export const CLASS_BY_ID: Record<string, ClassDefinition> =
  Object.fromEntries(CLASS_DEFS.map(c => [c.id, c]));
