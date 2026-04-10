import Phaser from 'phaser';
import type { CombatForecast } from '@/systems/CombatSystem';

export class BattleForecast extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private txt: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    const W = 280, H = 90;
    this.bg = scene.add.rectangle(0, 0, W, H, 0x08060f, 0.95)
      .setStrokeStyle(2, 0x5b21b6).setOrigin(0, 0);
    this.txt = scene.add.text(8, 6, '', {
      fontSize: '11px', color: '#f0f0c0', lineSpacing: 4, resolution: 2,
    });
    this.add([this.bg, this.txt]);
    this.setDepth(99);
    this.setVisible(false);
    scene.add.existing(this);
  }

  show(
    atkName: string, defName: string,
    forecast: CombatForecast,
    x: number, y: number,
  ) {
    const { attackerStrikes: as, defenderStrikes: ds,
            attackerDamage: ad, defenderDamage: dd,
            attackerHit: ah, defenderHit: dh,
            attackerCrit: ac, defenderCrit: dc } = forecast;

    const critStar = (c: number) => c > 0 ? ` ★${c}%` : '';

    const lines = [
      `${atkName.padEnd(12)} vs  ${defName}`,
      `DMG  ${String(ad).padStart(3)}  (×${as})${critStar(ac)}   ↔   ${String(dd).padStart(3)}  (×${ds})${critStar(dc)}`,
      `HIT  ${String(ah).padStart(3)}%              ${String(dh).padStart(3)}%`,
    ];
    this.txt.setText(lines);

    const sw = this.scene.scale.width;
    const sh = this.scene.scale.height;
    const px = Math.min(x, sw - 284);
    const py = Math.min(y, sh - 94);
    this.setPosition(px, py);
    this.setVisible(true);
  }

  hide() { this.setVisible(false); }
}
