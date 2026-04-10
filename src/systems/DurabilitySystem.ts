import type { WeaponDefinition } from '@/types/ItemDefinition';
import type { LoadoutSlot } from '@/types/HeroData';

/**
 * Reduce weapon durability by 1 after a combat round.
 * Returns the updated slot, or null if the weapon BREAKS (should be spliced from loadout).
 * DISABLED weapons stay in slot at 0 dur and cannot be equipped.
 */
export function consumeDurability(
  def: WeaponDefinition,
  slot: LoadoutSlot,
): LoadoutSlot | null {
  const next = slot.currentDurability - 1;
  if (next > 0) return { ...slot, currentDurability: next };
  if (def.onBreak === 'DISABLED') return { ...slot, currentDurability: 0 };
  return null; // BREAKS — caller must remove from loadout
}

/**
 * Apply post-combat durability to both attacker and defender (if defender used a weapon).
 * Mutates heroData.combatLoadout in place.
 */
export function applyPostCombatDurability(
  atkSlotIndex: number,
  atkLoadout: LoadoutSlot[],
  atkDef: WeaponDefinition,
  defSlotIndex: number | null,
  defLoadout: LoadoutSlot[],
  defDef: WeaponDefinition | null,
): void {
  // Attacker weapon
  const atkResult = consumeDurability(atkDef, atkLoadout[atkSlotIndex]);
  if (atkResult === null) {
    atkLoadout.splice(atkSlotIndex, 1); // BREAKS
  } else {
    atkLoadout[atkSlotIndex] = atkResult;
  }

  // Defender weapon (only if they countered)
  if (defSlotIndex !== null && defDef !== null) {
    const defResult = consumeDurability(defDef, defLoadout[defSlotIndex]);
    if (defResult === null) {
      defLoadout.splice(defSlotIndex, 1); // BREAKS
    } else {
      defLoadout[defSlotIndex] = defResult;
    }
  }
}
