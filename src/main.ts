import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { BattleScene } from './scenes/BattleScene';

const COLS = 15;
const ROWS = 10;
const TW   = 40;
const TH   = 40;
const INFO = 84;    // info panel height

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width:  COLS * TW,
  height: ROWS * TH + INFO,
  backgroundColor: '#000000',
  antialias: false,   // pixel art — no anti-alias
  scene: [BootScene, BattleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
