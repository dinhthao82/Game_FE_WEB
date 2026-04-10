import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // No external assets for MVP — all drawn programmatically
  }

  create() {
    this.scene.start('BattleScene');
  }
}
