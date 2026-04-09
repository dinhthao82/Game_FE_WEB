# Map & Roguelite System Plan

## Procedural Map Generation

### Algorithm
```
1. Simplex noise → terrain base layer
      v < 0.2  → mountain
      v < 0.4  → forest
      v < 0.6  → plain
      v < 0.75 → forest
      else     → plain

2. Cellular automaton smoothing (5 iterations)
      Mỗi cell: nếu majority neighbors là loại X → đổi sang X

3. BFS connectivity check: playerSpawn → enemySpawn
      Nếu không connected → carve đường đi thẳng qua obstacles

4. Place strategic features:
      2–4 villages (reward points)
      1–2 forts (defensive mid-map positions)
      Choke points (narrow mountain passes)
      Boss throne (near enemy spawn, nếu map có boss)

5. Place spawn zones:
      Player: left side, 3×4 tile zone
      Enemy: right side, sized theo difficulty

6. Validate map quality:
      40–70% open tile ratio
      All player spawn tiles reachable by foot
      At least 1 foot-traversable path spawn → spawn
      → Fail: regenerate với seed+1
```

### Seeding & Deduplication
```
seed = masterSeed + battleIndex × 997

masterSeed    = UUID-derived number khi bắt đầu run mới
battleIndex   = 0, 1, 2, ... (battle thứ mấy trong run)

Deduplication:
  - Lưu usedSeeds[] vĩnh viễn trong SaveFile
  - Khi tạo run mới: nếu masterSeed đã có trong usedSeeds → generate lại
  - Đảm bảo không bao giờ trùng map đã chơi
```

---

## Terrain Types

| Terrain | DEF Bonus | Avoid Bonus | Foot | Armored | Cavalry | Flying |
|---------|-----------|-------------|------|---------|---------|--------|
| Plain | 0 | 0 | 1 | 1 | 1 | 1 |
| Forest | +1 | +20 | 2 | 3 | 3 | 1 |
| Mountain | +2 | +40 | 4 | — | — | 1 |
| Fort | +2 | +20 | 2 | 1 | 1 | 1 |
| Sea | 0 | 0 | — | — | — | 1 |
| Village | 0 | 0 | 1 | 1 | 1 | 1 |
| Throne | +3 | +30 | 1 | 1 | 1 | 1 |

`—` = impassable cho movement type đó

---

## Difficulty Scaling

### Per Run Number

| Run | Đặc điểm |
|-----|---------|
| 1 | Tutorial — ít enemy, không có boss |
| 2 | Boss xuất hiện lần đầu |
| 3 | Reinforcement waves bắt đầu |
| 5 | Promoted enemy class xuất hiện |
| 10+ | Elite enemies + boss variants |

### Formulas

```
enemyLevelOffset      = min(runNumber × 2, 20)
enemyCountMultiplier  = 1 + (runNumber - 1) × 0.15
reinforcementChance   = max(0, (runNumber - 2) × 0.10)  [từ run 3]
eliteEnemyChance      = max(0, (runNumber - 4) × 0.12)  [từ run 5]
bossPresent           = runNumber >= 2
```

### Per Battle Index (trong cùng 1 run)

```
Battle 0–2  → ít enemy, không reinforcement, không boss
Battle 3–5  → enemy tăng, có thể có reinforcement
Battle 6+   → nhiều enemy, boss battle, elite guards
```

---

## DifficultyConfig Schema

```typescript
interface DifficultyConfig {
  enemyLevelOffset: number;
  enemyCountMultiplier: number;
  reinforcementChance: number;       // 0.0 – 1.0
  eliteEnemyChance: number;          // % enemies là promoted class
  bossPresent: boolean;
}

function getDifficultyForRun(runNumber: number, battleIndex: number): DifficultyConfig {
  return {
    enemyLevelOffset:      Math.min(runNumber * 2, 20),
    enemyCountMultiplier:  1 + (runNumber - 1) * 0.15,
    reinforcementChance:   runNumber >= 3 ? (runNumber - 2) * 0.1 : 0,
    eliteEnemyChance:      runNumber >= 5 ? (runNumber - 4) * 0.12 : 0,
    bossPresent:           runNumber >= 2 && battleIndex >= 6,
  };
}
```

---

## RunState Schema

```typescript
interface RunState {
  runId: string;
  seed: number;                       // masterSeed
  runNumber: number;                  // bao nhiêu run đã win (độ khó)
  currentBattle: number;             // battle index hiện tại (0-based)
  totalBattles: number;              // tổng số battle trong run (8–12)
  difficulty: DifficultyConfig;
  completedBattleSeeds: number[];    // seeds đã dùng trong run này
}
```

---

## Auto-Save Schema

**Không có save/load thủ công.** Game tự động ghi trạng thái sau mỗi battle kết thúc.
1 slot duy nhất per user, lưu trong LocalStorage.

```typescript
interface UserProgress {
  version: number;

  // Account-level (vĩnh viễn, không reset theo run)
  account: AccountData;

  // Inventory account-level (items PERMANENT + items RUN hiện tại)
  inventory: AccountInventory;

  // Ghost pool account-level (heroes chết từ mọi run, không gắn với 1 run)
  ghostPool: HeroData[];             // lifecycle = GHOST

  // Run hiện tại (null nếu chưa có run / run vừa kết thúc)
  currentRun: {
    state: RunState;
    roster: RunRoster;               // activeHeroes của run này
  } | null;
}

interface AccountData {
  accountId: string;
  totalCharSlots: number;            // 20 + số Add Slot Char đã dùng
  totalWins: number;                 // tổng map wins mọi run
  totalRunsCompleted: number;
  bestRunBattlesCleared: number;
  holyWeaponRegistry: Record<string, boolean>; // account-level (không phải per-run)
}
```

**Quyết định thiết kế:**
- `ghostPool` là **account-level**, không gắn với run → heroes chết ở run 1 có thể resurrect ở run 3
- `ghostPool` + `activeHeroes` (trong `RunRoster`) cộng lại = tổng slot đang dùng
- `HolyWeaponRegistry` chuyển sang `AccountData` (vì Holy weapon có thể ở account inventory)

### Auto-save triggers
```
- Sau mỗi battle kết thúc (win hoặc lose)
- Sau khi nhận reward hero
- Sau khi thay đổi inventory/equipment giữa battles
- Khi user rời trang (beforeunload event)
```

### Khi user quay lại
```
Boot → đọc UserProgress từ LocalStorage
  → currentRun !== null → resume từ battle hiện tại
  → currentRun === null → hiện màn hình New Game
```

### Slot counting
```
totalSlotsUsed = currentRun.roster.activeHeroes.length + ghostPool.length

Khi start new run:
  - Kiểm tra: totalSlotsUsed + 3 (heroes mới) <= account.totalCharSlots
  - Nếu không đủ → thông báo "Cần xóa bớt X heroes trước khi bắt đầu"
  - Player phải delete heroes từ ghostPool trước
```

---

## Map Validation Checklist

```
✓ Tất cả player spawn tiles: reachable bởi foot unit
✓ Tất cả enemy spawn tiles: reachable từ enemy side
✓ Tồn tại ít nhất 1 path foot-traversable từ spawn đến spawn
✓ Open tile ratio: 40% – 70%
✓ Không có isolated pocket có thể nhốt unit
✓ Village tiles: reachable bởi player
✓ Boss throne (nếu có): ở enemy spawn area
```
