import Phaser from 'phaser';

export type ActionChoice = 'ATTACK' | 'WAIT' | 'ITEM';

interface MenuItem {
  label: string;
  action: ActionChoice;
  enabled: boolean;
}

export class ActionMenu extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private items: MenuItem[] = [];
  private textObjs: Phaser.GameObjects.Text[] = [];
  private cursor = 0;
  private onChoose: (a: ActionChoice) => void = () => {};

  private readonly W = 96;
  private readonly ITEM_H = 22;
  private readonly PAD = 8;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.bg = scene.add.rectangle(0, 0, this.W, 80, 0x05030e, 0.95)
      .setStrokeStyle(2, 0xe8c840, 1).setOrigin(0, 0);
    this.add(this.bg);
    this.setVisible(false);
    this.setDepth(100);
    scene.add.existing(this);
  }

  open(x: number, y: number, canAttack: boolean, onChoose: (a: ActionChoice) => void) {
    this.onChoose = onChoose;
    this.cursor = 0;

    this.items = [
      { label: 'Attack', action: 'ATTACK', enabled: canAttack },
      { label: 'Wait',   action: 'WAIT',   enabled: true },
    ];

    // Rebuild text objects
    this.textObjs.forEach(t => t.destroy());
    this.textObjs = [];

    this.items.forEach((item, i) => {
      const t = this.scene.add.text(
        this.PAD, this.PAD + i * this.ITEM_H,
        item.label,
        { fontSize: '13px', color: item.enabled ? '#f0f0c0' : '#444444', resolution: 2 }
      );
      this.add(t);
      this.textObjs.push(t);
    });

    const h = this.PAD * 2 + this.items.length * this.ITEM_H;
    this.bg.setSize(this.W, h);

    // Position: clamp to screen
    const sw = this.scene.scale.width;
    const sh = this.scene.scale.height;
    const px = Math.min(x, sw - this.W - 4);
    const py = Math.min(y, sh - h - 4);
    this.setPosition(px, py);
    this.setVisible(true);
    this.updateCursor();
  }

  close() {
    this.setVisible(false);
    this.textObjs.forEach(t => t.destroy());
    this.textObjs = [];
  }

  cursorUp() {
    this.cursor = (this.cursor - 1 + this.items.length) % this.items.length;
    this.updateCursor();
  }

  cursorDown() {
    this.cursor = (this.cursor + 1) % this.items.length;
    this.updateCursor();
  }

  confirm() {
    const item = this.items[this.cursor];
    if (!item || !item.enabled) return;
    this.close();
    this.onChoose(item.action);
  }

  get isOpen() { return this.visible; }

  private updateCursor() {
    this.textObjs.forEach((t, i) => {
      const item = this.items[i];
      const color = !item.enabled ? '#444444' : i === this.cursor ? '#ffe040' : '#f0f0c0';
      t.setColor(color);
    });
  }
}
