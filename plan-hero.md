# Hero System Plan

## Generation Rules

| Rule | Value |
|------|-------|
| Gender | Random (Male / Female) |
| Name | Random từ name pool, đổi được **1 lần** |
| Start class | Random theo category |
| New game roster | 2 Physical + 1 Magic |
| Max deploy per map | **5 heroes** |
| Default char slots per account | **20** |

---

## Character Slot System

### Default & Expansion
- Mỗi account bắt đầu với **20 char slots**
- Tổng slots = 20 + số lần đã dùng item **Add Slot Char**
- Slots chứa cả `activeHeroes` lẫn `deadHeroes` (GHOST pool)
- Khi slots đầy: không thể nhận hero reward cho đến khi delete hoặc slot được mở rộng

### Add Slot Char Item
- Dùng 1 item → +1 slot vĩnh viễn cho account
- Không có giới hạn tối đa slots
- Item lưu trong `AccountInventory` scope `PERMANENT`

### Drop Rate — Add Slot Char
```
Chỉ drop khi totalWins >= 50

dropRate(totalWins) = 1% + (totalWins - 50) × 0.2%

totalWins = 50 → 1.0%
totalWins = 55 → 2.0%
totalWins = 60 → 3.0%
totalWins = 100 → 11.0%
...không có cap (rate tăng mãi)

Roll 1 lần sau mỗi map win (sau reward hero đã xong)
```

```typescript
function getAddSlotDropRate(totalWins: number): number {
  if (totalWins < 50) return 0;
  return 0.01 + (totalWins - 50) * 0.002; // 1% + 0.2% per win over 50
}
```

### Delete Character
- Player có thể delete bất kỳ hero nào **ngoại trừ hero đang deployed trong map**
- **Xóa hoàn toàn khỏi data** — không giữ lại, không thể resurrect
- ACTIVE hero: items equipped → **trả về AccountInventory trước**, rồi xóa
- GHOST hero: items đã return lúc chết rồi → xóa trực tiếp
- Slot được giải phóng ngay lập tức
- **Cần confirm 1 lần** — UI hỏi "Xác nhận xóa vĩnh viễn?" (tránh fat-finger)

```typescript
function deleteHero(
  heroId: string,
  progress: UserProgress
): UserProgress | Error {
  const roster = progress.currentRun?.roster;

  // Không cho delete hero đang trong deployment
  if (roster?.currentDeployment?.includes(heroId)) {
    return new Error('HERO_CURRENTLY_DEPLOYED');
  }

  // Tìm trong activeHeroes
  const activeHero = roster?.activeHeroes.find(h => h.heroId === heroId);
  if (activeHero) {
    // Return combatLoadout items về fieldBag
    const returnedItems = activeHero.combatLoadout; // WeaponInstance[]
    return {
      ...progress,
      inventory: addItems(progress.inventory, returnedItems),
      currentRun: {
        ...progress.currentRun!,
        roster: {
          ...roster!,
          activeHeroes: roster!.activeHeroes.filter(h => h.heroId !== heroId),
        }
      }
    };
  }

  // Tìm trong ghostPool
  const isGhost = progress.ghostPool.some(h => h.heroId === heroId);
  if (isGhost) {
    // Items đã return lúc chết rồi, xóa thẳng
    return { ...progress, ghostPool: progress.ghostPool.filter(h => h.heroId !== heroId) };
  }

  return new Error('HERO_NOT_FOUND');
}

function currentSlotUsage(progress: UserProgress): number {
  const activeCount = progress.currentRun?.roster.activeHeroes.length ?? 0;
  return activeCount + progress.ghostPool.length;
}

function hasSlotAvailable(progress: UserProgress): boolean {
  return currentSlotUsage(progress) < progress.account.totalCharSlots;
}
```

### AccountData — Slot Tracking

```typescript
interface AccountData {
  accountId: string;
  totalCharSlots: number;       // 20 + số Add Slot Char đã dùng
  totalWins: number;            // tổng số map wins mọi run (dùng tính drop rate)
  usedSeeds: number[];          // vĩnh viễn
  totalRunsCompleted: number;
  bestRunBattlesCleared: number;
}
```

