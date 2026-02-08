import Phaser from 'phaser';
import { UI_FONT_SIZE_SM } from '../config/constants';

const TIMER_FONT_KEY = 'press-start-2p-mono';

export class RaceTimer extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Image;
  private minutesText: Phaser.GameObjects.BitmapText;
  private minutesOutline: Phaser.GameObjects.BitmapText[] = [];
  private colonText: Phaser.GameObjects.BitmapText;
  private colonOutline: Phaser.GameObjects.BitmapText[] = [];
  private secondsText: Phaser.GameObjects.BitmapText;
  private secondsOutline: Phaser.GameObjects.BitmapText[] = [];
  private static framesCreated = false;
  private static readonly TEXT_OFFSET_X = 1;
  private static readonly TEXT_OFFSET_Y = 1;
  private static readonly OUTLINE_OFFSETS: Array<[number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  private static readonly COLON_GAP = 0;
  private static readonly COLON_TIGHTEN = 2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.ensureFrames(scene);

    this.background = scene.add.image(0, 0, 'ui-buttons', 'counter-frame');
    this.background.setOrigin(0.5, 0.5);
    this.add(this.background);

    const initialMinutes = '00';
    const initialSeconds = '15';
    this.minutesText = this.createTextGroup(scene, initialMinutes, this.minutesOutline);
    this.colonText = this.createTextGroup(scene, ':', this.colonOutline);
    this.secondsText = this.createTextGroup(scene, initialSeconds, this.secondsOutline);
    this.updateTextLayout();

    this.setVisible(false);
    this.setDepth(170);
    this.setScrollFactor(0);

    scene.add.existing(this);
  }

  private ensureFrames(scene: Phaser.Scene): void {
    if (RaceTimer.framesCreated) return;
    const texture = scene.textures.get('ui-buttons');
    if (!texture) return;

    if (!texture.has('counter-frame')) {
      texture.add('counter-frame', 0, 0, 0, 64, 32);
    }
    if (!texture.has('icon-frame')) {
      texture.add('icon-frame', 0, 64, 0, 32, 32);
    }

    RaceTimer.framesCreated = true;
  }

  setTime(msRemaining: number): void {
    const clamped = Math.max(0, msRemaining);
    const totalSeconds = Math.floor(clamped / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    this.setTextGroup(this.minutesText, this.minutesOutline, mm);
    this.setTextGroup(this.secondsText, this.secondsOutline, ss);
    this.updateTextLayout();
  }

  private createTextGroup(
    scene: Phaser.Scene,
    text: string,
    outlines: Phaser.GameObjects.BitmapText[]
  ): Phaser.GameObjects.BitmapText {
    for (const [dx, dy] of RaceTimer.OUTLINE_OFFSETS) {
      const outline = scene.add.bitmapText(0, 0, TIMER_FONT_KEY, text, UI_FONT_SIZE_SM);
      outline.setOrigin(0, 0.5);
      outline.setTint(0x000000);
      outline.setPosition(dx, dy);
      outlines.push(outline);
      this.add(outline);
    }

    const main = scene.add.bitmapText(0, 0, TIMER_FONT_KEY, text, UI_FONT_SIZE_SM);
    main.setOrigin(0, 0.5);
    main.setTint(0xffffff);
    this.add(main);
    return main;
  }

  private setTextGroup(
    main: Phaser.GameObjects.BitmapText,
    outlines: Phaser.GameObjects.BitmapText[],
    text: string
  ): void {
    main.setText(text);
    for (const outline of outlines) {
      outline.setText(text);
    }
  }

  private updateTextLayout(): void {
    const baseX = RaceTimer.TEXT_OFFSET_X;
    const baseY = RaceTimer.TEXT_OFFSET_Y;

    const minutesW = this.minutesText.width;
    const colonW = this.colonText.width;
    const secondsW = this.secondsText.width;
    const gap = RaceTimer.COLON_GAP;
    const totalWidth = minutesW + secondsW + colonW + gap * 2 - RaceTimer.COLON_TIGHTEN;
    let x = baseX - totalWidth / 2;

    this.minutesText.setPosition(x, baseY);
    for (let i = 0; i < this.minutesOutline.length; i++) {
      const [dx, dy] = RaceTimer.OUTLINE_OFFSETS[i];
      this.minutesOutline[i].setPosition(x + dx, baseY + dy);
    }
    x += minutesW + gap;

    this.colonText.setPosition(x, baseY);
    for (let i = 0; i < this.colonOutline.length; i++) {
      const [dx, dy] = RaceTimer.OUTLINE_OFFSETS[i];
      this.colonOutline[i].setPosition(x + dx, baseY + dy);
    }
    x += colonW + gap - RaceTimer.COLON_TIGHTEN;

    this.secondsText.setPosition(x, baseY);
    for (let i = 0; i < this.secondsOutline.length; i++) {
      const [dx, dy] = RaceTimer.OUTLINE_OFFSETS[i];
      this.secondsOutline[i].setPosition(x + dx, baseY + dy);
    }
  }
}
