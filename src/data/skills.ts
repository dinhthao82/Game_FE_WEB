import type { SkillTrigger } from '@/types';

export interface SkillDefinition {
  id:          string;
  displayName: string;
  trigger:     SkillTrigger;
  mpCost:      number;
  description: string;
}

export const SKILLS: SkillDefinition[] = [
  // ── Dark Knight / Paladin ──────────────────────────────────────
  { id: 'DARKWAVE',    displayName: 'Darkwave',    trigger: 'PASSIVE', mpCost: 0, description: '+20% damage; lose 10% max HP per attack. Deactivates if HP <= 10% max HP.' },
  { id: 'SHADOW_STEP', displayName: 'Shadow Step', trigger: 'ACTIVE',  mpCost: 3, description: 'Teleport to any tile within 3 spaces.' },
  { id: 'COVER',       displayName: 'Cover',       trigger: 'PASSIVE', mpCost: 0, description: 'Intercept one lethal hit for an adjacent ally per round.' },
  { id: 'HOLY_BLADE',  displayName: 'Holy Blade',  trigger: 'ACTIVE',  mpCost: 3, description: 'Holy damage; heal adjacent allies for 50% of damage dealt.' },
  { id: 'DIVINE_VEIL', displayName: 'Divine Veil', trigger: 'PASSIVE', mpCost: 0, description: '+50% resistance to Dark-type damage.' },
  // ── Dragoon ───────────────────────────────────────────────────
  { id: 'JUMP',        displayName: 'Jump',        trigger: 'ACTIVE',  mpCost: 0, description: 'Skip turn; next turn land dealing 2.5x ATK. Untargetable while airborne.' },
  { id: 'LANCE_PARRY', displayName: 'Lance Parry', trigger: 'PASSIVE', mpCost: 0, description: '25% chance to nullify incoming physical hit when equipped with a Lance.' },
  { id: 'WYRMKIN',     displayName: 'Wyrmkin',     trigger: 'PASSIVE', mpCost: 0, description: 'Immune to Dragon-type enemy abilities.' },
  // ── Monk ──────────────────────────────────────────────────────
  { id: 'FOCUS',       displayName: 'Focus',       trigger: 'ACTIVE',  mpCost: 0, description: 'Skip movement; next attack deals 3x damage.' },
  { id: 'CHAKRA',      displayName: 'Chakra',      trigger: 'ACTIVE',  mpCost: 2, description: 'Restore 25% max HP.' },
  { id: 'COUNTER',     displayName: 'Counter',     trigger: 'PASSIVE', mpCost: 0, description: '40% chance to counter-attack after receiving physical damage.' },
  // ── Ninja ─────────────────────────────────────────────────────
  { id: 'THROW',       displayName: 'Throw',       trigger: 'ACTIVE',  mpCost: 0, description: 'Sacrifice a consumable item for ranged 3-tile damage (goldValue / 10).' },
  { id: 'SMOKE_BOMB',  displayName: 'Smoke Bomb',  trigger: 'ACTIVE',  mpCost: 1, description: 'Untargetable for 1 turn; can still act.' },
  { id: 'DUAL_WIELD',  displayName: 'Dual Wield',  trigger: 'PASSIVE', mpCost: 0, description: 'Off-hand weapon slot; off-hand strikes deal 60% damage.' },
  // ── Knight ────────────────────────────────────────────────────
  { id: 'PROTECT',     displayName: 'Protect',     trigger: 'ACTIVE',  mpCost: 0, description: 'Adjacent ally gains +50% DEF until next Knight turn.' },
  { id: 'SENTINEL',    displayName: 'Sentinel',    trigger: 'PASSIVE', mpCost: 0, description: 'ZOC: enemies must stop when entering an adjacent tile.' },
  { id: 'TAUNT',       displayName: 'Taunt',       trigger: 'ACTIVE',  mpCost: 0, description: 'Force enemies within 3 tiles to target this unit for 1 turn.' },
  // ── Hunter ────────────────────────────────────────────────────
  { id: 'AIMED_SHOT',  displayName: 'Aimed Shot',  trigger: 'ACTIVE',  mpCost: 2, description: 'Ignores terrain DEF and shield bonuses.' },
  { id: 'ANIMAL_LORE', displayName: 'Animal Lore', trigger: 'PASSIVE', mpCost: 0, description: '+30% damage vs Beast-type enemies.' },
  { id: 'BARRAGE',     displayName: 'Barrage',     trigger: 'ACTIVE',  mpCost: 4, description: 'Hit 3 targets in a line; each hit deals 70% damage.' },
  // ── Bard / Troubadour ─────────────────────────────────────────
  { id: 'SALVE',        displayName: 'Salve',        trigger: 'ACTIVE',  mpCost: 0, description: 'Use an item on an ally up to 2 tiles away.' },
  { id: 'SERENADE',     displayName: 'Serenade',     trigger: 'ACTIVE',  mpCost: 2, description: 'Adjacent allies recover 10% max HP/turn for 2 turns.' },
  { id: 'ELEGY',        displayName: 'Elegy',        trigger: 'ACTIVE',  mpCost: 3, description: 'Target enemy -20% ATK/MAG for 2 turns.' },
  { id: 'BATTLE_HYMN',  displayName: 'Battle Hymn',  trigger: 'ACTIVE',  mpCost: 4, description: 'Allies within 3 tiles gain +15% ATK for 2 turns.' },
  { id: 'REQUIEM',      displayName: 'Requiem',      trigger: 'ACTIVE',  mpCost: 5, description: 'Undead/Ghost enemies in range take 30% max HP as Holy damage.' },
  // ── Machinist / Engineer ──────────────────────────────────────
  { id: 'ANALYZE',      displayName: 'Analyze',      trigger: 'ACTIVE',  mpCost: 1, description: 'Reveal enemy hidden stats (HP, resist, weakness).' },
  { id: 'AUTO_CROSSBOW',displayName: 'Auto-Crossbow',trigger: 'ACTIVE',  mpCost: 3, description: '5 hits on random enemies in range; each hit 40% damage.' },
  { id: 'REPAIR',       displayName: 'Repair',       trigger: 'ACTIVE',  mpCost: 2, description: 'Remove 1 debuff from ally or restore a D/C rank disabled weapon.' },
  // ── White Mage / Archbishop ───────────────────────────────────
  { id: 'BLESSING',     displayName: 'Blessing',     trigger: 'PASSIVE', mpCost: 0, description: 'All healing spells +15%.' },
  { id: 'HOLY_WARD',    displayName: 'Holy Ward',    trigger: 'ACTIVE',  mpCost: 4, description: 'Target ally is immune to 1 status ailment for 3 turns.' },
  // ── Black Mage / Archmage ─────────────────────────────────────
  { id: 'AMPLIFY',      displayName: 'Amplify',      trigger: 'PASSIVE', mpCost: 0, description: '+10% magic damage per consecutive spell this battle (max +30%).' },
  { id: 'MP_BURST',     displayName: 'MP Burst',     trigger: 'ACTIVE',  mpCost: 0, description: 'Spend 20% max HP to recover the same amount in MP.' },
  // ── Summoner / Caller ─────────────────────────────────────────
  { id: 'LUNAR_BOND',   displayName: 'Lunar Bond',   trigger: 'PASSIVE', mpCost: 0, description: 'Summon damage +20%.' },
  { id: 'PHASE',        displayName: 'Phase',        trigger: 'ACTIVE',  mpCost: 3, description: 'Dismiss summon early and recover 50% of MP spent.' },
  { id: 'ECHO_CALL',    displayName: 'Echo Call',    trigger: 'PASSIVE', mpCost: 0, description: '25% chance any summon triggers twice.' },
  // ── Mystic / Sage ─────────────────────────────────────────────
  { id: 'ARCANE_INSIGHT',displayName: 'Arcane Insight',trigger: 'PASSIVE',mpCost: 0, description: 'Can cast both White and Black magic at 80% potency.' },
  { id: 'FOCUS_MAGIC',  displayName: 'Focus Magic',  trigger: 'ACTIVE',  mpCost: 2, description: 'Next spell costs 0 MP.' },
  { id: 'TWINCAST',     displayName: 'Twincast',     trigger: 'ACTIVE',  mpCost: 0, description: 'Cast 2 spells in one action (+50% MP cost).' },
  { id: 'CAPACITY',     displayName: 'Capacity',     trigger: 'PASSIVE', mpCost: 0, description: 'MP pool = 120% of base.' },
];

export const SKILL_BY_ID: Record<string, SkillDefinition> =
  Object.fromEntries(SKILLS.map(s => [s.id, s]));
