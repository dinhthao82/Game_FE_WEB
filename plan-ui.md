# UI Plan

## Screen Map

```
MainMenuScene
  ├── [New Run] → NewGameRevealScreen → BattleScene
  └── [Continue] → RosterScreen → DeploymentScreen → BattleScene

BattleScene (in-map)
  ├── UnitInfoPanel (tap unit)
  ├── ActionMenu (tap own unit)
  ├── BattleForecast (select attack target)
  └── InventoryScreen (in-battle item use)

RewardScene (post-map win)
  ├── HeroRewardScreen (new hero or resurrection)
  └── SlotFullScreen (nếu slot đầy)

RosterScreen (giữa maps)
  └── HeroDetailScreen (tap hero)

DeploymentScreen (pre-map prep)
  └── WeaponAssignScreen (tap weapon slot)
```

---

## A — New Game Hero Reveal

Hiển thị 3 heroes random sau khi new run bắt đầu. Cards flip lần lượt (animation).

```
┌─────────────────────────────────────────────────────┐
│              YOUR HEROES                             │
│                                                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │    [?]    │  │    [?]    │  │    [?]    │        │
│  │  → flip   │  │  → flip   │  │  → flip   │        │
│  │           │  │           │  │           │        │
│  │Dark Knight│  │  Dragoon  │  │White Mage │        │
│  │  "Cecil"  │  │  "Kain"   │  │  "Rosa"   │        │
│  │           │  │           │  │           │        │
│  │ STR  7    │  │ STR  8    │  │ MAG  6    │        │
│  │ DEF  5    │  │ SPD  6    │  │ RES  7    │        │
│  │ HP   28   │  │ HP   25   │  │ HP   18   │        │
│  │           │  │           │  │           │        │
│  │[Minor Odo]│  │           │  │           │        │
│  └───────────┘  └───────────┘  └───────────┘        │
│                                                      │
│                   [Start Run]                        │
└─────────────────────────────────────────────────────┘
```

**Rules:**
- Cards flip theo thứ tự trái → phải, cách nhau ~0.5s
- Holy Blood badge chỉ hiện nếu hero có blood
- [Start Run] chỉ enable sau khi cả 3 cards đã flip
- Không có lựa chọn class — chỉ xem

---

## B — Hero Reward Screen (post-map)

### B1 — New Hero

```
┌─────────────────────────────────┐
│        HERO REWARD              │
│                                 │
│   ┌─────────────────────────┐   │
│   │        Ninja            │   │
│   │       "Sable"           │   │
│   │                         │   │
│   │  STR  5   SPD  9        │   │
│   │  SKL  7   LCK  6        │   │
│   │  HP   20  DEF  3        │   │
│   │                         │   │
│   │  Weapon: Iron Sword     │   │
│   │  [Minor Forseti Blood]  │   │
│   └─────────────────────────┘   │
│                                 │
│     [Rename]      [Accept]      │
└─────────────────────────────────┘
```

- [Rename] → mở text input (max 24 ký tự, consume rename token)
- [Accept] → thêm hero vào activeHeroes, roll Add Slot Char drop, về RosterScreen

### B2 — Resurrection

```
┌─────────────────────────────────┐
│       RESURRECTION              │
│                                 │
│   ┌─────────────────────────┐   │
│   │  👻 → ✨               │   │
│   │   Dark Knight           │   │
│   │     "Cecil"             │   │
│   │                         │   │
│   │  Restored from Lv 12    │   │
│   │  Died at: Map 7         │   │
│   │                         │   │
│   │  STR 14   DEF 10        │   │
│   │  HP  38   (full)        │   │
│   │  No weapon equipped     │   │
│   └─────────────────────────┘   │
│                                 │
│              [Accept]           │
└─────────────────────────────────┘
```

- Stats restored từ deathSnapshot (không có equipment/blood bonus)
- HP = max HP (full restore)
- combatLoadout rỗng → player phải equip ở DeploymentScreen

### B3 — Slot Full

```
┌─────────────────────────────────┐
│      CHARACTER SLOTS FULL       │
│         (20 / 20)               │
│                                 │
│  Reward hero đang chờ:          │
│  ┌───────────────────────────┐  │
│  │ Ninja "Sable" — STR 5 ... │  │
│  └───────────────────────────┘  │
│                                 │
│  Chọn hero để xóa:              │
│  ┌───────────────────────────┐  │
│  │ 👻 Cecil (Lv12 DarkKnight)│  │
│  │ 👻 Rosa  (Lv6 WhiteMage) │  │
│  └───────────────────────────┘  │
│                                 │
│  [Delete Selected]  [Skip]      │
│  (xóa → nhận reward) (bỏ qua)  │
└─────────────────────────────────┘
```

- Chỉ cho xóa từ ghostPool (không cho xóa activeHeroes ở đây)
- [Skip] = mất hero reward lần này, không force delete

---

## C — Roster Screen

Màn hình quản lý heroes giữa các map.

