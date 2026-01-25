import Phaser from 'phaser';
import { BUTTON_WIDTH, BUTTON_HEIGHT } from '../config/constants';

export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private callback: () => void;
  private enabled: boolean = true;

  private normalColor = 0x4caf50;
  private hoverColor = 0x66bb6a;
  private disabledColor = 0x888888;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    callback: () => void
  ) {
    super(scene, x, y);
    this.callback = callback;

    // Create background
    this.background = scene.add.rectangle(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, this.normalColor);
    this.background.setStrokeStyle(3, 0x2e7d32);
    this.add(this.background);

    // Create text
    this.text = scene.add.text(0, 0, label, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.text.setOrigin(0.5, 0.5);
    this.add(this.text);

    // Make interactive
    this.setSize(BUTTON_WIDTH, BUTTON_HEIGHT);
    this.setInteractive({ useHandCursor: true })
      .on('pointerover', this.onHover, this)
      .on('pointerout', this.onOut, this)
      .on('pointerdown', this.onClick, this);

    scene.add.existing(this);
  }

  private onHover(): void {
    if (!this.enabled) return;
    this.background.setFillStyle(this.hoverColor);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
    });
  }

  private onOut(): void {
    if (!this.enabled) return;
    this.background.setFillStyle(this.normalColor);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
    });
  }

  private onClick(): void {
    if (!this.enabled) return;

    // Click animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        this.callback();
      },
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.background.setFillStyle(enabled ? this.normalColor : this.disabledColor);

    if (enabled) {
      this.setInteractive({ useHandCursor: true });
    } else {
      this.disableInteractive();
    }
  }

  setLabel(label: string): void {
    this.text.setText(label);
  }

  setScrollFactor(x: number, y?: number): this {
    super.setScrollFactor(x, y);
    this.background.setScrollFactor(x, y);
    this.text.setScrollFactor(x, y);
    return this;
  }
}
