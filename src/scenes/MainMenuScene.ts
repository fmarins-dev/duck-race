import Phaser from 'phaser';
import { ManualNamesPopup } from '../ui/ManualNamesPopup';
import {
  GAME_WIDTH,
  DUCK_VARIANTS,
  UI_FONT_KEY,
  UI_FONT_SIZE_SM,
  MENU_LOGO_Y,
  MENU_LOGO_SCALE,
  MENU_START_TEXT_Y,
  MENU_DUCK_SCALE,
} from '../config/constants';

interface MenuItem {
  label: string;
  action: () => void;
  arrow: Phaser.GameObjects.BitmapText;
  text: Phaser.GameObjects.BitmapText;
}

export class MainMenuScene extends Phaser.Scene {
  private popup: ManualNamesPopup | null = null;
  private menuItems: MenuItem[] = [];
  private selectedIndex = 0;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.menuItems = [];
    this.selectedIndex = 0;
    this.popup = null;

    this.cameras.main.roundPixels = true;
    const centerX = GAME_WIDTH / 2;

    // Background
    this.add.image(0, 0, 'menu-bg').setOrigin(0, 0);

    // Logo
    this.add.image(centerX, MENU_LOGO_Y, 'logo').setScale(MENU_LOGO_SCALE);

    // Decorative duck (plain, floating on water)
    this.createMenuDuck();

    // Menu options
    this.createMenuItems(centerX);

    // Keyboard input
    this.input.keyboard!.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard!.on('keydown-UP', () => this.changeSelection(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.changeSelection(1));

    // Setup test seam
    this.setupTestSeam();
  }

  private createMenuDuck(): void {
    const plain = DUCK_VARIANTS.find((v) => v.name === 'plain')!;

    if (!this.anims.exists('swim-plain')) {
      this.anims.create({
        key: 'swim-plain',
        frames: this.anims.generateFrameNumbers('ducks', {
          start: plain.startFrame,
          end: plain.endFrame,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    const duck = this.add.sprite(80, 210, 'ducks', plain.startFrame);
    duck.setScale(MENU_DUCK_SCALE);
    duck.play('swim-plain');

    // Bobbing tween (same as winner duck in GameScene)
    this.tweens.add({
      targets: duck,
      y: duck.y - 4,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createMenuItems(centerX: number): void {
    const gap = 6;
    const options = [
      { label: 'Start new race', action: () => this.showManualNamesPopup() },
    ];

    options.forEach((opt, i) => {
      const y = MENU_START_TEXT_Y + i * 20;

      // Measure to center arrow + label together
      const tempLabel = this.add.bitmapText(0, 0, UI_FONT_KEY, opt.label, UI_FONT_SIZE_SM);
      const tempArrow = this.add.bitmapText(0, 0, UI_FONT_KEY, '>', UI_FONT_SIZE_SM);
      const totalWidth = tempArrow.width + gap + tempLabel.width;
      const arrowWidth = tempArrow.width;
      tempLabel.destroy();
      tempArrow.destroy();

      const startX = Math.round(centerX - totalWidth / 2);

      const arrow = this.add.bitmapText(startX, y, UI_FONT_KEY, '>', UI_FONT_SIZE_SM);
      arrow.setOrigin(0, 0.5);
      arrow.setTint(0x284154);

      const text = this.add.bitmapText(
        startX + arrowWidth + gap, y, UI_FONT_KEY, opt.label, UI_FONT_SIZE_SM
      );
      text.setOrigin(0, 0.5);
      text.setTint(0x284154);

      // Click support
      text.setInteractive({ useHandCursor: true });
      arrow.setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => { this.selectedIndex = i; this.confirmSelection(); });
      arrow.on('pointerdown', () => { this.selectedIndex = i; this.confirmSelection(); });

      this.menuItems.push({ label: opt.label, action: opt.action, arrow, text });
    });

    this.updateSelection();
  }

  private changeSelection(dir: number): void {
    if (this.popup) return;
    this.selectedIndex = (this.selectedIndex + dir + this.menuItems.length) % this.menuItems.length;
    this.updateSelection();
  }

  private updateSelection(): void {
    this.menuItems.forEach((item, i) => {
      const selected = i === this.selectedIndex;
      item.arrow.setVisible(selected);

      // Blink tween on selected item
      this.tweens.killTweensOf([item.arrow, item.text]);
      if (selected) {
        item.arrow.setAlpha(1);
        item.text.setAlpha(1);
        this.tweens.add({
          targets: [item.arrow, item.text],
          alpha: 0,
          duration: 600,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      } else {
        item.arrow.setAlpha(1);
        item.text.setAlpha(1);
      }
    });
  }

  private confirmSelection(): void {
    if (this.popup) return;
    this.menuItems[this.selectedIndex].action();
  }

  private showManualNamesPopup(): void {
    if (this.popup) return;

    this.popup = new ManualNamesPopup(
      this,
      (names) => this.handleNamesSubmit(names),
      () => this.hidePopup()
    );

    // Update test seam
    if (window.__TEST_MENU__) {
      window.__TEST_MENU__.popupVisible = true;
    }
  }

  private hidePopup(): void {
    if (this.popup) {
      this.popup.destroy();
      this.popup = null;
    }

    // Update test seam
    if (window.__TEST_MENU__) {
      window.__TEST_MENU__.popupVisible = false;
    }
  }

  private handleNamesSubmit(names: string[]): void {
    this.hidePopup();
    this.scene.start('GameScene', { customNames: names });
  }

  private setupTestSeam(): void {
    const params = new URLSearchParams(window.location.search);
    const isTestMode = params.get('test') === '1';

    if (!isTestMode) return;

    window.__TEST_MENU__ = {
      ready: false,
      popupVisible: false,
      openPopup: () => this.showManualNamesPopup(),
      closePopup: () => this.hidePopup(),
      setNames: (names: string[]) => this.popup?.setNames(names),
      submitNames: () => this.popup?.submit(),
    };

    // Mark as ready after first update
    this.time.delayedCall(100, () => {
      if (window.__TEST_MENU__) {
        window.__TEST_MENU__.ready = true;
      }
    });
  }
}
