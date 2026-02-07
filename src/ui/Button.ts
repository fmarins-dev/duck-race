import Phaser from 'phaser';
import { BUTTON_WIDTH, BUTTON_HEIGHT, UI_FONT_KEY, UI_FONT_SIZE_SM } from '../config/constants';

export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.BitmapText;
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
    callback: () => void,
    width?: number,
    height?: number
  ) {
    super(scene, x, y);
    this.callback = callback;

    const w = width ?? BUTTON_WIDTH;
    const h = height ?? BUTTON_HEIGHT;

    // Create background
    this.background = scene.add.rectangle(0, 0, w, h, this.normalColor);
    this.background.setStrokeStyle(1, 0x2e7d32);
    this.add(this.background);

    // Create text
    this.text = scene.add.bitmapText(0, 0, UI_FONT_KEY, label, UI_FONT_SIZE_SM);
    this.text.setOrigin(0, 0.5);
    this.text.setPosition(Math.round(-this.text.width / 2), 2);
    this.text.setTint(0xffffff);
    this.add(this.text);

    // Make interactive
    this.setSize(w, h);
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
      alpha: 0.9,
      duration: 100,
    });
  }

  private onOut(): void {
    if (!this.enabled) return;
    this.background.setFillStyle(this.normalColor);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 100,
    });
  }

  private onClick(): void {
    if (!this.enabled) return;

    // Click animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0.75,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        this.alpha = 1;
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
    this.text.setPosition(Math.round(-this.text.width / 2), 2);
  }

  setScrollFactor(x: number, y?: number): this {
    super.setScrollFactor(x, y);
    this.background.setScrollFactor(x, y);
    this.text.setScrollFactor(x, y);
    return this;
  }
}
