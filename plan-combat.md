# Combat System Plan

## Combat Formulas

```
effectiveMight = Weapon.Might + triangleAtkBonus  (±1 từ triangle, ±3 từ LIGHT vs DARK)

Damage (Physical) = STR + effectiveMight - DEF - TerrainDef
Damage (Magic)    = MAG + effectiveMight - RES
Damage (Unarmed)  = STR×2 - DEF - TerrainDef       (Monk — không dùng weapon)
Minimum damage    = 0 (không âm)

Hit%    = SKL×2 + LCK/2 + Weapon.Hit + triangleHitBonus - Avoid
Avoid   = SPD×2 + LCK/2 + TerrainAvoid
TrueHit = (roll1 + roll2) / 2 < Hit%   (2RN system, giảm extreme hit%)

Crit%   = SKL/2 + Weapon.critBonus - Enemy.LCK
CritDmg = Damage × 3

Double (SPD-based) = ATK.SPD - DEF.SPD >= 4 → attacker gets extra strike
```

### Combat Sequence per Round
```
1. Attacker strikes (nếu trong range)
2. Defender counter-strikes (nếu trong range; bỏ qua nếu không có vũ khí phù hợp)
3. Nếu Attacker.SPD - Defender.SPD >= 4 → Attacker strikes thêm lần nữa
4. Nếu Defender.SPD - Attacker.SPD >= 4 → Defender counter thêm lần nữa
   (chỉ 1 trong 2 bên có thể double, không xảy ra đồng thời)

Mỗi bên chỉ double tối đa 1 lần per round.
Bên nào chết trước → combat kết thúc ngay, bước sau bị hủy.
```

### DARKWAVE Self-Damage Rule
```
DARKWAVE trừ 10% max HP sau khi tấn công.
Tự damage KHÔNG thể giết: HP tối thiểu sau DARKWAVE = 1.
Nếu HP <= 10% max HP trước khi attack → DARKWAVE không kích hoạt (passive tắt tạm).
```

---

## Weapon Triangle

> Full weapon list → xem [plan-weapon.md](plan-weapon.md)

```
PHYSICAL triangle:
  Sword > Axe > Lance > Sword
  Advantage: +1 Atk, +15 Hit | Disadvantage: −1 Atk, −15 Hit

MAGIC triangle (riêng biệt):
  Fire > Wind > Thunder > Fire
  Advantage: +1 Atk, +15 Hit | Disadvantage: −1 Atk, −15 Hit

LIGHT vs DARK (one-way, không phải cycle):
  LIGHT beats DARK: +3 Atk, +20 Hit
  DARK không có bonus vs LIGHT

BOW / STAFF: không tham gia triangle

Brave Weapons (Brave Sword/Lance/Axe/Bow):
  Attacker strikes 2 extra times (4 hits total per round if not countered)
  Brave hits tính riêng với SPD-based double attack

Siege Tomes (Meteor, Bolting — range 3–10):
  Defender KHÔNG thể counter-attack (ngoài tầm)
  Attacker KHÔNG thể bị counter từ range đó
```

---

## Weapon System

> Full weapon schema, durability rules, all weapon stats → [plan-weapon.md](plan-weapon.md)
> Holy Weapon Registry → `AccountData.holyWeaponRegistry` (account-level, xem plan-map.md)

---

## Drop System

### Drop Sources

| Source | What drops | When |
|--------|-----------|------|
| Regular enemy | Weapon / Skill Book (rank D–B) | On death, roll per enemy |
| Boss | Rank B guaranteed + bonus roll | On death, always |
| Village | Gold bag or Rank C item | Player unit visits tile |
| Castle capture | Gold + 1 Rank B item | On capture |
| Post-map win | **Add Slot Char** (see rate below) | Sau mỗi map win, totalWins ≥ 50 |

### Add Slot Char Drop
```
Điều kiện: totalWins >= 50
Roll 1 lần sau map win (độc lập với reward hero)

dropRate = 1% + (totalWins - 50) × 0.2%
  Win 50  → 1.0%
  Win 60  → 3.0%
  Win 100 → 11.0%
```

### Drop Roll — Regular Enemy

```
1. Roll drop chance (per-enemy config, e.g. 30%)
2. If pass → roll category:
     60% Weapon
     40% Skill Book
3. Roll rank:
     50% D
     35% C
     15% B
4. Roll specific item from rank pool
5. If Holy → check HolyWeaponRegistry
     exists → reroll excluding Holy
```

### Boss Drop

```
Guaranteed:
  - 1× Rank B Weapon or Skill Book

Bonus drop table:
  30% → Promotion Item (matching boss class archetype)
  25% → Rank A Weapon
  25% → Gold (500–1500g)
  15% → Holy Weapon (if registry allows)
   5% → Rare Skill Book (A-tier skill)
```

### Village Loot Table

```
50% → Gold bag (100–400g)
30% → Rank C Weapon
20% → Rank C Skill Book
```

### Castle Capture Loot

```
Fixed:
  - Gold: 300–800g (scaled by map difficulty)
  - 1× Rank B item (50% Weapon / 50% Skill Book)
```

### resolveDropItem (Holy Guard + Fallback)

```typescript
function resolveDropItem(
  rank: WeaponRank,
  category: 'weapon' | 'skillbook',
  registry: Record<string, boolean>,
  pool: ItemPool
): ItemData | null {  // null = không có gì để drop
  const FALLBACK_RANKS: WeaponRank[] = ['B', 'C', 'D'];

  let candidates = pool.getByRankAndCategory(rank, category);

  if (category === 'weapon') {
    candidates = candidates.filter(item =>
      !item.isHoly || !registry[item.id]
    );
  }

  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Fallback: thử các rank thấp hơn theo thứ tự, không đệ quy
  for (const fallbackRank of FALLBACK_RANKS) {
    if (fallbackRank === rank) continue;
    const fallback = pool.getByRankAndCategory(fallbackRank, category);
    if (fallback.length > 0) return fallback[Math.floor(Math.random() * fallback.length)];
  }

  return null; // Pool hoàn toàn rỗng → không drop gì
}
```

### MP Recovery
```
MP recover theo các cách sau (cần define rõ để tránh magic unit vô dụng):

Between battles:    MP hồi đầy đủ
Between turns:      MP +10% max MP mỗi đầu turn của unit đó
Item:               Ether (recover 30 MP), Hi-Ether (recover 60 MP) — drop từ village/boss
Staff quirk:        Archbishop có passive hồi 5 MP cho caster mỗi lần heal thành công
```
