# Weapon System Plan

---

## Weapon Data Model

```typescript
type WeaponId = string; // e.g. 'IRON_SWORD', 'TYRFING'
type SkillId = string;

enum WeaponType {
  SWORD = 'SWORD', LANCE = 'LANCE', AXE = 'AXE', BOW = 'BOW',
  FIRE = 'FIRE', THUNDER = 'THUNDER', WIND = 'WIND',
  LIGHT = 'LIGHT', DARK = 'DARK',
  STAFF = 'STAFF'
}

enum WeaponRank { D = 0, C = 1, B = 2, A = 3, HOLY = 4 }

// HolyBlood, BloodRank enums — xem section "Holy Blood System" bên dưới

interface WeaponDef {
  id: WeaponId;
  name: string;
  type: WeaponType;
  rank: WeaponRank;
  might: number;                   // damage bonus (0 for Staff/utility)
  hit: number;                     // accuracy bonus (0 for non-combat Staff)
  critBonus: number;               // added to Crit% (e.g. Killer = 30, default = 0)
  weight: number;                  // reduces effective SPD if > unit CON
  range: [number, number];         // [min, max] tile range
  maxDurability: number;           // max uses
  onBreak: 'DISABLED' | 'BREAKS'; // DISABLED for D/C; BREAKS for B/A/HOLY
  brave: boolean;                  // true = each attack slot hits twice
  grantedSkill?: SkillId;          // passive skill while equipped (Holy or special weapons)
  requiredBlood?: { blood: HolyBlood; minRank: BloodRank }; // blood req (Major for Holy, Minor for some A-rank)
  statBonus?: Partial<{ hp: number; str: number; mag: number; def: number; res: number; spd: number; skl: number; lck: number; avoid: number }>; // equip stat bonuses
  sellPrice: number;
  buyPrice: number;                // 0 = not purchasable at shop
  note?: string;
}

// Instance (per hero inventory slot) — tracks current durability
interface WeaponInstance {
  defId: WeaponId;
  currentDurability: number;
}

// Gọi 1 lần sau khi combat sequence kết thúc (không phải per hit)
// Brave/double attack trong cùng 1 combat vẫn chỉ −1 durability
function consumeDurability(def: WeaponDef, inst: WeaponInstance): WeaponInstance | null {
  const next = inst.currentDurability - 1;
  if (next > 0) return { ...inst, currentDurability: next };
  if (def.onBreak === 'DISABLED') return { ...inst, currentDurability: 0 };
  return null; // BREAKS → caller removes from loadout
}
```

---

## Weapon Triangle

```
PHYSICAL:
  Sword → beats → Axe → beats → Lance → beats → Sword
  Advantage: +1 Atk, +15 Hit | Disadvantage: −1 Atk, −15 Hit

MAGIC:
  Fire → beats → Wind → beats → Thunder → beats → Fire
  Advantage: +1 Atk, +15 Hit | Disadvantage: −1 Atk, −15 Hit

LIGHT vs DARK (one-way, không phải cycle):
  LIGHT beats DARK: +3 Atk, +20 Hit
  DARK không nhận bonus nào vs LIGHT

BOW / STAFF: không tham gia triangle
UNARMED (Monk): không tham gia triangle
```

### Brave Weapon Rule
```
brave=true: mỗi attack SLOT đánh 2 lần thay vì 1

Combat sequence với Brave Sword (attacker dùng Brave):
  Slot 1: Attacker hits ×2   (brave)
  Slot 2: Defender counters ×1
  Slot 3: Nếu ATK.SPD - DEF.SPD >= 4 → Attacker hits ×2 lại (brave + double)
  Slot 4: Nếu DEF.SPD - ATK.SPD >= 4 → Defender counters ×2 (brave không áp dụng cho defender
           trừ khi defender cũng dùng brave weapon)

Brave + SPD double: attacker có thể hit 4 lần total (2+2)
Defender brave: chỉ apply nếu defender equip brave weapon và counter trong tầm

Brave durability: −1 per combat (không quan tâm bao nhiêu hits trong trận)
  → Brave Sword 2 hits = −1 durability
  → Brave Sword + SPD double (4 hits) = −1 durability
```