```
┌─────────────────────────────────────────────────────┐
│  ROSTER           Slots: 6 / 20    [+ Add Slot ×2]  │
│                                                      │
│  ACTIVE                                              │
│  ┌────┬──────────────────┬─────┬──────┬───────────┐ │
│  │    │ Name / Class     │ Lv  │  HP  │           │ │
│  ├────┼──────────────────┼─────┼──────┼───────────┤ │
│  │ ⚔️ │ Cecil DarkKnight │  8  │32/32 │ [Detail]  │ │
│  │ 🏹 │ Kain  Dragoon    │  5  │25/25 │ [Detail]  │ │
│  │ 🎵 │ Edge  Ninja      │  3  │20/20 │ [Detail]  │ │
│  │ ✨ │ Rosa  WhiteMage  │  6  │18/18 │ [Detail]  │ │
│  └────┴──────────────────┴─────┴──────┴───────────┘ │
│                                                      │
│  GHOST POOL (2)                                      │
│  ┌────┬──────────────────┬──────────────────────┐    │
│  │ 👻 │ Kain  Dragoon    │ Died Map 3, Lv6      │    │
│  │ 👻 │ Rosa  WhiteMage  │ Died Map 5, Lv9      │    │
│  └────┴──────────────────┴──────────────────────┘    │
│                                                      │
│  fieldBag: [IronSword][ElFire][Heal][—][—][—][—]    │
│                                                      │
│                      [Deploy →]                      │
└─────────────────────────────────────────────────────┘
```

**Notes:**
- [+ Add Slot ×2] badge hiện nếu có Add Slot Char item trong permanentItems
- Icon theo category: ⚔️ Physical / ✨ Magic / 👻 Ghost
- Tap ghost hero → confirm delete dialog (không có detail screen cho ghost)
- fieldBag hiển thị inline để nhắc player quản lý trước khi deploy

### Hero Detail Screen (tap [Detail])

```
┌─────────────────────────────────┐
│  ← Back           [Delete]      │
│                                 │
│  Cecil          Dark Knight     │
│  Lv 8   EXP 240/300             │
│  [Minor Baldur Blood]           │
│                                 │
│  HP  32   STR 10   MAG  2       │
│  DEF  8   RES  4   SPD  6       │
│  SKL  7   LCK  4                │
│                                 │
│  COMBAT LOADOUT                 │
│  [Iron Sword 38/50][—][—][—]   │
│                                 │
│  SKILLS                         │
│  DARKWAVE · SHADOW_STEP · COVER │
│                                 │
│  [Rename]  (token đã dùng → grey)│
└─────────────────────────────────┘
```

- [Delete] → confirm dialog "Xác nhận xóa vĩnh viễn?" → xóa + return items về fieldBag
- [Rename] disabled (greyed) nếu `nameRecord.changeUsed === true`
- Stats hiển thị là runtime stats (có blood bonus)

---

## D — Deployment Screen (pre-map prep)

```
┌─────────────────────────────────────────────────────┐
│  SELECT HEROES  (3 / 5 max)           [Start Map →] │
│                                                      │
│  ┌────┬──────────────┬────────────────────────────┐  │
│  │[✓] │ Cecil   Lv8  │ [IronSword▼][—][—][—]     │  │
│  │[✓] │ Kain    Lv5  │ [IronLance▼][—][—][—]     │  │
│  │[✓] │ Edge    Lv3  │ [IronSword▼][—][—][—]     │  │
│  │[ ] │ Rosa    Lv6  │ [Heal▼][—][—][—]           │  │
│  └────┴──────────────┴────────────────────────────┘  │
│                                                      │
│  FIELD BAG                                           │
│  [Steel⚔ ][ElFire🔥][Heal🩹][—][—][—][—]          │
│                                                      │
│  → Tap weapon slot để assign / unassign             │
└─────────────────────────────────────────────────────┘
```

**Weapon Assign Flow:**
```
Tap weapon slot trên hero
  → Hiện popup: danh sách items từ fieldBag mà hero đó canEquip
  → Tap item → assign vào slot, item rời khỏi fieldBag
  → Tap slot đang có weapon → unassign → item về fieldBag
```

**Rules:**
- canEquip filter theo class + blood + durability (xem plan-weapon.md)
- [Start Map →] disable nếu không có hero nào được chọn
- Heroes không được chọn vẫn giữ nguyên combatLoadout từ lần trước

---

## E — In-Battle UI

### Unit Info Panel (tap unit)

```
Cecil  Dark Knight  Lv8
HP ████████░░  32/32
MP ██░░░░░░░░   5/20
STR 10  DEF 8  SPD 6
Weapon: Iron Sword (38/50)
```

### Action Menu (tap own unit sau khi chọn)

```
┌────────┐
│  Move  │
│ Attack │
│  Item  │
│  Wait  │
└────────┘
```

### Battle Forecast (preview trước khi attack)

```
┌──────────────────────────────┐
│ Cecil          vs  Goblin    │
│ IronSword          IronSword │
│                              │
│ DMG   8            DMG   3   │
│ HIT  88%           HIT  72%  │
│ CRIT  4%           CRIT  2%  │
│                              │
│ Cecil doubles (SPD 6 vs 2)   │
└──────────────────────────────┘
        [Confirm]  [Cancel]
```

- Hiện "doubles" nếu SPD diff >= 4
- Hiện "No counter" nếu enemy ngoài tầm hoặc không có weapon

---

## Component Reuse

| Component | Dùng ở |
|-----------|--------|
| HeroCard | NewGameReveal, HeroReward |
| HeroRow | RosterScreen, DeploymentScreen, SlotFullScreen |
| WeaponSlot | HeroDetail, DeploymentScreen |
| BattleForecast | BattleScene |
| ConfirmDialog | DeleteHero, SlotFull |
