# Class System Plan (FF4-Inspired)

## Promotion Rules
- Level tối thiểu **10** để promote (base class level 10–20)
- Promote **1 lần duy nhất**
- Level **RESET về 1** sau promote
- Giữ lại tất cả skill đã học, gain thêm promoted class skills

### Promotion Level Bonus — Stat Growth

Cấp promote càng cao → stat growth rate của promoted class càng cao.
Chênh lệch tối đa **+50%** growth rate giữa promote L10 và promote L20.

```
growthMultiplier = 1 + (promotionLevel - 10) / 10 × 0.5

promotionLevel 10 → ×1.00  (baseline, +0%)
promotionLevel 15 → ×1.25  (+25%)
promotionLevel 20 → ×1.50  (+50%)
```

Áp dụng lên **tất cả stat growth rates** của promoted class:

```typescript
function applyPromotionGrowthBonus(
  baseGrowths: StatGrowths,
  promotionLevel: number        // 10–20
): StatGrowths {
  const multiplier = 1 + (promotionLevel - 10) / 10 * 0.5;
  return Object.fromEntries(
    Object.entries(baseGrowths).map(([stat, rate]) => [
      stat,
      Math.min(100, Math.round(rate * multiplier))
    ])
  ) as StatGrowths;
}
```

**Ví dụ — Dark Knight → Paladin:**

| Stat | Growth gốc | Promote L10 | Promote L15 | Promote L20 |
|------|-----------|-------------|-------------|-------------|
| STR | 65% | 65% | 81% | 98% |
| DEF | 55% | 55% | 69% | 83% |
| HP | 80% | 80% | 100% | 100% (cap) |

> Flat stat bonus khi promote vẫn apply như cũ (không thay đổi theo level).

---

## Physical Base Classes

| Class ID | Name | FF4 Archetype | Move | Weapons | Growth Focus |
|----------|------|--------------|------|---------|--------------|
| `DARK_KNIGHT` | Dark Knight | Cecil (pre) | Walk 4 | Sword, Axe | STR, DEF, HP |
| `DRAGOON` | Dragoon | Kain | Walk 4 | Lance | STR, HP |
| `MONK` | Monk | Yang | Walk 4 | Fist, Club | STR, SPD |
| `NINJA` | Ninja | Edge | Walk 5 | Sword, Thrown | SPD, STR |
| `KNIGHT` | Knight | — | Walk 3 | Sword | DEF, HP |
| `HUNTER` | Hunter | — | Walk 4 | Bow | SPD, SKL |
| `BARD` | Bard | Edward | Walk 4 | Harp | SPD, LCK |
| `MACHINIST` | Machinist | Cid | Walk 3 | Hammer | SKL, DEF |

## Magic Base Classes

| Class ID | Name | FF4 Archetype | Move | Weapons | Growth Focus |
|----------|------|--------------|------|---------|--------------|
| `WHITE_MAGE` | White Mage | Rosa | Walk 3 | Rod, Staff | RES, MAG |
| `BLACK_MAGE` | Black Mage | Rydia (child) | Walk 3 | Rod | MAG, SPD |
| `SUMMONER` | Summoner | Rydia (adult) | Walk 3 | Rod | MAG, RES |
| `CALLER` | Caller | Rydia (early) | Walk 3 | Rod | MAG |
| `MYSTIC` | Mystic | Tellah | Walk 3 | Staff | RES, MAG |

---

## Promotion Tree

```
Dark Knight   ──[Lustrous Crystal]──→  Paladin         (Hybrid)
Dragoon       ──[Spear of Dragoon]──→  Holy Dragoon    (Physical)
Monk          ──[Power Sash]────────→  Master Monk     (Physical)
Ninja         ──[Shadow Blade]──────→  Edge Master     (Physical)
Knight        ──[Knight's Crest]────→  Grand Knight    (Physical)
Hunter        ──[Eagle Feather]─────→  Sniper          (Physical)
Bard          ──[Silver Harp]───────→  Troubadour      (Hybrid)
Machinist     ──[Clockwork Gear]────→  Engineer        (Physical)
White Mage    ──[Holy Water]────────→  Archbishop      (Magic)
Black Mage    ──[Dark Crystal]──────→  Archmage        (Magic)
Black Mage  ─┐
Mystic      ─┴──[Forbidden Tome]───→  Sage             (Hybrid)
Caller      ────[Lunar Tear]───────→  Eidolon Master   (Magic)
Summoner    ────[Lunar Tear]───────→  Eidolon Master   (Magic)
Caller      ────[Summoner's Crest]─→  Summoner         (Magic)  ← base→base promotion
```

> `Caller → Summoner` là ngoại lệ duy nhất: base → base (không phải base → promoted).
> Sau đó Summoner có thể tiếp tục promote → Eidolon Master bình thường.

---

## Stat Growth Rates (% chance +1 per level)