### Offensive Staff Rules (SLEEP, SILENCE)
```
Offensive staffs (SLEEP, SILENCE) work differently from healing staffs:
  - Defender CANNOT counter-attack
  - Hit% applies: Hit% = SKL×2 + LCK/2 + weapon.hit - target.Avoid (no triangle bonus)
  - No crit possible (critBonus always = 0 for staffs)
  - Durability: −1 per combat (dù hit hay miss)
  - DISABLED at 0 durability (Rank C → onBreak: 'DISABLED')
  - If target is immune to status (e.g. HOLY_WARD active): staff still loses durability
```

### Monk Unarmed
```
Monk / Master Monk không equip weapon (combatLoadout slot 1 = empty)
Damage = STR×2 - DEF - TerrainDef  (xem plan-combat.md)
Không tham gia weapon triangle
Không bị weapon durability
Class skills (FOCUS, COUNTER, CHAKRA) không cần weapon
```

---

---

## All Weapons — Physical

### Swords

| ID | Name | Rank | Mt | Hit | Wt | Range | Dur | Note |
|----|------|------|----|-----|----|-------|-----|------|
| IRON_SWORD | Iron Sword | D | 5 | 90 | 3 | 1 | 50 | |
| STEEL_SWORD | Steel Sword | C | 8 | 85 | 5 | 1 | 50 | |
| SILVER_SWORD | Silver Sword | B | 12 | 90 | 7 | 1 | 30 | |
| BRAVE_SWORD | Brave Sword | A | 8 | 75 | 8 | 1 | 20 | brave=true (×2 hits per slot) |
| KILLER_SWORD | Killer Sword | B | 9 | 75 | 5 | 1 | 20 | critBonus=30 |
| ARMORSLAYER | Armorslayer | C | 8 | 80 | 7 | 1 | 20 | ×3 damage vs Armored type |
| LIGHT_SWORD | Light Sword | B | 9 | 80 | 4 | 1–2 | 20 | Uses MAG formula not STR |
| WO_DAO | Wo Dao | A | 9 | 75 | 3 | 1 | 20 | critBonus=20; Minor Odo blood |
| TYRFING | Tyrfing | HOLY | 20 | 100 | 5 | 1 | 30 | statBonus: +20 Res; grants Nihil; Major Baldur |
| MISTOLTIN | Mistoltin | HOLY | 30 | 80 | 10 | 1 | 30 | Grants Wrath+Astra; Major Odo |
| BALMUNG | Balmung | HOLY | 30 | 80 | 5 | 1 | 30 | Grants Adept+Crit; Major Odo (alt) |

### Lances

| ID | Name | Rank | Mt | Hit | Wt | Range | Dur | Note |
|----|------|------|----|-----|----|-------|-----|------|
| IRON_LANCE | Iron Lance | D | 7 | 80 | 6 | 1 | 50 | |
| STEEL_LANCE | Steel Lance | C | 10 | 75 | 8 | 1 | 50 | |
| SILVER_LANCE | Silver Lance | B | 14 | 80 | 10 | 1 | 30 | |
| BRAVE_LANCE | Brave Lance | A | 10 | 70 | 10 | 1 | 20 | brave=true |
| SLIM_LANCE | Slim Lance | D | 4 | 95 | 2 | 1 | 30 | |
| JAVELIN | Javelin | C | 6 | 70 | 7 | 1–2 | 20 | |
| KILLER_LANCE | Killer Lance | B | 10 | 75 | 8 | 1 | 20 | critBonus=30 |
| GAE_BOLG | Gae Bolg | HOLY | 20 | 90 | 10 | 1 | 30 | Grants Vantage; Major Noba |

### Axes

