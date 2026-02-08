import Phaser from 'phaser';
import { UI_FONT_KEY } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load tileset (16x16 tiles, 5 columns, 3 rows)
    this.load.spritesheet('tiles', 'assets/tiles/tiles-sheet.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Load duck spritesheet (32x32 frames, 3 columns, 5 rows)
    this.load.spritesheet('ducks', 'assets/ducks/ducks-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.image('winner-banner', 'assets/ui/winner-banner.png');

    this.load.bitmapFont(
      UI_FONT_KEY,
      'assets/fonts/press-start-2p/thick_8x8.png',
      'assets/fonts/press-start-2p/thick_8x8.xml'
    );
  }

  create(): void {
    this.textures.get(UI_FONT_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.scene.start('MainMenuScene');
  }
}
