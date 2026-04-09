# Tactical RPG - Web Game Plan

## Sub-plans
- [plan-combat.md](plan-combat.md) — Combat formulas, weapon triangle, drop system
- [plan-weapon.md](plan-weapon.md) — Weapon data (all weapons, stats, durability, Holy Blood, inventory slots)
- [plan-hero.md](plan-hero.md) — Hero lifecycle, permadeath, resurrection, schemas
- [plan-class.md](plan-class.md) — FF4-inspired class list, promotion tree, class skills
- [plan-map.md](plan-map.md) — Procedural map generation, difficulty scaling
- [plan-ui.md](plan-ui.md) — Screen map, UI layouts (hero reveal, reward, roster, deployment, battle)
- [plan-hero-appearance.md](plan-hero-appearance.md) — Hero visual template (gender, hair, skin, eye, class outfit, portrait composite)

---

## Tech Stack

- **Phaser 3** — Scene management, tilemap, input, camera
- **TypeScript** — Type safety toàn bộ data schema
- **Vite** — Dev server, bundle
- **Tiled** — Map editor, export JSON
- **LocalStorage** — Auto-save tiến trình hiện tại (1 slot per user, không có save/load UI)
- **Mulberry32 PRNG** — Seeded random (map gen, level-up rolls)

---

## Cấu trúc thư mục

```
src/
├── scenes/
│   ├── BootScene.ts          # Preload assets
│   ├── MainMenuScene.ts      # Title, new run / continue
│   ├── BattleScene.ts        # Core gameplay
│   ├── RewardScene.ts        # Post-battle loot / hero reward
│   └── UIScene.ts            # Persistent HUD overlay
│
├── systems/
│   ├── GridSystem.ts         # Tile math, A* pathfinding, BFS range
│   ├── MovementSystem.ts     # Range flood-fill, move execution
│   ├── CombatSystem.ts       # Hit/crit/damage formula, weapon triangle
│   ├── TurnSystem.ts         # Turn order, phase management
│   ├── AISystem.ts           # Enemy AI
│   ├── MapGenerator.ts       # Procedural map generation
│   ├── DifficultyScaler.ts   # Run difficulty curve
│   └── AutoSave.ts           # Auto-save tiến trình sau mỗi battle (1 slot)
│
├── entities/
│   ├── Unit.ts               # Base unit
│   ├── PlayerUnit.ts
│   ├── EnemyUnit.ts
│   └── UnitFactory.ts
│
├── data/
│   ├── classes/
│   │   ├── physicalClasses.ts
│   │   ├── magicClasses.ts
│   │   └── promotedClasses.ts
│   ├── weapons.ts
│   ├── skills.ts
│   ├── skillBooks.ts
│   ├── terrain.ts
│   ├── enemies.ts
│   └── names/namePools.ts
│
├── services/
│   ├── HeroGenerationService.ts
│   ├── HeroDeathService.ts
│   ├── RewardService.ts
│   ├── DeploymentService.ts
│   ├── InventoryService.ts
│   └── HeroRenameService.ts
│
├── ui/
│   ├── ActionMenu.ts
│   ├── UnitInfoPanel.ts
│   ├── BattleForecast.ts
│   ├── InventoryScreen.ts
│   ├── MapCursor.ts
│   └── TileHighlight.ts
│
├── state/
│   ├── GameState.ts
│   ├── BattleState.ts
│   └── RunState.ts
│
└── types/
    ├── enums.ts
    ├── ClassDefinition.ts
    ├── HeroData.ts
    ├── HeroGenerationConfig.ts
    ├── RunRoster.ts
    ├── AccountInventory.ts
    ├── RewardGeneration.ts
    └── ItemDefinition.ts
```

---

## Phases

### Phase 1 — MVP (Tuần 1–4)
- Tilemap render (Tiled JSON)
- Grid coordinate system
- Unit spawn, cursor, tile selection
- Movement range (BFS flood fill)
- Basic combat (no animation)
- Turn system (Player phase / Enemy phase)
- Simple enemy AI (advance + attack nearest)
- Win/lose condition

### Phase 2 — Combat System (Tuần 5–8)
- All weapon types + weapon triangle → [plan-combat.md](plan-combat.md)
- Hit / crit / double-attack formula (True Hit 2RN)
- Weapon durability (D/C → disabled at 0, B/A/HOLY → breaks permanently)
- Inventory UI (5 slots)
- Battle forecast
- Action menu (Move / Attack / Item / Wait)
- Terrain bonuses + A* pathfinding với terrain cost
- Level up + growth rate rolls
- Experience system

### Phase 3 — Class & Skill (Tuần 9–11)
- Class data → [plan-class.md](plan-class.md)
- Stat caps per class
- Promotion mechanic (item → new class)
- Class-specific movement (flying ignore terrain)
- Skill system + triggers
- Skill book items
- Weapon rank: **D → C → B → A → HOLY** (không có E, không có S — xem plan-combat.md)

### Phase 4 — Hero System (Tuần 12–14)
- Hero random generation → [plan-hero.md](plan-hero.md)
- Permadeath + loot return to inventory
- Post-map reward: 80% new hero / 20% resurrect
- Deployment limit: max 5 per map
- RunRoster + AccountInventory

### Phase 5 — Roguelite Map (Tuần 15–17)
- Procedural map generation → [plan-map.md](plan-map.md)
- Difficulty scaler per run number
- Drop system → [plan-combat.md](plan-combat.md)
- Auto-save sau mỗi battle kết thúc (không có save/load thủ công)

### Phase 6 — Polish (Tuần 18+)
- Sprite animations (walk, attack, death)
- Sound effects + BGM
- Reinforcement waves
- Boss unique AI
- Status conditions (poison, sleep, silence)
- Mobile touch input
- Settings (speed, skip animation)

---

## Build Order (Dependencies)

```
GridSystem
  └── MovementSystem → TileHighlight → BattleScene

Unit (types/enums)
  └── CombatSystem → AISystem → TurnSystem

ClassData + WeaponData + SkillData (pure data, see plan-class.md)
  └── HeroData → HeroGenerationService (see plan-hero.md)

MapGenerator (TerrainData + GridSystem, see plan-map.md)
  └── DifficultyScaler → RunState → AutoSave

HeroDeathService → RewardService → RunRoster
```

---

## Edge Cases

| Scenario | Xử lý |
|----------|--------|
| Dead pool rỗng khi roll 20% | Force NEW_HERO |
| Tất cả hero chết trong map | Game Over, lưu run history |
| Hero resurrect rồi chết lại | DeathSnapshot mới overwrite cũ |
| Promote item từ hero chết | Return về inventory, hero khác dùng được |
| Tên trùng khi generate | Redraw, fallback "Cecil 2" |
| New game 2 physical trùng class | Force draw class khác |
| Deploy < 5 heroes | OK, không bắt buộc đủ 5 |
| Holy weapon pool cạn khi roll | Skip Holy, pick non-Holy item thay thế |
| Weapon D/C disabled, không còn item nào dùng | Hero phải Wait hoặc dùng item khác |