| ID | Name | Rank | Mt | Hit | Wt | Range | Dur | Note |
|----|------|------|----|-----|----|-------|-----|------|
| IRON_AXE | Iron Axe | D | 8 | 75 | 8 | 1 | 50 | |
| STEEL_AXE | Steel Axe | C | 11 | 70 | 10 | 1 | 50 | |
| SILVER_AXE | Silver Axe | B | 15 | 75 | 12 | 1 | 30 | |
| BRAVE_AXE | Brave Axe | A | 11 | 65 | 12 | 1 | 20 | brave=true |
| HAND_AXE | Hand Axe | C | 7 | 65 | 9 | 1–2 | 20 | |
| KILLER_AXE | Killer Axe | B | 10 | 70 | 10 | 1 | 20 | critBonus=30 |

### Bows

| ID | Name | Rank | Mt | Hit | Wt | Range | Dur | Note |
|----|------|------|----|-----|----|-------|-----|------|
| IRON_BOW | Iron Bow | D | 5 | 85 | 4 | 2 | 50 | |
| STEEL_BOW | Steel Bow | C | 8 | 80 | 6 | 2 | 50 | |
| SILVER_BOW | Silver Bow | B | 12 | 85 | 8 | 2 | 30 | |
| BRAVE_BOW | Brave Bow | A | 8 | 70 | 8 | 2 | 20 | brave=true |
| KILLER_BOW | Killer Bow | B | 9 | 75 | 5 | 2 | 20 | critBonus=30 |
| ICHIVAL | Ichival | HOLY | 14 | 100 | 3 | 2 | 30 | Grants Pursuit; statBonus +20 Avoid; Major Ulir |

---

## All Weapons — Magic

### Fire

| ID | Name | Rank | Mt | Hit | Wt | Range | Dur | Note |
|----|------|------|----|-----|----|-------|-----|------|
| FIRE | Fire | D | 5 | 90 | 3 | 1–2 | 40 | |
| ELFIRE | Elfire | C | 10 | 85 | 5 | 1–2 | 30 | |
| BOLGANONE | Bolganone | B | 14 | 80 | 8 | 1–2 | 20 | |
| METEOR | Meteor | A | 10 | 60 | 10 | 3–10 | 10 | Long-range siege |
| VALFLAME | Valflame | HOLY | 25 | 95 | 8 | 1–2 | 30 | Grants Wrath; Velthomer Major |

### Thunder

| ID | Name | Rank | Mt | Hit | Wt | Range | Dur | Note |
|----|------|------|----|-----|----|-------|-----|------|
| THUNDER | Thunder | D | 6 | 80 | 4 | 1–2 | 40 | |
| ELTHUNDER | Elthunder | C | 11 | 75 | 6 | 1–2 | 30 | |
| THORON | Thoron | B | 14 | 70 | 8 | 1–2 | 20 | |
| BOLTING | Bolting | A | 12 | 60 | 8 | 3–10 | 10 | Long-range siege |
| MJOLNIR | Mjolnir | HOLY | 25 | 90 | 8 | 1–2 | 30 | Grants Luna; Thrud Major |

### Wind

| ID | Name | Rank | Mt | Hit | Wt | Range | Dur | Note |
|----|------|------|----|-----|----|-------|-----|------|
| WIND | Wind | D | 3 | 100 | 2 | 1–2 | 40 | |
| ELWIND | Elwind | C | 8 | 95 | 4 | 1–2 | 30 | |
| TORNADO | Tornado | B | 12 | 85 | 6 | 1–2 | 20 | |
| FORSETI | Forseti | HOLY | 20 | 100 | 3 | 1–2 | 30 | +20 Spd, +30 Avoid; Forseti Major |

### Light / Dark / Staff

