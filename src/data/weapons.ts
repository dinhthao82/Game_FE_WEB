import type { WeaponDefinition } from '@/types';
import { HolyBlood, BloodRank } from '@/types';

export const WEAPONS: WeaponDefinition[] = [
  // ── D Rank ───────────────────────────────────────────────────────
  { id: 'IRON_SWORD',   displayName: 'Iron Sword',   type: 'SWORD', rank: 'D', might: 5,  hit: 90, critBonus: 0, weight: 5,  maxDurability: 46, range: [1,1], brave: false, isHoly: false },
  { id: 'IRON_AXE',     displayName: 'Iron Axe',     type: 'AXE',   rank: 'D', might: 8,  hit: 70, critBonus: 0, weight: 10, maxDurability: 46, range: [1,1], brave: false, isHoly: false },
  { id: 'IRON_LANCE',   displayName: 'Iron Lance',   type: 'LANCE', rank: 'D', might: 6,  hit: 80, critBonus: 0, weight: 8,  maxDurability: 46, range: [1,1], brave: false, isHoly: false },
  { id: 'IRON_BOW',     displayName: 'Iron Bow',     type: 'BOW',   rank: 'D', might: 6,  hit: 80, critBonus: 0, weight: 5,  maxDurability: 46, range: [2,2], brave: false, isHoly: false },
  { id: 'FIRE',         displayName: 'Fire',         type: 'FIRE',  rank: 'D', might: 5,  hit: 90, critBonus: 0, weight: 4,  maxDurability: 40, range: [1,2], brave: false, isHoly: false },
  { id: 'BLIZZARD',     displayName: 'Blizzard',     type: 'BLIZZARD', rank: 'D', might: 5, hit: 90, critBonus: 0, weight: 4, maxDurability: 40, range: [1,2], brave: false, isHoly: false },
  { id: 'THUNDER',      displayName: 'Thunder',      type: 'THUNDER',  rank: 'D', might: 5, hit: 90, critBonus: 5, weight: 6, maxDurability: 40, range: [1,2], brave: false, isHoly: false },
  { id: 'HEAL',         displayName: 'Heal',         type: 'STAFF', rank: 'D', might: 0,  hit: 100, critBonus: 0, weight: 2, maxDurability: 30, range: [1,1], brave: false, isHoly: false },
  // ── C Rank ───────────────────────────────────────────────────────
  { id: 'STEEL_SWORD',  displayName: 'Steel Sword',  type: 'SWORD', rank: 'C', might: 8,  hit: 80, critBonus: 0, weight: 10, maxDurability: 30, range: [1,1], brave: false, isHoly: false },
  { id: 'STEEL_AXE',    displayName: 'Steel Axe',    type: 'AXE',   rank: 'C', might: 11, hit: 65, critBonus: 0, weight: 15, maxDurability: 30, range: [1,1], brave: false, isHoly: false },
  { id: 'STEEL_LANCE',  displayName: 'Steel Lance',  type: 'LANCE', rank: 'C', might: 9,  hit: 70, critBonus: 0, weight: 14, maxDurability: 30, range: [1,1], brave: false, isHoly: false },
  { id: 'ELFIRE',       displayName: 'Elfire',       type: 'FIRE',  rank: 'C', might: 10, hit: 80, critBonus: 0, weight: 7,  maxDurability: 30, range: [1,2], brave: false, isHoly: false },
  { id: 'CURA',         displayName: 'Cura',         type: 'STAFF', rank: 'C', might: 0,  hit: 100, critBonus: 0, weight: 3, maxDurability: 25, range: [1,1], brave: false, isHoly: false },
  // ── B Rank ───────────────────────────────────────────────────────
  { id: 'SILVER_SWORD', displayName: 'Silver Sword', type: 'SWORD', rank: 'B', might: 13, hit: 80, critBonus: 0, weight: 13, maxDurability: 20, range: [1,1], brave: false, isHoly: false },
  { id: 'BRAVE_SWORD',  displayName: 'Brave Sword',  type: 'SWORD', rank: 'B', might: 8,  hit: 75, critBonus: 0, weight: 12, maxDurability: 20, range: [1,1], brave: true,  isHoly: false },
  { id: 'BRAVE_LANCE',  displayName: 'Brave Lance',  type: 'LANCE', rank: 'B', might: 9,  hit: 65, critBonus: 0, weight: 14, maxDurability: 20, range: [1,1], brave: true,  isHoly: false },
  { id: 'BRAVE_AXE',    displayName: 'Brave Axe',    type: 'AXE',   rank: 'B', might: 12, hit: 60, critBonus: 0, weight: 16, maxDurability: 20, range: [1,1], brave: true,  isHoly: false },
  { id: 'BRAVE_BOW',    displayName: 'Brave Bow',    type: 'BOW',   rank: 'B', might: 8,  hit: 70, critBonus: 0, weight: 9,  maxDurability: 20, range: [2,2], brave: true,  isHoly: false },
  { id: 'BOLTING',      displayName: 'Bolting',      type: 'THUNDER', rank: 'B', might: 12, hit: 60, critBonus: 5, weight: 12, maxDurability: 8, range: [3,10], brave: false, isHoly: false },
  { id: 'METEOR',       displayName: 'Meteor',       type: 'FIRE',  rank: 'B', might: 12, hit: 60, critBonus: 0, weight: 12, maxDurability: 8,  range: [3,10], brave: false, isHoly: false },
  { id: 'CURAGA',       displayName: 'Curaga',       type: 'STAFF', rank: 'B', might: 0,  hit: 100, critBonus: 0, weight: 4, maxDurability: 20, range: [1,1], brave: false, isHoly: false },
  { id: 'SLEEP_STAFF',  displayName: 'Sleep',        type: 'STAFF', rank: 'B', might: 0,  hit: 60, critBonus: 0, weight: 5,  maxDurability: 15, range: [1,1], brave: false, isHoly: false },
  // ── A Rank ───────────────────────────────────────────────────────
  { id: 'WYRMSLAYER',   displayName: 'Wyrmslayer',   type: 'SWORD', rank: 'A', might: 8,  hit: 85, critBonus: 0, weight: 8,  maxDurability: 20, range: [1,1], brave: false, isHoly: false },
  // ── Holy ─────────────────────────────────────────────────────────
  {
    id: 'MISTOLTIN', displayName: 'Mistoltin', type: 'SWORD', rank: 'HOLY',
    might: 20, hit: 80, critBonus: 30, weight: 7, maxDurability: 50,
    range: [1,1], brave: false, isHoly: true,
    holyBlood: HolyBlood.ODO, bloodRankRequired: BloodRank.MINOR,
    statBonus: { str: 10 },
  },
  {
    id: 'GÁEBOLG', displayName: 'Gae Bolg', type: 'LANCE', rank: 'HOLY',
    might: 20, hit: 70, critBonus: 10, weight: 13, maxDurability: 50,
    range: [1,2], brave: false, isHoly: true,
    holyBlood: HolyBlood.NEIR, bloodRankRequired: BloodRank.MINOR,
    statBonus: { hp: 20 },
  },
];

export const WEAPONS_BY_ID: Record<string, WeaponDefinition> =
  Object.fromEntries(WEAPONS.map(w => [w.id, w]));
