import Phaser from 'phaser';
import { GridSystem } from '@/systems/GridSystem';
import type { GridPos } from '@/systems/GridSystem';
import { TurnSystem } from '@/systems/TurnSystem';
import { calcDamage, resolveStrike } from '@/systems/CombatSystem';
import { planEnemyTurn } from '@/systems/AISystem';
import { Unit } from '@/entities/Unit';
import { ActionMenu } from '@/ui/ActionMenu';
import type { ActionChoice } from '@/ui/ActionMenu';
import { BattleForecast } from '@/ui/BattleForecast';
import { TERRAIN } from '@/data/terrain';
import { WEAPONS_BY_ID } from '@/data/weapons';
import type { TerrainType } from '@/types';
import type { HeroData } from '@/types/HeroData';
import { HairStyle, HairColor, SkinTone, EyeColor, HolyBlood, BloodRank } from '@/types';

// ── Palette ──────────────────────────────────────────────────────────
const TILE_COLORS: Record<TerrainType, { base: number; alt: number }> = {
  PLAIN:    { base: 0x4a7c3a, alt: 0x3c6830 },
  FOREST:   { base: 0x1e5c14, alt: 0x174d0e },
  MOUNTAIN: { base: 0x7a6a5a, alt: 0x6a5a4a },
  FORT:     { base: 0x8a8070, alt: 0x7a7060 },
  SEA:      { base: 0x1a4a8a, alt: 0x14407a },
  VILLAGE:  { base: 0xc8a060, alt: 0xb89050 },
  THRONE:   { base: 0x7a3a8a, alt: 0x6a2a7a },
};
const HL_MOVE   = 0x4080ff;
const HL_ATTACK = 0xff4040;
const HL_CURSOR = 0xffe040;
const HL_ALPHA  = 0.40;

// ── Map ───────────────────────────────────────────────────────────────
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

export const COLS = 15;
export const ROWS = 10;
export const TW   = 40;
export const TH   = 40;
const INFO_H      = 84;

// ── Demo data ─────────────────────────────────────────────────────────
function makeSable(): HeroData {
  return {
    heroId:'sable-001', runId:'run-0', gender:'FEMALE',
    nameRecord:{ originalName:'Sable', changedName:null, changeUsed:false },
    lifecycleState:'ACTIVE', deathSnapshot:null,
    baseClass:'DARK_KNIGHT', currentClass:'DARK_KNIGHT',
    isPromoted:false, level:1, promotionLevel:null, experience:0,
    baseStats:{ hp:20, str:7,  mag:1, def:6, res:2, spd:5, skl:5, lck:3 },
    stats:    { hp:20, str:12, mag:1, def:6, res:2, spd:5, skl:5, lck:3 },
    growths:  { hp:80, str:65, mag:10, def:55, res:20, spd:35, skl:45, lck:25 },
    holyBloods:[{ blood:HolyBlood.ODO, rank:BloodRank.MINOR }],
    knownSkillIds:['DARKWAVE','SHADOW_STEP','COVER'],
    combatLoadout:[{ defId:'IRON_SWORD', currentDurability:50 }],
    appearance:{ hairStyle:HairStyle.SHORT_BOB, hairColor:HairColor.WHITE, skinTone:SkinTone.LIGHT, eyeColor:EyeColor.RED },
    isResurrected:false,
  };
}