| ID | Name | Type | Mt | Hit | Wt | Range | Dur | Note |
|----|------|------|----|-----|----|-------|-----|------|
| NOSFERATU | Nosferatu | Dark | 10 | 70 | 6 | 1–2 | 20 | Absorbs HP dealt |
| REWARP | Rewarp | Dark | 0 | 0 | 2 | [0,0] | 5 | Self-cast teleport (range [0,0] = self only, no combat) |
| BOOK_OF_NAGA | Book of Naga | Light | 30 | 100 | 8 | 1–2 | 30 | Grants Luna+Nihil; Naga Major |
| HEAL | Heal | Staff | — | — | 1 | 1–3 | 30 | Restore 10 HP |
| MEND | Mend | Staff | — | — | 2 | 1–3 | 20 | Restore 20 HP |
| PHYSIC | Physic | Staff | — | — | 3 | 1–7 | 10 | Restore 10 HP at range |
| RECOVER | Recover | Staff | — | — | 4 | 1–3 | 10 | Restore full HP |
| WARP | Warp | Staff | — | — | 5 | 1–10 | 5 | Teleport ally to any tile |
| RESCUE | Rescue | Staff | — | — | 4 | 1–8 | 5 | Pull ally adjacent to caster |
| SLEEP | Sleep | Staff | — | 70 | 3 | 1–5 | 10 | Inflict Sleep status |
| SILENCE | Silence | Staff | — | 70 | 3 | 1–5 | 10 | Disable magic for target |

---

## Durability Rules

```
Rank | Dur (default) | At 0       | Repairable
-----|---------------|------------|----------
D    | 50 (Iron)     | DISABLED   | Yes — 500g
C    | 50 (Steel)    | DISABLED   | Yes — 1,000g
C    | 20–30 (special) | DISABLED | Yes — 1,000g
B    | 30 (Silver)   | BREAKS     | No
B    | 20 (special)  | BREAKS     | No
A    | 20            | BREAKS     | No
HOLY | 30            | BREAKS + removed from HolyWeaponRegistry | No

Durability −1 per combat (không quan tâm số hits trong trận — brave, double, normal đều = −1)
Staff: −1 per use (heal, warp, rescue, sleep, etc.)
```

### Holy Weapon No-Duplicate Rule
```
HolyWeaponRegistry (in AccountData — account-level, survives across runs):
  - While weaponId exists in registry → drop rate = 0
  - On BREAKS: remove from registry → drop becomes possible again
```

---

## Inventory System

```
combatLoadout = 4 slots (per hero)
  → Selected pre-map in prep screen
  → Usable in battle
  → Shown in unit's action menu

fieldBag = 7 slots (account-level shared bag)
  → Items picked up in map go here
  → NOT usable in battle
  → Accessible in pre-map prep screen only

> ⚠️ Replaces 6-slot equipment schema (weapon/armor/helm/acc×2/off-hand)
> Armor/helm/accessory items TBD in separate equipment plan
```

### fieldBag Overflow

```
Khi hero chết — items từ combatLoadout được return về fieldBag:
  → Thêm từng item vào slot trống đầu tiên trong fieldBag
  → Nếu fieldBag đầy (7/7): items thừa bị mất vĩnh viễn (DROP)
  → UI hiển thị thông báo items bị mất (tên weapon + số lượng) nếu có overflow

Khi nhặt item từ map tile:
  → Nếu fieldBag đầy: không pick up được
  → Item vẫn nằm trên tile cho đến khi map kết thúc
  → Sau map end: tất cả uncollected items mất (không carry over)

Giải pháp tránh overflow:
  → Player cần quản lý fieldBag trước khi vào map (discard/sell ở prep screen)
```

---

## Holy Blood System

Holy Weapons require **Major Holy Blood** to equip. Heroes randomly generated may inherit Holy Blood.