```
Class         | HP  | STR | MAG | DEF | RES | SPD | SKL | LCK |
DARK_KNIGHT   | 80  | 65  | 10  | 55  | 20  | 35  | 45  | 25  |
DRAGOON       | 75  | 60  |  5  | 45  | 15  | 40  | 50  | 30  |
MONK          | 85  | 70  |  5  | 35  | 10  | 55  | 55  | 20  |
NINJA         | 55  | 50  | 15  | 25  | 20  | 80  | 65  | 50  |
KNIGHT        | 90  | 50  |  5  | 80  | 30  | 20  | 35  | 20  |
HUNTER        | 60  | 45  | 10  | 30  | 25  | 55  | 75  | 40  |
BARD          | 45  | 20  | 20  | 20  | 35  | 60  | 40  | 75  |
MACHINIST     | 65  | 40  | 10  | 50  | 30  | 35  | 70  | 35  |
WHITE_MAGE    | 40  | 10  | 55  | 20  | 70  | 40  | 30  | 45  |
BLACK_MAGE    | 35  |  5  | 80  | 10  | 40  | 50  | 40  | 30  |
SUMMONER      | 40  |  5  | 75  | 15  | 55  | 35  | 35  | 40  |
CALLER        | 35  |  5  | 65  | 10  | 45  | 30  | 30  | 35  |
MYSTIC        | 40  | 10  | 60  | 15  | 60  | 40  | 35  | 40  |
```

Promoted class growths = base class growths × promotionLevelMultiplier (tính lúc promote, lưu vào hero).
ClassDefinition.growths là growths GỐC (chưa nhân hệ số). Multiplier là runtime modifier lưu trên HeroData.

## Promotion Stat Bonus (flat, one-time on promote)

```
Base → Promoted       | HP  | STR | MAG | DEF | RES | SPD |
DARK_KNIGHT→PALADIN   | +8  | +3  | +5  | +3  | +5  |  0  |
DRAGOON→HOLY_DRAGOON  | +5  | +5  |  0  | +4  |  0  | +2  |
MONK→MASTER_MONK      | +5  | +7  |  0  | +2  |  0  | +4  |
NINJA→EDGE_MASTER     | +3  | +3  | +2  | +1  | +2  | +5  |
KNIGHT→GRAND_KNIGHT   | +8  | +3  |  0  | +7  | +2  | +1  |
HUNTER→SNIPER         | +3  | +3  | +1  | +2  | +2  | +3  |
BARD→TROUBADOUR       | +2  | +1  | +4  | +1  | +4  | +4  |
MACHINIST→ENGINEER    | +4  | +3  | +2  | +4  | +2  | +2  |
WHITE_MAGE→ARCHBISHOP | +3  |  0  | +5  | +2  | +7  | +2  |
BLACK_MAGE→ARCHMAGE   | +2  |  0  | +8  |  0  | +3  | +3  |
SUMMONER→EIDOLON_MST  | +3  |  0  | +7  | +1  | +5  | +2  |
CALLER→EIDOLON_MST    | +4  |  0  | +7  | +1  | +5  | +2  |
MYSTIC→SAGE           | +3  | +1  | +6  | +1  | +6  | +2  |
BLACK_MAGE→SAGE       | +4  | +1  | +7  | +1  | +5  | +2  |
```

---

## Class Skills

### Physical Classes

**DARK_KNIGHT**
| Skill | Type | Effect |
|-------|------|--------|
| DARKWAVE | Passive | +20% damage; tự trừ 10% max HP mỗi attack |
| SHADOW_STEP | Active (3 MP) | Teleport đến bất kỳ tile nào trong 3 ô |
| COVER | Passive | Intercept lethal hit cho ally kề (1 lần/round) |

**DRAGOON**
| Skill | Type | Effect |
|-------|------|--------|
| JUMP | Active (0 MP) | Spend turn; next turn land 2.5× ATK, untargetable while airborne |
| LANCE_PARRY | Passive | 25% chance nullify incoming physical khi equipped lance |
| WYRMKIN | Passive | Immune Dragon-type enemy abilities |

**MONK**
| Skill | Type | Effect |
|-------|------|--------|
| FOCUS | Active (0 MP) | Skip move this turn; next attack ×3 damage |
| CHAKRA | Active (2 MP) | Restore 25% max HP |
| COUNTER | Passive | 40% chance counter-attack sau khi nhận physical damage |

**NINJA**
| Skill | Type | Effect |
|-------|------|--------|
| THROW | Active (0 MP) | Sacrifice consumable item → ranged 3-tile damage (goldValue ÷ 10) |
| SMOKE_BOMB | Active (1 MP) | Untargetable 1 turn; vẫn có thể act |
| DUAL_WIELD | Passive | Off-hand weapon slot; off-hand attack = 60% damage |

**KNIGHT**
| Skill | Type | Effect |
|-------|------|--------|
| PROTECT | Active (0 MP) | Adjacent ally +50% DEF đến lượt Knight tiếp theo |
| SENTINEL | Passive | ZOC: enemies phải dừng khi vào tile kề Knight |
| TAUNT | Active (0 MP) | Force enemies trong 3 tile target Knight 1 turn |