function makeEnemy(id: string, name: string, col: number, row: number): { hero: HeroData; pos: GridPos } {
  return {
    hero: {
      heroId:id, runId:'run-0', gender:'MALE',
      nameRecord:{ originalName:name, changedName:null, changeUsed:false },
      lifecycleState:'ACTIVE', deathSnapshot:null,
      baseClass:'KNIGHT', currentClass:'KNIGHT',
      isPromoted:false, level:3, promotionLevel:null, experience:0,
      baseStats:{ hp:24, str:6, mag:0, def:9, res:3, spd:3, skl:4, lck:3 },
      stats:    { hp:24, str:6, mag:0, def:9, res:3, spd:3, skl:4, lck:3 },
      growths:  { hp:90, str:50, mag:5, def:80, res:30, spd:20, skl:35, lck:20 },
      holyBloods:[], knownSkillIds:['PROTECT','SENTINEL'],
      combatLoadout:[{ defId:'IRON_SWORD', currentDurability:46 }],
      appearance:{ hairStyle:HairStyle.SHORT_NEAT, hairColor:HairColor.BROWN, skinTone:SkinTone.MEDIUM, eyeColor:EyeColor.BROWN },
      isResurrected:false,
    },
    pos: { col, row },
  };
}

// ── Scene state machine ───────────────────────────────────────────────
type SceneState =
  | 'SELECT_UNIT'       // waiting for player to pick a unit
  | 'SELECT_MOVE'       // unit selected — showing move range
  | 'SELECT_ACTION'     // unit moved — action menu open
  | 'SELECT_ATTACK'     // showing attack range, pick target
  | 'ANIMATING'         // playing combat anim (blocks input)
  | 'ENEMY_TURN'        // AI running
  | 'GAME_OVER'
  | 'VICTORY';

export class BattleScene extends Phaser.Scene {
  // ── Systems ────────────────────────────────────────────────────
  private grid!: GridSystem;
  private turns!: TurnSystem;

  // ── Units ──────────────────────────────────────────────────────
  playerUnits: Unit[] = [];
  enemyUnits:  Unit[] = [];

  // ── Scene state ────────────────────────────────────────────────
  private state: SceneState = 'SELECT_UNIT';
  private selectedUnit: Unit | null = null;
  private unitOriginPos: GridPos | null = null;  // position before move (for cancel)

  // ── Highlights ─────────────────────────────────────────────────
  private highlights: Phaser.GameObjects.Rectangle[] = [];

  // ── Cursor ─────────────────────────────────────────────────────
  private cursor!: Phaser.GameObjects.Rectangle;
  private cursorPos: GridPos = { col: 1, row: 4 };

  // ── UI ─────────────────────────────────────────────────────────
  private actionMenu!: ActionMenu;
  private forecast!: BattleForecast;
  private infoText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;

  // ── Input ──────────────────────────────────────────────────────
  private keys!: {
    up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key;
    confirm: Phaser.Input.Keyboard.Key; cancel: Phaser.Input.Keyboard.Key;
  };

  // ── PRNG ───────────────────────────────────────────────────────
  private rng = () => Math.random();

  constructor() { super('BattleScene'); }

  // ══════════════════════════════════════════════════════════════
  create() {
    this.grid  = new GridSystem(COLS, ROWS, TW, TH);
    this.turns = new TurnSystem();

    DEMO_MAP.forEach((row, r) => row.forEach((t, c) => this.grid.setTerrain(c, r, t)));

    this.drawTiles();
    this.spawnUnits();
    this.drawCursor();
    this.buildUI();
    this.setupInput();
    this.updateInfoPanel();
  }

  // ══════════════════════════════════════════════════════════════
  // TILES
  // ══════════════════════════════════════════════════════════════
  private drawTiles() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const terrain = this.grid.getTerrain(c, r);
        const pal     = TILE_COLORS[terrain];
        const color   = (c + r) % 2 === 0 ? pal.base : pal.alt;
        this.add.rectangle(c * TW, r * TH, TW - 1, TH - 1, color).setOrigin(0, 0);