```typescript
enum HolyBlood {
  BALDUR = 'BALDUR',       // → Tyrfing (Sword)
  ODO = 'ODO',             // → Mistoltin / Balmung (Sword)
  NOBA = 'NOBA',           // → Gae Bolg (Lance)
  ULIR = 'ULIR',           // → Ichival (Bow)
  VELTHOMER = 'VELTHOMER', // → Valflame (Fire)
  THRUD = 'THRUD',         // → Mjolnir (Thunder)
  FORSETI = 'FORSETI',     // → Forseti (Wind)
  NAGA = 'NAGA',           // → Book of Naga (Light)
}

enum BloodRank { MINOR = 0, MAJOR = 1 }
// Numeric enum cho phép: b.rank >= minRank (MAJOR(1) >= MINOR(0) → true ✓)
// String enum sẽ fail: 'MAJOR' >= 'MINOR' → false (alphabetical MA < MI)

interface HeroHolyBlood {
  blood: HolyBlood;
  rank: BloodRank;
}

// Added to HeroData:
// holyBloods: HeroHolyBlood[]
```

**Holy Blood generation rules:**
```
Khi generate hero mới:
  5%  → hero nhận 1 Major Holy Blood (random)
  15% → hero nhận 1 Minor Holy Blood (random)
  80% → không có Holy Blood
```

### Holy Blood Passive Stat Bonus

```
Bonus luôn active trong battle (không yêu cầu equip weapon phù hợp — đơn giản hơn FE4)
Áp dụng lên baseStats khi tính stats thực tế trong battle

Blood       | Minor (+) | Major (+)
------------|-----------|----------
BALDUR      | +5 STR    | +10 STR
ODO         | +5 STR    | +10 STR
NOBA        | +5 STR    | +10 STR
ULIR        | +5 SKL    | +10 SKL
VELTHOMER   | +5 MAG    | +10 MAG
THRUD       | +5 MAG    | +10 MAG
FORSETI     | +5 MAG    | +10 MAG
NAGA        | +5 RES    | +10 RES

Lưu ý: bonus này KHÔNG lưu trong baseStats (tránh double-count khi resurrect)
Tính runtime khi build combat stats, tương tự equipment bonus
```

---

## WeaponRegistry (TypeScript)

```typescript
class WeaponRegistry {
  private static weapons = new Map<WeaponId, WeaponDef>();

  static init(): void {
    WeaponRegistry.register({
      id: 'IRON_SWORD', name: 'Iron Sword', type: WeaponType.SWORD,
      rank: WeaponRank.D, might: 5, hit: 90, critBonus: 0, weight: 3,
      range: [1, 1], maxDurability: 50, onBreak: 'DISABLED', brave: false,
      sellPrice: 250, buyPrice: 500,
    });

    WeaponRegistry.register({
      id: 'WO_DAO', name: 'Wo Dao', type: WeaponType.SWORD,
      rank: WeaponRank.A, might: 9, hit: 75, critBonus: 20, weight: 3,
      range: [1, 1], maxDurability: 20, onBreak: 'BREAKS', brave: false,
      requiredBlood: { blood: HolyBlood.ODO, minRank: BloodRank.MINOR }, // Minor OK
      sellPrice: 500, buyPrice: 0,
    });

    WeaponRegistry.register({
      id: 'TYRFING', name: 'Tyrfing', type: WeaponType.SWORD,
      rank: WeaponRank.HOLY, might: 20, hit: 100, critBonus: 0, weight: 5,
      range: [1, 1], maxDurability: 30, onBreak: 'BREAKS', brave: false,
      grantedSkill: 'NIHIL',
      requiredBlood: { blood: HolyBlood.BALDUR, minRank: BloodRank.MAJOR }, // Major required
      statBonus: { res: 20 },
      sellPrice: 0, buyPrice: 0,
    });
    // ... tất cả weapons ...
  }

  static register(def: WeaponDef): void {
    WeaponRegistry.weapons.set(def.id, def);
  }

  static get(id: WeaponId): WeaponDef {
    const def = WeaponRegistry.weapons.get(id);
    if (!def) throw new Error(`Unknown weapon: ${id}`);
    return def;
  }

  static canEquip(
    unit: HeroData,
    weapon: WeaponDef,
    instance: WeaponInstance   // caller passes the specific instance from loadout
  ): boolean {
    // 1. Class weapon type check
    const classRank = getClassWeaponRank(unit.currentClass, weapon.type);
    if (classRank === null) return false;        // class cannot use this weapon type

    // 2. Rank check — HOLY weapons skip this; blood requirement (step 3) covers eligibility
    //    Without bypass: HOLY(4) > A(3) → always false → Holy weapons unequippable
    if (weapon.rank !== WeaponRank.HOLY && weapon.rank > classRank) return false;

    // 3. Blood requirement (Major required for HOLY weapons; Minor OK for some A-rank)
    if (weapon.requiredBlood) {
      const { blood, minRank } = weapon.requiredBlood;
      const has = unit.holyBloods.some(
        b => b.blood === blood && b.rank >= minRank
      );
      if (!has) return false;
    }

    // 4. DISABLED check — D/C weapon with 0 durability cannot be used
    if (instance.currentDurability === 0 && weapon.onBreak === 'DISABLED') return false;

    return true;
  }
}
```

