import type { HeroData } from '@/types/HeroData';
import type { StatGrowths } from '@/types/StatBlock';

const XP_PER_LEVEL = 100;
const MAX_LEVEL    = 20;

/**
 * Calculate XP gained by attacker after a combat exchange.
 * - Base: clamp(20 + (defenderLevel - attackerLevel) * 2, 1, 40)
 * - Kill bonus: +30
 * - Capped at 100 per combat.
 */
export function calcCombatXP(
  attackerLevel: number,
  defenderLevel: number,
  killedDefender: boolean,
): number {
  const base  = Math.max(1, Math.min(40, 20 + (defenderLevel - attackerLevel) * 2));
  const bonus = killedDefender ? 30 : 0;
  return Math.min(XP_PER_LEVEL, base + bonus);
}

/** Stat keys that can increase on level up */
const GROWTH_KEYS: (keyof StatGrowths)[] = ['hp','str','mag','def','res','spd','skl','lck'];

export interface LevelUpResult {
  newLevel: number;
  gains: Partial<Record<keyof StatGrowths, number>>;
}

/**
 * Add XP to a hero. If they reach 100, level them up (roll growths).
 * Returns a LevelUpResult if a level up occurred, null otherwise.
 * Mutates heroData.experience and heroData.stats in place.
 * Does not level past MAX_LEVEL.
 */
export function addExperience(
  hero: HeroData,
  xp: number,
  rng: () => number,
): LevelUpResult | null {
  if (hero.level >= MAX_LEVEL) return null; // level cap — no XP gain

  hero.experience += xp;

  if (hero.experience < XP_PER_LEVEL) return null;

  // Level up
  hero.experience -= XP_PER_LEVEL;
  hero.level      += 1;

  const gains: Partial<Record<keyof StatGrowths, number>> = {};
  const growthsMap = hero.growths as unknown as Record<string, number>;
  const statsMap   = hero.stats   as unknown as Record<string, number>;
  for (const key of GROWTH_KEYS) {
    const growthPct = growthsMap[key] ?? 0;
    if (rng() * 100 < growthPct) {
      statsMap[key] = (statsMap[key] ?? 0) + 1;
      gains[key] = 1;
    }
  }

  // Clamp XP below 100 if cap reached
  if (hero.level >= MAX_LEVEL) hero.experience = 0;

  return { newLevel: hero.level, gains };
}
