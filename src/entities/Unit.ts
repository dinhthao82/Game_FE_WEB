import Phaser from 'phaser';
import type { HeroData } from '@/types/HeroData';
import type { GridPos } from '@/systems/GridSystem';

export class Unit extends Phaser.GameObjects.Container {
  heroData: HeroData;
  gridPos: GridPos;

  private bodyRect: Phaser.GameObjects.Rectangle;
  private headRect: Phaser.GameObjects.Rectangle;
  private hairRect: Phaser.GameObjects.Rectangle;
  private eyeDot: Phaser.GameObjects.Arc;
  private nameTag: Phaser.GameObjects.Text;

  // sprite colors per appearance
  private readonly HAIR_COLORS: Record<string, number> = {
    WHITE:  0xf0f0ff, BLACK:  0x1a1a1a, BROWN:  0x7a4a1e,
    BLONDE: 0xf0c840, RED:    0xc82020, SILVER: 0xc0c8d8,
  };
  private readonly EYE_COLORS: Record<string, number> = {
    BROWN: 0x7a4a1e, BLUE: 0x3060c8, GREEN: 0x207840,
    GREY:  0x7890a0, RED:  0xdc2626, GOLD:  0xd4a017,
  };
  private readonly CLASS_COLORS: Record<string, number> = {
    DARK_KNIGHT: 0x1a1a2a, PALADIN: 0xe8e0c8, DRAGOON: 0x1e3a8a,
    MONK: 0xdc2626, NINJA: 0x1a1a1a, KNIGHT: 0x9ca3af,
    HUNTER: 0x92400e, BARD: 0x7c3aed, MACHINIST: 0x78350f,
    WHITE_MAGE: 0xf5f5f0, BLACK_MAGE: 0x1e1b4b, SUMMONER: 0x0c4a6e,
    CALLER: 0x064e3b, MYSTIC: 0x1e3a5f,
    // promoted
    HOLY_DRAGOON: 0x3b82f6, MASTER_MONK: 0xf5f5f0, EDGE_MASTER: 0x374151,
    GRAND_KNIGHT: 0xd4a017, SNIPER: 0x166534, TROUBADOUR: 0x5b21b6,
    ENGINEER: 0x451a03, ARCHBISHOP: 0xfefce8, ARCHMAGE: 0x0f0a1e,
    EIDOLON_MASTER: 0x713f12, SAGE: 0xfaf5eb,
  };

  constructor(scene: Phaser.Scene, heroData: HeroData, gridPos: GridPos, tileW: number, tileH: number) {
    const { x, y } = { x: gridPos.col * tileW + tileW / 2, y: gridPos.row * tileH + tileH / 2 };
    super(scene, x, y);
    this.heroData = heroData;
    this.gridPos  = gridPos;

    const cls    = heroData.currentClass;
    const ap     = heroData.appearance;
    const bodyC  = this.CLASS_COLORS[cls] ?? 0x444444;
    const hairC  = this.HAIR_COLORS[ap.hairColor] ?? 0xffffff;
    const eyeC   = this.EYE_COLORS[ap.eyeColor] ?? 0x444444;
    const capeC  = cls.includes('KNIGHT') || cls === 'BARD' || cls === 'TROUBADOUR'
                   ? 0x5b21b6 : 0x00000000;

    const u = tileW;  // 32 = 1 tile unit

    // Cape (drawn behind body)
    if (capeC !== 0x00000000) {
      const cape = scene.add.rectangle(2, 4, u * 0.30, u * 0.50, capeC, 0.7);
      this.add(cape);
    }

    // Body
    this.bodyRect = scene.add.rectangle(0, 4, u * 0.55, u * 0.55, bodyC);
    this.add(this.bodyRect);

    // Head (skin)
    const skinC = ap.skinTone === 'DARK' ? 0xc47840 : ap.skinTone === 'MEDIUM' ? 0xe8b880 : 0xf5d4b0;
    this.headRect = scene.add.rectangle(0, -6, u * 0.45, u * 0.40, skinC);
    this.add(this.headRect);

    // Hair
    this.hairRect = scene.add.rectangle(0, -10, u * 0.50, u * 0.20, hairC);
    this.add(this.hairRect);

    // Eye dot
    this.eyeDot = scene.add.arc(6, -6, 2, 0, 360, false, eyeC);
    this.add(this.eyeDot);

    // Outline (stroke rectangle simulated via thin white ring)
    const outline = scene.add.rectangle(0, 0, u * 0.60, u * 0.75, 0x000000, 0);
    outline.setStrokeStyle(1, 0x0d0d0d, 0.8);
    this.add(outline);

    // Name tag
    const displayName = heroData.nameRecord.changedName ?? heroData.nameRecord.originalName;
    this.nameTag = scene.add.text(0, 16, displayName, {
      fontSize: '8px', color: '#f0f0c0',
      stroke: '#000', strokeThickness: 2,
      resolution: 2,
    }).setOrigin(0.5, 0);
    this.add(this.nameTag);

    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject);
  }

  moveToGrid(gridPos: GridPos, tileW: number, tileH: number) {
    this.gridPos = gridPos;
    this.setPosition(
      gridPos.col * tileW + tileW / 2,
      gridPos.row * tileH + tileH / 2,
    );
  }

  setSelected(on: boolean) {
    this.bodyRect.setStrokeStyle(on ? 2 : 0, 0xffe040);
  }
}