        if (terrain === 'VILLAGE') this.add.text(c*TW+TW/2, r*TH+TH/2,'⌂',{fontSize:'16px'}).setOrigin(0.5);
        else if (terrain === 'THRONE') this.add.text(c*TW+TW/2, r*TH+TH/2,'♛',{fontSize:'16px'}).setOrigin(0.5);
        else if (terrain === 'FORT')   this.add.text(c*TW+TW/2, r*TH+TH/2,'□',{fontSize:'13px',color:'#c0c8d8'}).setOrigin(0.5);
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // UNITS
  // ══════════════════════════════════════════════════════════════
  private spawnUnits() {
    const sable = makeSable();
    this.playerUnits.push(new Unit(this, sable, { col:1, row:4 }, TW, TH));

    const enemies = [
      makeEnemy('e-001','Guard',  12, 3),
      makeEnemy('e-002','Guard',  13, 6),
      makeEnemy('e-003','Knight', 10, 7),
    ];
    enemies.forEach(({ hero, pos }) =>
      this.enemyUnits.push(new Unit(this, hero, pos, TW, TH))
    );
  }

  removeUnit(unit: Unit) {
    unit.destroy();
    this.playerUnits = this.playerUnits.filter(u => u !== unit);
    this.enemyUnits  = this.enemyUnits.filter(u => u !== unit);
  }

  // ══════════════════════════════════════════════════════════════
  // HIGHLIGHTS
  // ══════════════════════════════════════════════════════════════
  private clearHighlights() {
    this.highlights.forEach(h => h.destroy());
    this.highlights = [];
  }

  private showMoveRange(unit: Unit) {
    this.clearHighlights();
    const enemyOccupied = new Set(this.enemyUnits.map(e => `${e.gridPos.col},${e.gridPos.row}`));
    const moveRange = this.getMoveRange(unit);
    const tiles = this.grid.getMovementRange(
      unit.gridPos.col, unit.gridPos.row, moveRange, 'WALK', enemyOccupied,
    );
    for (const t of tiles) {
      const h = this.add.rectangle(t.col*TW+1, t.row*TH+1, TW-2, TH-2, HL_MOVE, HL_ALPHA).setOrigin(0,0).setDepth(1);
      this.highlights.push(h);
    }
  }

  private showAttackRange(unit: Unit) {
    this.clearHighlights();
    const weapon = this.getEquippedWeapon(unit);
    const [minR, maxR] = weapon ? weapon.range : [1,1];
    const tiles  = this.grid.getAttackRange([unit.gridPos], minR, maxR);
    for (const t of tiles) {
      const h = this.add.rectangle(t.col*TW+1, t.row*TH+1, TW-2, TH-2, HL_ATTACK, HL_ALPHA).setOrigin(0,0).setDepth(1);
      this.highlights.push(h);
    }
  }

  private inMoveHighlight(col: number, row: number): boolean {
    return this.highlights.some(h => Math.floor(h.x/TW) === col && Math.floor(h.y/TH) === row);
  }

  private inAttackHighlight(col: number, row: number): boolean {
    return this.highlights.some(h => Math.floor(h.x/TW) === col && Math.floor(h.y/TH) === row);
  }

  // ══════════════════════════════════════════════════════════════
  // CURSOR
  // ══════════════════════════════════════════════════════════════
  private drawCursor() {
    this.cursor = this.add.rectangle(0, 0, TW-2, TH-2, HL_CURSOR, 0)
      .setStrokeStyle(3, HL_CURSOR, 0.95).setOrigin(0,0).setDepth(10);
    this.moveCursorTo(this.cursorPos);
  }

