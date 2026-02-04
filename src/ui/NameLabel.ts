import Phaser from 'phaser';

export class NameLabel extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, name: string, fontSize: number = 28, depth: number = 10) {
    super(scene, x, y, name, {
      fontSize: `${fontSize}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: Math.round(fontSize * 4 / 28),
      align: 'center',
    });

    this.setOrigin(0.5, 1);
    this.setDepth(depth);
    scene.add.existing(this);
  }

  followSprite(sprite: Phaser.GameObjects.Sprite, offsetY: number): void {
    this.x = sprite.x;
    this.y = sprite.y + offsetY;
  }
}
