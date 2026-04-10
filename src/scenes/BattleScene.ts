import Phaser from 'phaser';
import { GridSystem } from '@/systems/GridSystem';
import type { GridPos } from '@/systems/GridSystem';
import { Unit } from '@/entities/Unit';
import { TERRAIN } from '@/data/terrain';
import type { TerrainType } from '@/types';
import type { HeroData } from '@/types/HeroData';
import { HairStyle, HairColor, SkinTone, EyeColor, HolyBlood, BloodRank } from '@/types';

// ── Tile colours (pixel art palette) ────────────────────────────────
const TILE_COLORS: Record<TerrainType, { base: number; alt: number }> = {
  PLAIN:    { base: 0x4a7c3a, alt: 0x3c6830 },
  FOREST:   { base: 0x1e5c14, alt: 0x174d0e },
  MOUNTAIN: { base: 0x7a6a5a, alt: 0x6a5a4a },
  FORT:     { base: 0x8a8070, alt: 0x7a7060 },
  SEA:      { base: 0x1a4a8a, alt: 0x14407a },
  VILLAGE:  { base: 0xc8a060, alt: 0xb89050 },
  THRONE:   { base: 0x7a3a8a, alt: 0x6a2a7a },
};

// ── Highlight colours ────────────────────────────────────────────────
const HL_MOVE   = 0x4080ff;
const HL_ATTACK = 0xff4040;
const HL_CURSOR = 0xffe040;
const HL_ALPHA  = 0.45;

// ── Demo map layout (15×10) ──────────────────────────────────────────
// prettier-ignore
const DEMO_MAP: TerrainType[][] = [
  ['PLAIN','PLAIN','PLAIN','FOREST','FOREST','MOUNTAIN','MOUNTAIN','PLAIN','PLAIN','PLAIN','FOREST','PLAIN','PLAIN','PLAIN','PLAIN'],
  ['PLAIN','PLAIN','PLAIN','FOREST','PLAIN','MOUNTAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN'],
  ['PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','FOREST','FOREST','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN'],
  ['PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','FOREST','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN'],
  ['PLAIN','PLAIN','FORT','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','FORT','PLAIN','PLAIN','PLAIN'],
  ['PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN'],
  ['PLAIN','PLAIN','PLAIN','FOREST','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','FOREST','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN'],
  ['PLAIN','PLAIN','PLAIN','FOREST','FOREST','PLAIN','PLAIN','PLAIN','PLAIN','FOREST','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN'],
  ['PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN'],
  ['VILLAGE','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','PLAIN','THRONE'],
];

const COLS = 15;
const ROWS = 10;
const TW   = 40;   // tile width px
const TH   = 40;   // tile height px

// ── Demo hero factory ─────────────────────────────────────────────────
function makeSable(): HeroData {
  return {
    heroId: 'demo-sable-001', runId: 'run-000',
    gender: 'FEMALE',
    nameRecord: { originalName: 'Sable', changedName: null, changeUsed: false },
    lifecycleState: 'ACTIVE', deathSnapshot: null,
    baseClass: 'DARK_KNIGHT', currentClass: 'DARK_KNIGHT',
    isPromoted: false, level: 1, promotionLevel: null, experience: 0,
    baseStats: { hp:20, str:7,  mag:1, def:6, res:2, spd:5, skl:5, lck:3 },
    stats:     { hp:20, str:12, mag:1, def:6, res:2, spd:5, skl:5, lck:3 },
    growths:   { hp:80, str:65, mag:10, def:55, res:20, spd:35, skl:45, lck:25 },
    holyBloods: [{ blood: HolyBlood.ODO, rank: BloodRank.MINOR }],
    knownSkillIds: ['DARKWAVE','SHADOW_STEP','COVER'],
    combatLoadout: [{ defId: 'IRON_SWORD', currentDurability: 50 }],
    appearance: { hairStyle: HairStyle.SHORT_BOB, hairColor: HairColor.WHITE, skinTone: SkinTone.LIGHT, eyeColor: EyeColor.RED },
    isResurrected: false,
  };
}

function makeEnemy(id: string, name: string): HeroData {
  return {
    heroId: id, runId: 'run-000',
    gender: 'MALE',
    nameRecord: { originalName: name, changedName: null, changeUsed: false },
    lifecycleState: 'ACTIVE', deathSnapshot: null,
    baseClass: 'KNIGHT', currentClass: 'KNIGHT',
    isPromoted: false, level: 3, promotionLevel: null, experience: 0,
    baseStats: { hp:24, str:6, mag:0, def:9, res:3, spd:3, skl:4, lck:3 },
    stats:     { hp:24, str:6, mag:0, def:9, res:3, spd:3, skl:4, lck:3 },
    growths:   { hp:90, str:50, mag:5, def:80, res:30, spd:20, skl:35, lck:20 },
    holyBloods: [],
    knownSkillIds: ['PROTECT','SENTINEL'],
    combatLoadout: [{ defId: 'IRON_SWORD', currentDurability: 46 }],
    appearance: { hairStyle: HairStyle.SHORT_NEAT, hairColor: HairColor.BROWN, skinTone: SkinTone.MEDIUM, eyeColor: EyeColor.BROWN },
    isResurrected: false,
  };
}