  private moveCursorTo(pos: GridPos) {
    this.cursorPos = pos;
    this.cursor.setPosition(pos.col*TW+1, pos.row*TH+1);
    this.updateInfoPanel();
    // Show forecast when hovering enemy in attack-select state
    if (this.state === 'SELECT_ATTACK' && this.selectedUnit) {
      const target = this.enemyUnits.find(e => e.gridPos.col === pos.col && e.gridPos.row === pos.row);
      if (target && this.inAttackHighlight(pos.col, pos.row)) {
        this.showForecast(this.selectedUnit, target, pos.col*TW, pos.row*TH - 100);
      } else {
        this.forecast.hide();
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // INPUT
  // ══════════════════════════════════════════════════════════════
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
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.actionMenu.isOpen) return;
      const col = Math.floor(ptr.x / TW);
      const row = Math.floor(ptr.y / TH);
      if (this.grid.inBounds(col, row)) {
        this.moveCursorTo({ col, row });
        this.onConfirm();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // STATE MACHINE — CONFIRM
  // ══════════════════════════════════════════════════════════════
  private onConfirm() {
    if (this.state === 'ENEMY_TURN' || this.state === 'ANIMATING' ||
        this.state === 'GAME_OVER'  || this.state === 'VICTORY') return;

    const { col, row } = this.cursorPos;

    // ── Action menu open: delegate ───────────────────────────────
    if (this.actionMenu.isOpen) { this.actionMenu.confirm(); return; }

    // ── SELECT_UNIT ──────────────────────────────────────────────
    if (this.state === 'SELECT_UNIT') {
      const unit = this.playerUnits.find(u => u.gridPos.col === col && u.gridPos.row === row);
      if (unit && !this.turns.hasActed(unit.heroData.heroId)) {
        this.selectedUnit = unit;
        unit.setSelected(true);
        this.unitOriginPos = { ...unit.gridPos };
        this.showMoveRange(unit);
        this.state = 'SELECT_MOVE';
      }
      return;
    }

    // ── SELECT_MOVE ──────────────────────────────────────────────
    if (this.state === 'SELECT_MOVE' && this.selectedUnit) {
      // Re-click same unit → deselect
      if (col === this.selectedUnit.gridPos.col && row === this.selectedUnit.gridPos.row) {
        this.deselectUnit(); return;
      }
      // Click another player unit → switch selection
      const other = this.playerUnits.find(u => u.gridPos.col === col && u.gridPos.row === row && u !== this.selectedUnit);
      if (other && !this.turns.hasActed(other.heroData.heroId)) {
        this.deselectUnit();
        this.selectedUnit = other;
        other.setSelected(true);
        this.unitOriginPos = { ...other.gridPos };
        this.showMoveRange(other);
        return;
      }
      // Move to highlighted tile
      if (this.inMoveHighlight(col, row)) {
        this.selectedUnit.moveToGrid({ col, row }, TW, TH);
        this.clearHighlights();
        this.openActionMenu();
        return;
      }
      return;
    }

    // ── SELECT_ATTACK ────────────────────────────────────────────
    if (this.state === 'SELECT_ATTACK' && this.selectedUnit) {
      if (this.inAttackHighlight(col, row)) {
        const target = this.enemyUnits.find(e => e.gridPos.col === col && e.gridPos.row === row);
        if (target) { this.executeCombat(this.selectedUnit, target); return; }
      }
      // Click outside → back to action menu
      this.showAttackRange(this.selectedUnit);
      this.openActionMenu();
    }
  }

  // ── Cancel ────────────────────────────────────────────────────
  private onCancel() {
    if (this.state === 'ENEMY_TURN' || this.state === 'ANIMATING' ||
        this.state === 'GAME_OVER'  || this.state === 'VICTORY') return;

    if (this.actionMenu.isOpen) {
      // Cancel action menu → return unit to origin
      this.actionMenu.close();
      if (this.selectedUnit && this.unitOriginPos) {
        this.selectedUnit.moveToGrid(this.unitOriginPos, TW, TH);
      }
      this.showMoveRange(this.selectedUnit!);
      this.state = 'SELECT_MOVE';
      return;
    }
    if (this.state === 'SELECT_ATTACK') {
      this.forecast.hide();
      this.openActionMenu();
      return;
    }
    if (this.state === 'SELECT_MOVE' || this.state === 'SELECT_UNIT') {
      this.deselectUnit();
    }
  }

  private deselectUnit() {
    this.selectedUnit?.setSelected(false);
    this.selectedUnit = null;
    this.unitOriginPos = null;
    this.clearHighlights();
    this.forecast.hide();
    this.state = 'SELECT_UNIT';
  }

  // ══════════════════════════════════════════════════════════════
  // ACTION MENU
  // ══════════════════════════════════════════════════════════════
  private openActionMenu() {
    if (!this.selectedUnit) return;
    this.state = 'SELECT_ACTION';
    const weapon = this.getEquippedWeapon(this.selectedUnit);
    const [minR, maxR] = weapon ? weapon.range : [1,1];
    const attackRange  = this.grid.getAttackRange([this.selectedUnit.gridPos], minR, maxR);
    const canAttack    = this.enemyUnits.some(e =>
      attackRange.some(t => t.col === e.gridPos.col && t.row === e.gridPos.row)
    );
    const { col, row } = this.selectedUnit.gridPos;
    this.actionMenu.open(
      col * TW + TW + 4, row * TH,
      canAttack,
      (choice: ActionChoice) => this.onActionChoice(choice),
    );
  }

  private onActionChoice(choice: ActionChoice) {
    if (choice === 'WAIT') {
      this.finishUnitTurn(this.selectedUnit!);
      return;
    }
    if (choice === 'ATTACK') {
      this.state = 'SELECT_ATTACK';
      this.showAttackRange(this.selectedUnit!);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // COMBAT
  // ══════════════════════════════════════════════════════════════
  private showForecast(attacker: Unit, defender: Unit, x: number, y: number) {
    const atkW = this.getEquippedWeapon(attacker);
    const defW = this.getEquippedWeapon(defender);
    if (!atkW) return;
    const fc = calcDamage(
      attacker.heroData, defender.heroData, atkW, defW,
      this.grid.getTerrain(defender.gridPos.col, defender.gridPos.row),
    );
    const an = attacker.heroData.nameRecord.originalName;
    const dn = defender.heroData.nameRecord.originalName;
    this.forecast.show(an, dn, fc, x, y);
  }

  private executeCombat(attacker: Unit, defender: Unit) {
    this.forecast.hide();
    this.clearHighlights();
    this.state = 'ANIMATING';

    const atkW = this.getEquippedWeapon(attacker);
    const defW = this.getEquippedWeapon(defender);
    if (!atkW) { this.finishUnitTurn(attacker); return; }

    const fc = calcDamage(
      attacker.heroData, defender.heroData, atkW, defW,
      this.grid.getTerrain(defender.gridPos.col, defender.gridPos.row),
    );

    // Apply hits sequentially with short delays
    let delay = 0;
    const applyStrike = (src: Unit, tgt: Unit, dmg: number, hit: number, crit: number, isBrave: boolean) => {
      const strikes = isBrave ? 2 : 1;
      for (let i = 0; i < strikes; i++) {
        this.time.delayedCall(delay, () => {
          const result = resolveStrike(hit, dmg, crit, this.rng);
          if (result.hit) {
            tgt.heroData.stats.hp = Math.max(0, tgt.heroData.stats.hp - result.damage);
            this.flashUnit(tgt, result.crit ? 0xff4444 : 0xffffff);
            this.showDamageNumber(tgt, result.damage, result.crit);
          }
        });
        delay += 250;
      }
    };

    // Attacker strikes
    for (let i = 0; i < fc.attackerStrikes; i++) {
      const isBrave = atkW.brave && i === 0;
      applyStrike(attacker, defender, fc.attackerDamage, fc.attackerHit, fc.attackerCrit, isBrave);
      if (!isBrave) delay += 250;
    }

    // Defender counter
    if (defW && fc.defenderStrikes > 0) {
      delay += 100;
      for (let i = 0; i < fc.defenderStrikes; i++) {
        const isBrave = defW.brave && i === 0;
        applyStrike(defender, attacker, fc.defenderDamage, fc.defenderHit, fc.defenderCrit, isBrave);
        if (!isBrave) delay += 250;
      }
    }

    // After all strikes — check deaths, finish turn
    this.time.delayedCall(delay + 100, () => {
      // Reduce durability
      if (attacker.heroData.combatLoadout[0]) attacker.heroData.combatLoadout[0].currentDurability--;
      if (defender.heroData.combatLoadout[0] && defW) defender.heroData.combatLoadout[0].currentDurability--;

      this.checkDeaths();
      this.updateInfoPanel();

      if (this.state !== 'GAME_OVER' && this.state !== 'VICTORY') {
        this.finishUnitTurn(attacker);
      }
    });
  }

  private checkDeaths() {
    [...this.playerUnits, ...this.enemyUnits].forEach(u => {
      if (u.heroData.stats.hp <= 0) {
        this.flashUnit(u, 0x444444);
        this.time.delayedCall(300, () => this.removeUnit(u));
      }
    });

    // Check win/lose after removing
    this.time.delayedCall(350, () => {
      if (this.playerUnits.filter(u => u.heroData.stats.hp > 0).length === 0) {
        this.state = 'GAME_OVER';
        this.showEndScreen('DEFEAT', 0x880000);
      } else if (this.enemyUnits.filter(u => u.heroData.stats.hp > 0).length === 0) {
        this.state = 'VICTORY';
        this.showEndScreen('VICTORY', 0x224400);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TURN MANAGEMENT
  // ══════════════════════════════════════════════════════════════
  private finishUnitTurn(unit: Unit) {
    this.turns.markActed(unit.heroData.heroId);
    unit.setSelected(false);
    unit.setAlpha(0.5);    // greyed = acted
    this.selectedUnit = null;
    this.unitOriginPos = null;
    this.clearHighlights();
    this.forecast.hide();

    const activePlayerIds = this.playerUnits.map(u => u.heroData.heroId);
    if (this.turns.allActed(activePlayerIds)) {
      this.startEnemyPhase();
    } else {
      this.state = 'SELECT_UNIT';
      this.updatePhaseText();
    }
  }

  private startEnemyPhase() {
    this.turns.endPlayerPhase();
    this.state = 'ENEMY_TURN';
    this.updatePhaseText();
    this.phaseText.setColor('#ff6060');

    // Brief pause so player sees "ENEMY PHASE" then AI runs
    this.time.delayedCall(800, () => this.runEnemyAI());
  }

  private runEnemyAI() {
    const actions = planEnemyTurn(
      this.enemyUnits, this.playerUnits, this.grid, TW, TH,
    );

    let delay = 0;
    for (const action of actions) {
      this.time.delayedCall(delay, () => {
        if (!action.unit.active) return;
        action.unit.moveToGrid(action.moveTo, TW, TH);
        this.moveCursorTo(action.moveTo);
      });
      delay += 500;

      if (action.attackTarget) {
        const target = action.attackTarget;
        this.time.delayedCall(delay, () => {
          if (!action.unit.active || !target.active) return;
          if (target.heroData.stats.hp <= 0) return;
          this.executeCombatAI(action.unit, target);
        });
        delay += 1200;
      }
    }

    this.time.delayedCall(delay + 400, () => {
      if (this.state === 'ENEMY_TURN') this.endEnemyPhase();
    });
  }

  private executeCombatAI(attacker: Unit, defender: Unit) {
    const atkW = this.getEquippedWeapon(attacker);
    const defW = this.getEquippedWeapon(defender);
    if (!atkW) return;

    const fc = calcDamage(
      attacker.heroData, defender.heroData, atkW, defW,
      this.grid.getTerrain(defender.gridPos.col, defender.gridPos.row),
    );

    let delay = 0;
    for (let i = 0; i < fc.attackerStrikes; i++) {
      this.time.delayedCall(delay, () => {
        const r = resolveStrike(fc.attackerHit, fc.attackerDamage, fc.attackerCrit, this.rng);
        if (r.hit) {
          defender.heroData.stats.hp = Math.max(0, defender.heroData.stats.hp - r.damage);
          this.flashUnit(defender, r.crit ? 0xff4444 : 0xffffff);
          this.showDamageNumber(defender, r.damage, r.crit);
        }
      });
      delay += 250;
    }

    if (defW && fc.defenderStrikes > 0) {
      delay += 100;
      for (let i = 0; i < fc.defenderStrikes; i++) {
        this.time.delayedCall(delay, () => {
          const r = resolveStrike(fc.defenderHit, fc.defenderDamage, fc.defenderCrit, this.rng);
          if (r.hit) {
            attacker.heroData.stats.hp = Math.max(0, attacker.heroData.stats.hp - r.damage);
            this.flashUnit(attacker, r.crit ? 0xff4444 : 0xffffff);
            this.showDamageNumber(attacker, r.damage, r.crit);
          }
        });
        delay += 250;
      }
    }

    this.time.delayedCall(delay + 100, () => {
      this.checkDeaths();
      this.updateInfoPanel();
    });
  }

  private endEnemyPhase() {
    this.turns.endEnemyPhase();
    this.state = 'SELECT_UNIT';
    // Reset player unit alpha
    this.playerUnits.forEach(u => u.setAlpha(1));
    this.updatePhaseText();
    this.phaseText.setColor('#f0f0c0');
  }

  // ══════════════════════════════════════════════════════════════
  // EFFECTS
  // ══════════════════════════════════════════════════════════════
  private flashUnit(unit: Unit, color: number) {
    unit.flashColor(color);
    this.tweens.add({
      targets: unit, alpha: 0.3, duration: 80,
      yoyo: true, repeat: 1,
      onComplete: () => {
        unit.setAlpha(
          this.turns.hasActed(unit.heroData.heroId) && this.playerUnits.includes(unit) ? 0.5 : 1
        );
      },
    });
  }

  private showDamageNumber(unit: Unit, damage: number, crit: boolean) {
    const x = unit.x;
    const y = unit.y - 20;
    const txt = this.add.text(x, y, crit ? `★${damage}` : `${damage}`, {
      fontSize: crit ? '18px' : '14px',
      color: crit ? '#ff4040' : '#ffffff',
      stroke: '#000', strokeThickness: 3,
      resolution: 2,
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: txt, y: y - 30, alpha: 0, duration: 800,
      onComplete: () => txt.destroy(),
    });
  }

  // ══════════════════════════════════════════════════════════════
  // UI
  // ══════════════════════════════════════════════════════════════
  private buildUI() {
    // Bottom info bar
    const barY = ROWS * TH + 4;
    this.add.rectangle(0, ROWS * TH, COLS * TW, INFO_H, 0x05030e, 0.92).setOrigin(0, 0);
    this.add.rectangle(0, ROWS * TH, COLS * TW, 2, 0x2a1848).setOrigin(0, 0);
    this.infoText = this.add.text(8, barY, '', {
      fontSize: '11px', color: '#f0f0c0', lineSpacing: 4, resolution: 2,
    });

    // Phase + turn header
    this.phaseText = this.add.text(COLS * TW - 8, barY, 'PLAYER PHASE', {
      fontSize: '11px', color: '#f0f0c0', resolution: 2,
    }).setOrigin(1, 0);
    this.turnText = this.add.text(COLS * TW - 8, barY + 16, 'Turn 1', {
      fontSize: '10px', color: '#5b21b6', resolution: 2,
    }).setOrigin(1, 0);

    // Controls hint
    this.add.text(8, barY + 54, 'Arrow/Click: Move  Z: Confirm  X: Cancel', {
      fontSize: '9px', color: '#444466', resolution: 2,
    });

    this.actionMenu = new ActionMenu(this);
    this.forecast   = new BattleForecast(this);
  }

  private updateInfoPanel() {
    const { col, row } = this.cursorPos;
    const terrain = this.grid.getTerrain(col, row);
    const def     = TERRAIN[terrain];

    const unit = [...this.playerUnits, ...this.enemyUnits]
      .find(u => u.gridPos.col === col && u.gridPos.row === row);

    let txt = `[${col},${row}]  ${def.displayName}  DEF+${def.defBonus}  AVO+${def.avoidBonus}`;
    if (unit) {
      const h  = unit.heroData;
      const name = h.nameRecord.changedName ?? h.nameRecord.originalName;
      const side = this.playerUnits.includes(unit) ? '★' : '☆';
      txt += `\n${side} ${name}  ${h.currentClass} Lv${h.level}  HP:${h.stats.hp}/${h.baseStats.hp}  STR:${h.stats.str}  DEF:${h.stats.def}  SPD:${h.stats.spd}`;
    }
    this.infoText?.setText(txt);
  }

  private updatePhaseText() {
    this.phaseText?.setText(this.turns.phase === 'PLAYER' ? 'PLAYER PHASE' : 'ENEMY PHASE');
    this.turnText?.setText(`Turn ${this.turns.turnNumber}`);
  }

  private showEndScreen(label: string, bgColor: number) {
    const W = 260, H = 80;
    const cx = (COLS * TW) / 2;
    const cy = (ROWS * TH) / 2;
    this.add.rectangle(cx, cy, W, H, bgColor, 0.92).setDepth(300);
    this.add.rectangle(cx, cy, W, H, 0x000000, 0).setStrokeStyle(3, 0xe8c840).setDepth(301);
    this.add.text(cx, cy - 10, label, {
      fontSize: '32px', color: '#e8c840',
      stroke: '#000', strokeThickness: 4, resolution: 2,
    }).setOrigin(0.5).setDepth(302);
    this.add.text(cx, cy + 24, 'Press Z to restart', {
      fontSize: '12px', color: '#f0f0c0', resolution: 2,
    }).setOrigin(0.5).setDepth(302);

    this.input.keyboard!.once('keydown-Z', () => this.scene.restart());
    this.input.once('pointerdown', () => this.scene.restart());
  }

  // ══════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════
  private getMoveRange(unit: Unit): number {
    const c = unit.heroData.currentClass;
    if (c === 'KNIGHT' || c === 'MACHINIST') return 3;
    if (c === 'NINJA') return 5;
    return 4;
  }

  private getEquippedWeapon(unit: Unit) {
    const slot = unit.heroData.combatLoadout[0];
    if (!slot || slot.currentDurability <= 0) return null;
    return WEAPONS_BY_ID[slot.defId] ?? null;
  }

  // ══════════════════════════════════════════════════════════════
  // UPDATE LOOP
  // ══════════════════════════════════════════════════════════════
  update() {
    const { up, down, left, right, confirm, cancel } = this.keys;
    const { col, row } = this.cursorPos;

    if (this.actionMenu.isOpen) {
      if (Phaser.Input.Keyboard.JustDown(up))    this.actionMenu.cursorUp();
      if (Phaser.Input.Keyboard.JustDown(down))  this.actionMenu.cursorDown();
      if (Phaser.Input.Keyboard.JustDown(confirm)) this.actionMenu.confirm();
      if (Phaser.Input.Keyboard.JustDown(cancel)) this.onCancel();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(up)    && row > 0)        this.moveCursorTo({ col, row: row-1 });
    if (Phaser.Input.Keyboard.JustDown(down)  && row < ROWS-1)   this.moveCursorTo({ col, row: row+1 });
    if (Phaser.Input.Keyboard.JustDown(left)  && col > 0)        this.moveCursorTo({ col: col-1, row });
    if (Phaser.Input.Keyboard.JustDown(right) && col < COLS-1)   this.moveCursorTo({ col: col+1, row });
    if (Phaser.Input.Keyboard.JustDown(confirm)) this.onConfirm();
    if (Phaser.Input.Keyboard.JustDown(cancel))  this.onCancel();
  }
}
