import Phaser from 'phaser';
import { UI_FONT_KEY } from '../config/constants';

export class NameLabel extends Phaser.GameObjects.BitmapText {
  constructor(scene: Phaser.Scene, x: number, y: number, name: string, fontSize: number = 10, depth: number = 10) {
    super(scene, x, y, UI_FONT_KEY, name, fontSize);

    this.setOrigin(0, 1);
    this.setDepth(depth);
    this.setTint(0xffffff);
    scene.add.existing(this);
  }

  followSprite(sprite: Phaser.GameObjects.Sprite, offsetY: number): void {
    this.x = Math.round(sprite.x - this.width / 2);
    this.y = Math.round(sprite.y + offsetY);
  }
}
