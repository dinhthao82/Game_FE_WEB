import Phaser from 'phaser';
import type { HeroData } from '@/types/HeroData';
import { WEAPONS_BY_ID } from '@/data/weapons';

const SLOT_H = 18;
const PAD    = 6;
const W      = 150;

export class InventoryPanel extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private texts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.bg = scene.add.rectangle(0, 0, W, 120, 0x05030e, 0.93)
      .setStrokeStyle(1, 0x5b21b6, 1).setOrigin(0, 0);
    this.add(this.bg);
    this.setDepth(90);
    this.setVisible(false);
    scene.add.existing(this);
  }

  show(hero: HeroData, x: number, y: number) {
    this.texts.forEach(t => t.destroy());
    this.texts = [];

    const name    = hero.nameRecord.changedName ?? hero.nameRecord.originalName;
    const xpPct   = Math.floor((hero.experience / 100) * 100);
    const slots   = hero.combatLoadout;

    // Dynamic height
    const lineCount = 2 + slots.length + (slots.length === 0 ? 1 : 0);
    const h = PAD * 2 + lineCount * SLOT_H + 4;
    this.bg.setSize(W, h);

    let oy = PAD;

    // Header: name + level
    const header = this.scene.add.text(PAD, oy,
      `${name}  ${hero.currentClass}  Lv${hero.level}`, {
        fontSize: '9px', color: '#ffe040', resolution: 2,
      });
    this.add(header); this.texts.push(header);
    oy += SLOT_H;

    // XP bar text
    const xpTxt = this.scene.add.text(PAD, oy,
      `EXP  ${hero.experience}/100  [${xpBar(xpPct)}]`, {
        fontSize: '8px', color: '#80c0ff', resolution: 2,
      });
    this.add(xpTxt); this.texts.push(xpTxt);
    oy += SLOT_H;

    // Weapon slots
    if (slots.length === 0) {
      const empty = this.scene.add.text(PAD, oy, '  (no weapons)', {
        fontSize: '9px', color: '#555577', resolution: 2,
      });
      this.add(empty); this.texts.push(empty);
    } else {
      slots.forEach((slot, i) => {
        const def = WEAPONS_BY_ID[slot.defId];
        const disabled = slot.currentDurability <= 0;
        const label = def
          ? `${i === 0 ? '▶' : ' '} ${def.displayName}  ${slot.currentDurability}/${def.maxDurability}`
          : `${i === 0 ? '▶' : ' '} ???`;
        const color = disabled ? '#555577' : i === 0 ? '#f0f0c0' : '#9090b0';
        const t = this.scene.add.text(PAD, oy + i * SLOT_H, label, {
          fontSize: '9px', color, resolution: 2,
        });
        this.add(t); this.texts.push(t);
      });
    }

    // Clamp to screen
    const sw = this.scene.scale.width;
    const sh = this.scene.scale.height;
    const px = Math.min(x, sw - W - 4);
    const py = Math.min(y, sh - h - 4);
    this.setPosition(px, py);
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
    this.texts.forEach(t => t.destroy());
    this.texts = [];
  }
}

function xpBar(pct: number): string {
  const filled = Math.round(pct / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}
