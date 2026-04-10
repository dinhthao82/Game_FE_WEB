import type { WeaponType } from '@/types';
import type { HeroData } from '@/types/HeroData';
import type { WeaponDefinition } from '@/types/ItemDefinition';
import { TERRAIN } from '@/data/terrain';
import type { TerrainType } from '@/types';

// ── Weapon triangle ──────────────────────────────────────────────────
const PHYSICAL_CYCLE: WeaponType[] = ['SWORD', 'AXE', 'LANCE'];
const MAGIC_CYCLE:    WeaponType[] = ['FIRE', 'WIND', 'THUNDER'];
const LIGHT_TYPES:    WeaponType[] = ['LIGHT'];
const DARK_TYPES:     WeaponType[] = ['DARK'];

type TriangleResult = { atkBonus: number; hitBonus: number };

function getTriangle(atk: WeaponType, def: WeaponType): TriangleResult {
  // Light vs Dark
  if (LIGHT_TYPES.includes(atk) && DARK_TYPES.includes(def)) return { atkBonus: 3, hitBonus: 20 };

  const physIdx = (t: WeaponType) => PHYSICAL_CYCLE.indexOf(t);
  const magIdx  = (t: WeaponType) => MAGIC_CYCLE.indexOf(t);

  const ai = physIdx(atk), di = physIdx(def);
  if (ai >= 0 && di >= 0) {
    if ((ai + 1) % 3 === di) return { atkBonus:  1, hitBonus:  15 };
    if ((di + 1) % 3 === ai) return { atkBonus: -1, hitBonus: -15 };
  }

  const ami = magIdx(atk), dmi = magIdx(def);
  if (ami >= 0 && dmi >= 0) {
    if ((ami + 1) % 3 === dmi) return { atkBonus:  1, hitBonus:  15 };
    if ((dmi + 1) % 3 === ami) return { atkBonus: -1, hitBonus: -15 };
  }

  return { atkBonus: 0, hitBonus: 0 };
}

// ── 2RN True Hit ─────────────────────────────────────────────────────
function trueHit(displayHit: number, rng: () => number): boolean {
  const r1 = rng() * 100;
  const r2 = rng() * 100;
  return (r1 + r2) / 2 < displayHit;
}

// ── Single strike result ─────────────────────────────────────────────
export interface StrikeResult {
  hit:    boolean;
  crit:   boolean;
  damage: number;
}

export interface CombatForecast {
  attackerStrikes: number;
  defenderStrikes: number;
  attackerDamage:  number;
  defenderDamage:  number;
  attackerHit:     number;
  defenderHit:     number;
  attackerCrit:    number;
  defenderCrit:    number;
}

export function calcDamage(
  attacker: HeroData,
  defender: HeroData,
  weapon:   WeaponDefinition,
  defWeapon: WeaponDefinition | null,
  defTerrain: TerrainType,
): CombatForecast {
  const ats = attacker.stats;
  const dfs = defender.stats;
  const terrainDef   = TERRAIN[defTerrain].defBonus;
  const terrainAvoid = TERRAIN[defTerrain].avoidBonus;

  const tri = defWeapon ? getTriangle(weapon.type, defWeapon.type) : { atkBonus: 0, hitBonus: 0 };

  // Damage
  const MAGIC_WEAPON_TYPES = ['FIRE','BLIZZARD','THUNDER','WIND','LIGHT','DARK','SUMMON'];
  const isPhys = !MAGIC_WEAPON_TYPES.includes(weapon.type);
  const rawAtk   = (isPhys ? ats.str : ats.mag) + weapon.might + tri.atkBonus;
  const rawDef   = isPhys ? dfs.def + terrainDef : dfs.res;
  const atkDmg   = Math.max(0, rawAtk - rawDef);

  // Defender counter (if defWeapon exists)
  let defDmg = 0;
  if (defWeapon) {
    const defIsPhys = !MAGIC_WEAPON_TYPES.includes(defWeapon.type);
    const defRawAtk = (defIsPhys ? dfs.str : dfs.mag) + defWeapon.might - tri.atkBonus;
    const defRawDef = defIsPhys ? ats.def : ats.res;
    defDmg = Math.max(0, defRawAtk - defRawDef);
  }

  // Hit
  const atkHit   = Math.min(100, ats.skl * 2 + Math.floor(ats.lck / 2) + weapon.hit + tri.hitBonus);
  const defAvoid  = dfs.spd * 2 + Math.floor(dfs.lck / 2) + terrainAvoid;
  const displayHit = Math.max(0, atkHit - defAvoid);

  let defHit = 0;
  if (defWeapon) {
    const dh = Math.min(100, dfs.skl * 2 + Math.floor(dfs.lck / 2) + defWeapon.hit - tri.hitBonus);
    defHit = Math.max(0, dh - (ats.spd * 2 + Math.floor(ats.lck / 2)));
  }

  // Crit
  const atkCrit = Math.max(0, Math.floor(ats.skl / 2) + weapon.critBonus - dfs.lck);
  const defCrit = defWeapon ? Math.max(0, Math.floor(dfs.skl / 2) + defWeapon.critBonus - ats.lck) : 0;

  // Double attack
  // Brave = 2 extra strikes (4 total per round if not doubled, as per plan)
  const atkDoubles = ats.spd - dfs.spd >= 4;
  const defDoubles = defWeapon && dfs.spd - ats.spd >= 4;
  const atkBrave   = weapon.brave    ? 3 : 0;   // +3 → total 4 hits
  const defBrave   = defWeapon?.brave ? 3 : 0;

  return {
    attackerStrikes: 1 + atkBrave + (atkDoubles ? 1 : 0),
    defenderStrikes: defWeapon ? 1 + defBrave + (defDoubles ? 1 : 0) : 0,
    attackerDamage:  atkDmg,
    defenderDamage:  defDmg,
    attackerHit:     displayHit,
    defenderHit:     defHit,
    attackerCrit:    atkCrit,
    defenderCrit:    defCrit,
  };
}

export function resolveStrike(hitChance: number, damage: number, critChance: number, rng: () => number): StrikeResult {
  const hit  = trueHit(hitChance, rng);
  const crit = hit && rng() * 100 < critChance;
  return { hit, crit, damage: hit ? (crit ? damage * 3 : damage) : 0 };
}
