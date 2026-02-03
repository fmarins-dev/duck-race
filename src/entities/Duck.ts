import Phaser from 'phaser';
import { NameLabel } from '../ui/NameLabel';
import type { DuckConfig, DuckVariant } from '../config/types';

export class Duck {
  public sprite: Phaser.GameObjects.Sprite;
  public nameLabel: NameLabel;
  public name: string;
  public variant: DuckVariant;
  public laneY: number;

  private targetX: number;
  private moving: boolean = false;
  private labelOffsetY: number;

  constructor(scene: Phaser.Scene, config: DuckConfig) {
    this.name = config.name;
    this.variant = config.variant;
    this.laneY = config.laneY;
    this.targetX = config.startX;
    this.labelOffsetY = config.labelOffsetY;

    // Create sprite
    this.sprite = scene.add.sprite(
      config.startX,
      config.laneY,
      'ducks',
      config.variant.startFrame
    );
    this.sprite.setScale(config.scale);
    this.sprite.setDepth(10);
    this.sprite.play(`swim-${config.variant.name}`);

    // Create name label above duck
    this.nameLabel = new NameLabel(
      scene,
      config.startX,
      config.laneY + config.labelOffsetY,
      config.name,
      config.labelFontSize
    );
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  setTarget(x: number): void {
    this.targetX = x;
    this.moving = true;
  }

  setPosition(x: number, y?: number): void {
    this.sprite.x = x;
    if (y !== undefined) {
      this.sprite.y = y;
      this.laneY = y;
    }
    this.updateLabelPosition();
  }

  update(delta: number): void {
    if (!this.moving) {
      this.updateLabelPosition();
      return;
    }

    // Smooth movement toward target (frame-rate independent)
    const dx = this.targetX - this.sprite.x;
    const catchUpSpeed = 5; // Higher = faster catch up
    const movement = dx * catchUpSpeed * (delta / 1000);

    // Only move if significant difference
    if (Math.abs(dx) > 0.5) {
      this.sprite.x += movement;
    } else {
      this.sprite.x = this.targetX;
    }

    this.updateLabelPosition();
  }

  stopMoving(): void {
    this.moving = false;
    // Keep swimming animation playing
  }

  private updateLabelPosition(): void {
    this.nameLabel.followSprite(this.sprite, this.labelOffsetY);
  }

  destroy(): void {
    this.sprite.destroy();
    this.nameLabel.destroy();
  }
}