### New Game Generation
```
hero1 = random Physical class  (exclude class đã dùng để tránh trùng)
hero2 = random Physical class  (khác hero1)
hero3 = random Magic class
```

---

## Hero Generation Service

### Class Pools

```typescript
const PHYSICAL_POOL: HeroClass[] = [
  'DARK_KNIGHT', 'DRAGOON', 'MONK', 'NINJA',
  'KNIGHT', 'HUNTER', 'BARD', 'MACHINIST',
];
const MAGIC_POOL: HeroClass[] = [
  'WHITE_MAGE', 'BLACK_MAGE', 'SUMMONER', 'CALLER', 'MYSTIC',
];
```

### Class Selection

```typescript
// New game: 2 physical (không trùng nhau) + 1 magic
function pickNewGameClasses(rng: RNG): [HeroClass, HeroClass, HeroClass] {
  const shuffled = rng.shuffle([...PHYSICAL_POOL]);
  const [p1, p2] = shuffled;
  const m1 = rng.pick(MAGIC_POOL);
  return [p1, p2, m1];
}

// Post-map new hero reward: 60% Physical, 40% Magic
function pickRewardClass(rng: RNG): HeroClass {
  const pool = rng.next() < 0.6 ? PHYSICAL_POOL : MAGIC_POOL;
  return rng.pick(pool);
}
```

### Starting Weapon per Class

Mỗi class nhận 1 weapon D-rank trong combatLoadout khi được generate:

| Class | Starting Weapon |
|-------|----------------|
| DARK_KNIGHT | IRON_SWORD |
| DRAGOON | IRON_LANCE |
| MONK | *(none — unarmed)* |
| NINJA | IRON_SWORD |
| KNIGHT | IRON_SWORD |
| HUNTER | IRON_BOW |
| BARD | *(none — Harp = utility, không có combat weapon)* |
| MACHINIST | IRON_AXE |
| WHITE_MAGE | HEAL |
| BLACK_MAGE | FIRE |
| SUMMONER | WIND |
| CALLER | FIRE |
| MYSTIC | THUNDER |

```typescript
const STARTING_WEAPON: Partial<Record<HeroClass, WeaponId>> = {
  DARK_KNIGHT: 'IRON_SWORD',
  DRAGOON:     'IRON_LANCE',
  MONK:        undefined,       // unarmed
  NINJA:       'IRON_SWORD',
  KNIGHT:      'IRON_SWORD',
  HUNTER:      'IRON_BOW',
  BARD:        undefined,       // utility only
  MACHINIST:   'IRON_AXE',
  WHITE_MAGE:  'HEAL',
  BLACK_MAGE:  'FIRE',
  SUMMONER:    'WIND',
  CALLER:      'FIRE',
  MYSTIC:      'THUNDER',
};
```

### Generation Pipeline

```typescript
function generateHero(heroClass: HeroClass, runId: string, rng: RNG): HeroData {
  // 1. Gender + Name
  const gender: HeroGender = rng.next() < 0.5 ? 'MALE' : 'FEMALE';
  const namePool = gender === 'MALE' ? MALE_NAMES : FEMALE_NAMES;
  const originalName = rng.pick(namePool);

  // 2. Base stats từ ClassDefinition (L1 stats, không có blood/equipment bonus)
  const classDef = ClassDefs[heroClass];
  const baseStats: StatBlock = { ...classDef.baseStats };

  // 3. Holy Blood roll
  const bloodRoll = rng.next();
  let holyBloods: HeroHolyBlood[] = [];
  if (bloodRoll < 0.05) {
    holyBloods = [{ blood: rng.pick(ALL_HOLY_BLOODS), rank: BloodRank.MAJOR }];
  } else if (bloodRoll < 0.20) {
    holyBloods = [{ blood: rng.pick(ALL_HOLY_BLOODS), rank: BloodRank.MINOR }];
  }

  // 4. Starting weapon
  const startingWeaponId = STARTING_WEAPON[heroClass];
  const combatLoadout: WeaponInstance[] = startingWeaponId
    ? [{ defId: startingWeaponId, currentDurability: WeaponRegistry.get(startingWeaponId).maxDurability }]
    : [];

  return {
    heroId: generateUUID(),
    runId,
    gender,
    nameRecord: { originalName, changedName: null, changeUsed: false },
    lifecycleState: 'ACTIVE',
    deathSnapshot: null,
    baseClass: heroClass,
    currentClass: heroClass,
    isPromoted: false,
    level: 1,
    promotionLevel: null,
    experience: 0,
    baseStats,
    stats: baseStats,   // runtime stats (blood bonus tính sau, không lưu ở đây)
    knownSkillIds: classDef.classSkills.map(s => s.id),
    combatLoadout,
    holyBloods,
    isResurrected: false,
  };
}
```

