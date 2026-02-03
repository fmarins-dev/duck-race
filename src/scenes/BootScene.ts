import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load tileset (16x16 tiles, 4 columns, 1 row)
    this.load.spritesheet('tiles', 'assets/tiles/tiles-sheet.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Load duck spritesheet (32x32 frames, 3 columns, 5 rows)
    this.load.spritesheet('ducks', 'assets/ducks/ducks-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }
}