**HUNTER**
| Skill | Type | Effect |
|-------|------|--------|
| AIMED_SHOT | Active (2 MP) | Bỏ qua terrain def và shield bonus |
| ANIMAL_LORE | Passive | +30% damage vs Beast-type enemies |
| BARRAGE | Active (4 MP) | Hit 3 targets theo line; mỗi hit 70% damage |

**BARD**
| Skill | Type | Effect |
|-------|------|--------|
| SALVE | Active (0 MP) | Dùng item cho ally từ 2 ô thay vì phải kề |
| SERENADE | Active (2 MP) | Allies kề recover 10% max HP/turn trong 2 turns |
| ELEGY | Active (3 MP) | Target enemy -20% ATK/MAG trong 2 turns |

**MACHINIST**
| Skill | Type | Effect |
|-------|------|--------|
| ANALYZE | Active (1 MP) | Reveal enemy hidden stats (HP, resist, weakness) |
| AUTO_CROSSBOW | Active (3 MP) | 5 hits random enemies trong range; mỗi hit 40% damage |
| REPAIR | Active (2 MP) | Remove 1 debuff từ ally hoặc restore disabled weapon (D/C rank) |

### Magic Classes

**WHITE_MAGE**
| Skill | Type | Effect |
|-------|------|--------|
| BLESSING | Passive | Tất cả heal spells +15% |
| HOLY_WARD | Active (4 MP) | Target ally immune 1 status ailment trong 3 turns |

Spells (by level): CURE (L1), HOLD (L3), CURA (L5), ESUNA (L7), CURAGA (L9+)

**BLACK_MAGE**
| Skill | Type | Effect |
|-------|------|--------|
| AMPLIFY | Passive | +10% magic damage per consecutive spell this battle (max +30%) |
| MP_BURST | Active (0 MP) | Spend 20% max HP → recover same amount in MP |

Spells (by level): FIRE/BLIZZARD/THUNDER (L1–3), upgraded tiers (L7), FLARE (L9+)

**SUMMONER**
| Skill | Type | Effect |
|-------|------|--------|
| LUNAR_BOND | Passive | Summon damage +20% |
| PHASE | Active (3 MP) | Dismiss summon early → recover 50% MP spent |

Summons: CHOCOBO (L1), SHIVA (L3), IFRIT (L5), RAMUH (L7), BAHAMUT (L12 Eidolon Master)

**CALLER** (sub-archetype → promotes to Summoner or Eidolon Master)
| Skill | Type | Effect |
|-------|------|--------|
| ECHO_CALL | Passive | 25% chance any summon triggers twice |

Access: CHOCOBO, SHIVA only until promoted.

**MYSTIC** (sub-archetype → promotes to Sage)
| Skill | Type | Effect |
|-------|------|--------|
| ARCANE_INSIGHT | Passive | Có thể cast cả white và black magic (80% potency) |
| FOCUS_MAGIC | Active (2 MP) | Next spell costs 0 MP |

### Promoted Class Skills

**PALADIN** (from Dark Knight)
Giữ: SHADOW_STEP, COVER | Xóa: DARKWAVE
| Skill | Type | Effect |
|-------|------|--------|
| HOLY_BLADE | Active (3 MP) | Holy damage; heal adjacent allies 50% of damage dealt |
| DIVINE_VEIL | Passive | +50% resistance to Dark-type damage |
| CURE_LIGHT | Spell | Cast CURE at 70% potency |

**SAGE** (from Mystic hoặc Black Mage)
| Skill | Type | Effect |
|-------|------|--------|
| TWINCAST | Active (+50% MP) | Cast 2 spells trong 1 action |
| CAPACITY | Passive | MP pool = 120% of base |

Full access to both Black Mage + White Mage spell lists (tier phụ thuộc level khi promote).

**TROUBADOUR** (from Bard)
Giữ: SALVE, SERENADE, ELEGY
| Skill | Type | Effect |
|-------|------|--------|
| BATTLE_HYMN | Active (4 MP) | Allies trong 3 tile +15% ATK trong 2 turns |
| REQUIEM | Active (5 MP) | Undead/Ghost enemies trong range: 30% max HP holy damage |

---

## ClassDefinition Schema

```typescript
interface ClassDefinition {
  id: HeroClass;
  displayName: string;
  category: ClassCategory;         // PHYSICAL | MAGIC | HYBRID
  isBaseClass: boolean;
  movementType: MovementType;      // WALK | CAVALRY | FLY | ARMORED
  movementRange: number;
  usableWeapons: WeaponType[];
  baseStats: StatBlock;            // Starting stats at L1
  growths: StatGrowths;
  classSkills: SkillDefinition[];
  promotionPaths: PromotionPath[]; // empty if already promoted
  promotedFrom: HeroClass | null;
  alternatePromotionSources: HeroClass[]; // e.g. SAGE từ cả MYSTIC và BLACK_MAGE
}

interface PromotionPath {
  promotedClass: HeroClass;
  requiredItem: PromotionItem;
  requiredLevel: number;           // default 10
  statBonus: Partial<StatBlock>;
}
```