// ── Scene ─────────────────────────────────────────────────────────────
export class BattleScene extends Phaser.Scene {
  private grid!: GridSystem;
  private tiles: Phaser.GameObjects.Rectangle[][] = [];
  private highlights: Phaser.GameObjects.Rectangle[] = [];
  private cursor!: Phaser.GameObjects.Rectangle;
  private cursorPos: GridPos = { col: 1, row: 4 };

  private playerUnits: Unit[] = [];
  private enemyUnits:  Unit[] = [];
  private selectedUnit: Unit | null = null;

  private infoPanel!: Phaser.GameObjects.Container;
  private infoBg!: Phaser.GameObjects.Rectangle;
  private infoText!: Phaser.GameObjects.Text;

  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    confirm: Phaser.Input.Keyboard.Key;
    cancel: Phaser.Input.Keyboard.Key;
  };

  constructor() { super('BattleScene'); }

  create() {
    this.grid = new GridSystem(COLS, ROWS, TW, TH);

    // Load map
    DEMO_MAP.forEach((row, r) => row.forEach((t, c) => this.grid.setTerrain(c, r, t)));

    this.drawTiles();
    this.spawnUnits();
    this.drawCursor();
    this.buildInfoPanel();
    this.setupInput();

    this.updateInfoPanel(this.cursorPos);
  }

  // ── Tilemap ─────────────────────────────────────────────────────
  private drawTiles() {
    this.tiles = [];
    for (let r = 0; r < ROWS; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < COLS; c++) {
        const terrain = this.grid.getTerrain(c, r);
        const pal     = TILE_COLORS[terrain];
        const color   = (c + r) % 2 === 0 ? pal.base : pal.alt;
        const rect    = this.add.rectangle(c * TW, r * TH, TW - 1, TH - 1, color).setOrigin(0, 0);
        this.tiles[r][c] = rect;

        // Special tile icons
        if (terrain === 'VILLAGE') {
          this.add.text(c * TW + TW / 2, r * TH + TH / 2, '⌂', { fontSize: '16px' }).setOrigin(0.5);
        } else if (terrain === 'THRONE') {
          this.add.text(c * TW + TW / 2, r * TH + TH / 2, '♛', { fontSize: '16px' }).setOrigin(0.5);
        } else if (terrain === 'FORT') {
          this.add.text(c * TW + TW / 2, r * TH + TH / 2, '□', { fontSize: '14px', color: '#c0c8d8' }).setOrigin(0.5);
        }
      }
    }
  }

  // ── Units ────────────────────────────────────────────────────────
  private spawnUnits() {
    const sable = makeSable();
    const u = new Unit(this, sable, { col: 1, row: 4 }, TW, TH);
    this.playerUnits.push(u);

    const e1 = makeEnemy('enemy-001', 'Guard');
    const e2 = makeEnemy('enemy-002', 'Guard');
    this.enemyUnits.push(
      new Unit(this, e1, { col: 12, row: 3 }, TW, TH),
      new Unit(this, e2, { col: 13, row: 6 }, TW, TH),
    );

    // Tint enemies red-ish
    this.enemyUnits.forEach(e => e.setAlpha(0.92));
  }

  // ── Cursor ───────────────────────────────────────────────────────
  private drawCursor() {
    this.cursor = this.add.rectangle(0, 0, TW - 2, TH - 2, HL_CURSOR, 0)
      .setStrokeStyle(3, HL_CURSOR, 0.95)
      .setOrigin(0, 0);
    this.moveCursorTo(this.cursorPos);
  }

  private moveCursorTo(pos: GridPos) {
    this.cursorPos = pos;
    this.cursor.setPosition(pos.col * TW + 1, pos.row * TH + 1);
  }

  // ── Highlights ───────────────────────────────────────────────────
  private clearHighlights() {
    this.highlights.forEach(h => h.destroy());
    this.highlights = [];
  }

  private showMoveRange(unit: Unit) {
    this.clearHighlights();
    const cls    = unit.heroData.currentClass;
    const range  = cls === 'NINJA' ? 5 : cls === 'KNIGHT' || cls === 'MACHINIST' ? 3 : 4;
    const enemySet = new Set(this.enemyUnits.map(e => `${e.gridPos.col},${e.gridPos.row}`));

    const tiles = this.grid.getMovementRange(
      unit.gridPos.col, unit.gridPos.row,
      range, 'WALK', enemySet,
    );

    for (const t of tiles) {
      const h = this.add.rectangle(t.col * TW + 1, t.row * TH + 1, TW - 2, TH - 2, HL_MOVE, HL_ALPHA)
        .setOrigin(0, 0);
      this.highlights.push(h);
    }
  }

  // ── Input ─────────────────────────────────────────────────────────
  private setupInput() {
    const kb = this.input.keyboard!;
    this.keys = {
      up:      kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      confirm: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      cancel:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.X),
    };

    // Mouse click on tiles
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      const col = Math.floor(ptr.x / TW);
      const row = Math.floor(ptr.y / TH);
      if (this.grid.inBounds(col, row)) {
        this.moveCursorTo({ col, row });
        this.onConfirm();
        this.updateInfoPanel({ col, row });
      }
    });
  }

  private onConfirm() {
    const { col, row } = this.cursorPos;

    // Click on player unit → select
    const clicked = this.playerUnits.find(u => u.gridPos.col === col && u.gridPos.row === row);
    if (clicked) {
      if (this.selectedUnit === clicked) {
        // Deselect
        this.selectedUnit.setSelected(false);
        this.selectedUnit = null;
        this.clearHighlights();
      } else {
        this.selectedUnit?.setSelected(false);
        this.selectedUnit = clicked;
        clicked.setSelected(true);
        this.showMoveRange(clicked);
      }
      return;
    }

    // Click on empty highlighted tile → move
    if (this.selectedUnit) {
      const inRange = this.highlights.some(h => {
        const hc = Math.floor(h.x / TW);
        const hr = Math.floor(h.y / TH);
        return hc === col && hr === row;
      });
      if (inRange) {
        this.selectedUnit.moveToGrid({ col, row }, TW, TH);
        this.selectedUnit.setSelected(false);
        this.selectedUnit = null;
        this.clearHighlights();
      }
    }
  }

  // ── Info panel ───────────────────────────────────────────────────
  private buildInfoPanel() {
    this.infoPanel = this.add.container(0, ROWS * TH + 4);
    this.infoBg = this.add.rectangle(0, 0, COLS * TW, 80, 0x05030e, 0.92).setOrigin(0, 0);
    this.infoText = this.add.text(8, 6, '', {
      fontSize: '11px', color: '#f0f0c0', lineSpacing: 4, resolution: 2,
    });
    this.infoPanel.add([this.infoBg, this.infoText]);
  }

  private updateInfoPanel(pos: GridPos) {
    const terrain = this.grid.getTerrain(pos.col, pos.row);
    const def     = TERRAIN[terrain];

    const unit = [...this.playerUnits, ...this.enemyUnits]
      .find(u => u.gridPos.col === pos.col && u.gridPos.row === pos.row);

    let txt = `[${pos.col},${pos.row}]  ${def.displayName}  DEF+${def.defBonus}  AVO+${def.avoidBonus}`;
    if (unit) {
      const h  = unit.heroData;
      const hp = h.stats.hp;
      const name = h.nameRecord.changedName ?? h.nameRecord.originalName;
      txt += `\n${name}  ${h.currentClass} Lv${h.level}  HP:${hp}  STR:${h.stats.str}  DEF:${h.stats.def}  SPD:${h.stats.spd}`;
    }
    this.infoText.setText(txt);
  }

  // ── Update loop ──────────────────────────────────────────────────
  update() {
    const { up, down, left, right, confirm, cancel } = this.keys;
    const { col, row } = this.cursorPos;

    if (Phaser.Input.Keyboard.JustDown(up)    && row > 0)         this.moveCursorTo({ col, row: row - 1 });
    if (Phaser.Input.Keyboard.JustDown(down)  && row < ROWS - 1)  this.moveCursorTo({ col, row: row + 1 });
    if (Phaser.Input.Keyboard.JustDown(left)  && col > 0)         this.moveCursorTo({ col: col - 1, row });
    if (Phaser.Input.Keyboard.JustDown(right) && col < COLS - 1)  this.moveCursorTo({ col: col + 1, row });

    if (Phaser.Input.Keyboard.JustDown(confirm)) this.onConfirm();
    if (Phaser.Input.Keyboard.JustDown(cancel)) {
      this.selectedUnit?.setSelected(false);
      this.selectedUnit = null;
      this.clearHighlights();
    }

    this.updateInfoPanel(this.cursorPos);
  }
}
