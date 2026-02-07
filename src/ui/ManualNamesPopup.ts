import Phaser from 'phaser';
import { Button } from './Button';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  POPUP_WIDTH,
  POPUP_HEIGHT,
  POPUP_BG_COLOR,
  POPUP_OVERLAY_ALPHA,
  MAX_NAMES,
  UI_FONT_KEY,
  UI_FONT_SIZE_SM,
  UI_FONT_SIZE_MD,
} from '../config/constants';

export class ManualNamesPopup extends Phaser.GameObjects.Container {
  private overlay: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.BitmapText;
  private instructionText: Phaser.GameObjects.BitmapText;
  private textareaElement: HTMLTextAreaElement | null = null;
  private submitButton: Button;
  private cancelButton: Button;
  private onSubmitCallback: (names: string[]) => void;
  private onCancelCallback: () => void;
  private resizeHandler: () => void;

  constructor(
    scene: Phaser.Scene,
    onSubmit: (names: string[]) => void,
    onCancel: () => void
  ) {
    super(scene, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.onSubmitCallback = onSubmit;
    this.onCancelCallback = onCancel;

    // Create overlay (full screen semi-transparent)
    this.overlay = scene.add.rectangle(
      0,
      0,
      GAME_WIDTH * 2,
      GAME_HEIGHT * 2,
      0x000000,
      POPUP_OVERLAY_ALPHA
    );
    this.overlay.setInteractive();
    this.add(this.overlay);

    // Create modal background
    this.modalBg = scene.add.rectangle(0, 0, POPUP_WIDTH, POPUP_HEIGHT, POPUP_BG_COLOR);
    this.modalBg.setStrokeStyle(1, 0x636e72);
    this.add(this.modalBg);

    // Title
    this.titleText = scene.add.bitmapText(
      0,
      -POPUP_HEIGHT / 2 + 32,
      UI_FONT_KEY,
      'Add Participants',
      UI_FONT_SIZE_MD
    );
    this.centerBitmapText(this.titleText, -POPUP_HEIGHT / 2 + 32);
    this.titleText.setTint(0xffffff);
    this.add(this.titleText);

    // Instruction text
    this.instructionText = scene.add.bitmapText(
      0,
      -POPUP_HEIGHT / 2 + 52,
      UI_FONT_KEY,
      `One name per line (max ${MAX_NAMES})`,
      UI_FONT_SIZE_SM
    );
    this.centerBitmapText(this.instructionText, -POPUP_HEIGHT / 2 + 52);
    this.instructionText.setTint(0xb2bec3);
    this.add(this.instructionText);

    // Create HTML textarea
    this.createTextarea();

    // Submit button
    this.submitButton = new Button(scene, -60, POPUP_HEIGHT / 2 - 24, 'Confirm', () => {
      this.handleSubmit();
    }, 100, 20);
    this.add(this.submitButton);

    // Cancel button
    this.cancelButton = new Button(scene, 60, POPUP_HEIGHT / 2 - 24, 'Cancel', () => {
      this.handleCancel();
    }, 100, 20);
    this.add(this.cancelButton);

    // Set depth to be on top
    this.setDepth(1000);

    // Add to scene
    scene.add.existing(this);

    // Setup resize handler
    this.resizeHandler = () => this.updateTextareaPosition();
    window.addEventListener('resize', this.resizeHandler);

    // Initial position update
    this.updateTextareaPosition();
  }

  private createTextarea(): void {
    this.textareaElement = document.createElement('textarea');
    this.textareaElement.id = 'manual-names-input';
    this.textareaElement.value = 'Alice\nBob\nCharlie';
    this.textareaElement.placeholder = '(max 25 names)';
    this.textareaElement.style.cssText = `
      position: absolute;
      width: 350px;
      height: 250px;
      font-size: 16px;
      font-family: "Press Start 2P", monospace;
      padding: 12px;
      border: 2px solid #636e72;
      border-radius: 8px;
      background-color: #f5f6fa;
      color: #2d3436;
      resize: none;
      outline: none;
      z-index: 1000;
    `;

    document.body.appendChild(this.textareaElement);

    // Focus on next frame
    this.scene.time.delayedCall(50, () => {
      this.textareaElement?.focus();
    });
  }

  private updateTextareaPosition(): void {
    if (!this.textareaElement) return;

    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / GAME_WIDTH;
    const scaleY = rect.height / GAME_HEIGHT;

    // Textarea position relative to popup center (which is at screen center)
    const textareaOffsetY = 7;
    const textareaWidth = 420;
    const textareaHeight = 130;

    const screenX = rect.left + (GAME_WIDTH / 2 - textareaWidth / 2) * scaleX;
    const screenY = rect.top + (GAME_HEIGHT / 2 + textareaOffsetY - textareaHeight / 2) * scaleY;

    this.textareaElement.style.left = `${screenX}px`;
    this.textareaElement.style.top = `${screenY}px`;
    this.textareaElement.style.width = `${textareaWidth * scaleX}px`;
    this.textareaElement.style.height = `${textareaHeight * scaleY}px`;
    this.textareaElement.style.fontSize = `${16 * Math.min(scaleX, scaleY)}px`;
  }

  private parseNames(): string[] {
    if (!this.textareaElement) return [];

    const text = this.textareaElement.value.trim();
    if (!text) return [];

    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.slice(0, MAX_NAMES);
  }

  private handleSubmit(): void {
    const names = this.parseNames();
    if (names.length === 0) {
      // Show error - at least one name required
      this.instructionText.setText('Enter at least one name!');
      this.instructionText.setTint(0xe74c3c);
      this.centerBitmapText(this.instructionText, -POPUP_HEIGHT / 2 + 52);
      return;
    }

    this.onSubmitCallback(names);
  }

  private handleCancel(): void {
    this.onCancelCallback();
  }

  private centerBitmapText(text: Phaser.GameObjects.BitmapText, y: number): void {
    const left = Math.round(-text.width / 2);
    text.setOrigin(0, 0.5);
    text.setPosition(left, Math.round(y));
  }

  getNames(): string[] {
    return this.parseNames();
  }

  setNames(names: string[]): void {
    if (this.textareaElement) {
      this.textareaElement.value = names.join('\n');
    }
  }

  submit(): void {
    this.handleSubmit();
  }

  destroy(): void {
    // Remove resize listener
    window.removeEventListener('resize', this.resizeHandler);

    // Remove DOM element
    if (this.textareaElement?.parentNode) {
      this.textareaElement.parentNode.removeChild(this.textareaElement);
      this.textareaElement = null;
    }

    super.destroy();
  }
}