> `stats` trong HeroData là runtime stats = `baseStats` + blood bonus + equipment bonus.
> Blood bonus **không** lưu vào `baseStats` để tránh double-count khi resurrect.

---

## Post-Map Reward

```
Win map → reward 1 hero:
  roll < 0.80 → NEW_HERO (pickRewardClass → generateHero)
  roll >= 0.80 → RESURRECTION (từ dead pool)

  Edge case: dead pool rỗng → FORCED_NEW_HERO (bất kể roll)
```

---

## Hero Lifecycle

```
[Generated / New Game]
        ↓
     ACTIVE  ←──────────────────────────────┐
        ↓ HP = 0                             │
     DEAD (transient, <1 frame)              │
        ↓                                    │
      GHOST ─────── 20% reward roll ─────────┘
   (dead pool)        (RESURRECTED → ACTIVE)
```

### ACTIVE → DEAD (Atomic)
```
1. Capture DeathSnapshot từ baseStats (KHÔNG có equipment/blood bonus)
2. Mỗi slot combatLoadout có WeaponInstance:
     → add vào UserProgress.inventory.fieldBag (shared bag)
3. Clear hero.combatLoadout = []
4. lifecycleState = GHOST
5. Move từ RunRoster.activeHeroes → UserProgress.ghostPool (account-level)
```

### GHOST → ACTIVE (Resurrection)
```
1. Restore baseStats từ deathSnapshot (không có equipment)
2. HP = deathSnapshot.stats.maxHp (full HP, không phải 0 lúc chết)
3. equippedItems = all null
4. lifecycleState = ACTIVE
5. isResurrected = true
6. Move từ ghostPool → currentRun.roster.activeHeroes
7. runId cập nhật thành run hiện tại
```

### Slot full khi nhận hero reward
```
Nếu totalSlotsUsed >= account.totalCharSlots:
  → Hiển thị màn hình "Slot đầy"
  → Player chọn: Delete 1 hero từ ghostPool → tiếp tục nhận reward
                 HOẶC: Skip reward (mất hero reward lần này)
  → Không force delete, không mất reward ngầm
```

---

## Data Schemas

### HeroData

```typescript
interface HeroData {
  heroId: string                      // UUID, permanent
  runId: string
  gender: HeroGender                  // MALE | FEMALE
  nameRecord: {
    originalName: string
    changedName: string | null
    changeUsed: boolean               // true sau khi đổi tên lần duy nhất
  }
  lifecycleState: HeroLifecycleState  // ACTIVE | GHOST
  deathSnapshot: DeathSnapshot | null

  baseClass: HeroClass                // class lúc sinh ra, không bao giờ đổi
  currentClass: HeroClass             // đổi sau promote
  isPromoted: boolean
  level: number                       // base: 1–20; reset về 1 khi promote; promoted: 1–20
  promotionLevel: number | null       // level lúc promote (10–20), null nếu chưa promote
  experience: number

  stats: StatBlock                    // stats hiện tại (có equipment + blood bonus)
  baseStats: StatBlock                // stats không có equipment/blood bonus
  knownSkillIds: string[]

  // Inventory (xem plan-weapon.md)
  combatLoadout: WeaponInstance[]     // max 4 slots; usable in battle
  // fieldBag là account-level (UserProgress.inventory), không gắn per-hero

  // Holy Blood (xem plan-weapon.md)
  holyBloods: HeroHolyBlood[]        // [] = no blood; max 1 entry per hero

  isResurrected: boolean
}
```

