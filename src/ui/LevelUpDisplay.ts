import Phaser from 'phaser';
import type { LevelUpResult } from '@/systems/ExperienceSystem';

const STAT_LABELS: Record<string, string> = {
  hp: 'HP', str: 'STR', mag: 'MAG', def: 'DEF',
  res: 'RES', spd: 'SPD', skl: 'SKL', lck: 'LCK',
};

export class LevelUpDisplay extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private texts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.bg = scene.add.rectangle(0, 0, 140, 180, 0x05030e, 0.95)
      .setStrokeStyle(2, 0xffe040, 1).setOrigin(0.5, 0.5);
    this.add(this.bg);
    this.setDepth(200);
    this.setVisible(false);
    scene.add.existing(this);
  }

  show(heroName: string, result: LevelUpResult, onDone: () => void) {
    // Destroy prior text objects
    this.texts.forEach(t => t.destroy());
    this.texts = [];

    const gainKeys = Object.keys(result.gains) as (keyof typeof result.gains)[];
    const h = 40 + gainKeys.length * 20 + 20;
    this.bg.setSize(140, Math.max(80, h));

    const title = this.scene.add.text(0, -h / 2 + 8, `${heroName}`, {
      fontSize: '11px', color: '#ffe040', stroke: '#000', strokeThickness: 2, resolution: 2,
    }).setOrigin(0.5, 0);
    this.add(title);
    this.texts.push(title);

    const lvlTxt = this.scene.add.text(0, -h / 2 + 24, `Level Up! → Lv ${result.newLevel}`, {
      fontSize: '10px', color: '#f0f0c0', stroke: '#000', strokeThickness: 2, resolution: 2,
    }).setOrigin(0.5, 0);
    this.add(lvlTxt);
    this.texts.push(lvlTxt);

    gainKeys.forEach((key, i) => {
      const keyStr = key as string;
      const label = STAT_LABELS[keyStr] ?? keyStr.toUpperCase();
      const t = this.scene.add.text(0, -h / 2 + 46 + i * 20, `${label}  +${result.gains[key as keyof typeof result.gains]}`, {
        fontSize: '11px', color: '#80ff80', stroke: '#000', strokeThickness: 2, resolution: 2,
      }).setOrigin(0.5, 0);
      this.add(t);
      this.texts.push(t);
    });

    if (gainKeys.length === 0) {
      const t = this.scene.add.text(0, -h / 2 + 46, '(no stat gains)', {
        fontSize: '10px', color: '#888888', resolution: 2,
      }).setOrigin(0.5, 0);
      this.add(t);
      this.texts.push(t);
    }

    this.setPosition(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
    );
    this.setVisible(true);

    // Auto-dismiss after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      this.hide();
      onDone();
    });
  }

  hide() {
    this.setVisible(false);
    this.texts.forEach(t => t.destroy());
    this.texts = [];
  }
}
