import Phaser from 'phaser';

export class NameLabel extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
    super(scene, x, y, name, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    });

    this.setOrigin(0.5, 1);
    this.setDepth(10);
    scene.add.existing(this);
  }

  followSprite(sprite: Phaser.GameObjects.Sprite, offsetY: number): void {
    this.x = sprite.x;
    this.y = sprite.y + offsetY;
  }
}