---

## canEquip Flow

```
canEquip(hero, weapon, instance):
  ✓ hero.currentClass có weapon.type trong weaponRanks? (else: false)
  ✓ weapon.rank != HOLY → classWeaponRank >= weapon.rank? (else: false)
     weapon.rank == HOLY → bỏ qua rank check (blood check đảm bảo eligibility)
  ✓ weapon.requiredBlood → hero.holyBloods có blood đúng rank? (else: false)
  ✓ instance.currentDurability > 0 nếu weapon.onBreak == DISABLED? (else: false)
  → true: có thể equip
```

---

## FF4 Class → Weapon Type Mapping

> Bảng FE4 class ở trên là tham chiếu nguồn gốc. Bảng dưới là mapping thực tế cho FF4-inspired classes của game.

| FF4 Class | Sword | Lance | Axe | Bow | Fire | Thunder | Wind | Light | Dark | Staff |
|-----------|-------|-------|-----|-----|------|---------|------|-------|------|-------|
| Dark Knight | B | — | B | — | — | — | — | — | — | — |
| Paladin | A | A | — | — | — | — | — | — | — | — |
| Dragoon | — | A | — | — | — | — | — | — | — | — |
| Holy Dragoon | — | A | — | — | — | — | — | B | — | — |
| Monk | — | — | — | — | — | — | — | — | — | — | (unarmed)
| Master Monk | — | — | — | — | — | — | — | — | — | — | (unarmed)
| Ninja | A | — | — | — | — | — | — | — | — | — |
| Edge Master | A | — | — | — | — | — | — | — | D | — |
| Knight | B | B | B | — | — | — | — | — | — | — |
| Grand Knight | B | B | B | — | — | — | — | — | — | — |
| Hunter | — | — | — | B | — | — | — | — | — | — |
| Sniper | — | — | — | A | — | — | — | — | — | — |
| Bard | — | — | — | — | — | — | — | — | — | — | (Harp = utility, no combat)
| Troubadour | — | — | — | — | — | — | — | — | — | B |
| Machinist | — | — | B | — | — | — | — | — | — | — |
| Engineer | — | — | A | — | — | — | — | — | — | — |
| White Mage | — | — | — | — | — | — | — | — | — | A |
| Archbishop | — | — | — | — | — | — | — | A | — | A |
| Black Mage | — | — | — | — | A | A | A | — | — | — |
| Archmage | — | — | — | — | A | A | A | — | — | — |
| Caller | — | — | — | — | B | — | B | — | — | — |
| Summoner | — | — | — | — | B | — | B | — | — | — |
| Mystic | — | — | — | — | B | B | B | — | — | B |
| Sage | — | — | — | — | A | A | A | A | — | A |
| Eidolon Master | — | — | — | — | A | A | A | — | — | — |

**Notes:**
- Monk/Master Monk: không có weapon slot — xem Monk Unarmed rules
- Bard: Harp là instrument, không có combat weapon rank
- Edge Master: thêm Dark D để phản ánh shadow ninja flavor
- Holy Dragoon: Light B sau promote — thêm tính holy knight
- Sage: full magic access (Fire/Thunder/Wind/Light/Staff) — là promoted hybrid