### DeathSnapshot

```typescript
interface DeathSnapshot {
  mapId: string
  turnNumber: number
  level: number
  promotionLevel: number | null
  currentClass: HeroClass
  isPromoted: boolean
  stats: StatBlock                    // BASE stats lúc chết (không có equipment/blood bonus)
  knownSkillIds: string[]
  holyBloods: HeroHolyBlood[]
  // combatLoadout KHÔNG lưu ở đây — items đã return về fieldBag lúc hero chết
  killedByEnemyId: string
  diedOnRunId: string
  diedAtTimestamp: number
}
```

### RunRoster

```typescript
interface RunRoster {
  runId: string
  activeHeroes: HeroData[]            // heroes còn sống trong run này
  // deadHeroes KHÔNG còn ở đây — đã chuyển sang UserProgress.ghostPool
  maxDeploymentSize: 5
  currentDeployment: string[] | null  // heroIds đang deploy trong map
  // deploymentHistory bị bỏ (quá lớn, không cần thiết cho gameplay)
}
```

### AccountInventory

```typescript
interface AccountInventory {
  // fieldBag: items có thể assign vào combatLoadout trước map
  // Gộp cả run-scoped và permanent items
  fieldBag: WeaponInstance[];         // max 7 slots tổng
  permanentItems: SpecialItem[];      // promotion items, Add Slot Char, etc.
}

// WeaponInstance (xem plan-weapon.md):
// { defId: WeaponId, currentDurability: number }
```

---

## Name Change

```typescript
function applyHeroRename(hero: HeroData, newName: string): HeroData | Error {
  if (hero.nameRecord.changeUsed) return new Error('RENAME_ALREADY_USED');
  if (!newName.trim() || newName.length > 24) return new Error('INVALID_NAME');
  return {
    ...hero,
    nameRecord: {
      originalName: hero.nameRecord.originalName,
      changedName: newName.trim(),
      changeUsed: true,
    }
  };
}

// Displayed name:
const displayName = hero.nameRecord.changedName ?? hero.nameRecord.originalName;
```

---

## Deployment Validation

```typescript
function validateDeployment(heroIds: string[], roster: RunRoster): string[] {
  const errors: string[] = [];
  if (heroIds.length > roster.maxDeploymentSize) errors.push('EXCEEDS_LIMIT');
  if (heroIds.length === 0) errors.push('EMPTY_DEPLOYMENT');
  for (const id of heroIds) {
    const hero = roster.activeHeroes.find(h => h.heroId === id);
    if (!hero) errors.push(`NOT_IN_ACTIVE_ROSTER:${id}`);
  }
  const unique = new Set(heroIds);
  if (unique.size !== heroIds.length) errors.push('DUPLICATE_HERO');
  return errors; // empty = valid
}
```

---

## Name Pools

### Male
Cecil, Kain, Edge, Yang, Cid, Golbez, Palom, Tellah, Gareth, Orion,
Aldric, Fenwick, Bram, Lorin, Theron, Calder, Emrys, Draven, Firth,
Ren, Cato, Milo, Beren, Lorn, Hadwin, Evander, Seren, Aldous, Caius, Rowan

### Female
Rosa, Rydia, Porom, Ursula, Lena, Svara, Calla, Miriel, Sable, Vesper,
Lyris, Daine, Rorie, Maera, Selene, Nira, Isolde, Thea, Vana, Cressida,
Lira, Mira, Perin, Adra, Fenra, Caeli, Darla, Orenna, Sevin, Aerin

---

## Edge Cases

| Scenario | Xử lý |
|----------|--------|
| Dead pool rỗng khi roll 20% | Force NEW_HERO |
| Tất cả hero chết trong map | Game Over |
| Hero resurrect rồi chết lại | DeathSnapshot mới overwrite cũ |
| Promote item từ hero chết | Return về inventory, hero khác dùng được |
| Tên trùng khi generate | Redraw; fallback "Name 2" nếu pool cạn |
| New game: 2 physical slot trùng class | Force draw class khác |
| Deploy < 5 heroes | OK, không bắt buộc đủ 5 |
