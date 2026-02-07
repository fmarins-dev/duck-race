import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { ManualNamesPopup } from '../ui/ManualNamesPopup';
import {
  GAME_WIDTH,
  MENU_TITLE_Y,
  MENU_BUTTONS_START_Y,
  MENU_BUTTON_SPACING,
  UI_FONT_KEY,
  UI_FONT_SIZE_SM,
  UI_FONT_SIZE_LG,
} from '../config/constants';

export class MainMenuScene extends Phaser.Scene {
  private popup: ManualNamesPopup | null = null;
  private twitchButton!: Button;
  private discordButton!: Button;
  private manualButton!: Button;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.cameras.main.roundPixels = true;
    const centerX = GAME_WIDTH / 2;

    // Title
    const title = this.add.bitmapText(centerX, MENU_TITLE_Y, UI_FONT_KEY, 'Duck Race', UI_FONT_SIZE_LG);
    this.centerBitmapText(title, centerX, MENU_TITLE_Y);
    title.setTint(0xffffff);

    // Subtitle
    const subtitle = this.add.bitmapText(
      centerX,
      MENU_TITLE_Y + 20,
      UI_FONT_KEY,
      'Escolha como adicionar participantes',
      UI_FONT_SIZE_SM
    );
    this.centerBitmapText(subtitle, centerX, MENU_TITLE_Y + 20);
    subtitle.setTint(0xdfe6e9);

    // Create buttons
    this.createButtons(centerX);

    // Setup test seam
    this.setupTestSeam();
  }

  private createButtons(centerX: number): void {
    const startY = MENU_BUTTONS_START_Y;

    // Twitch button (disabled)
    this.twitchButton = new Button(
      this,
      centerX,
      startY,
      'Twitch (Em breve)',
      () => {}
    );
    this.twitchButton.setEnabled(false);

    // Discord button (disabled)
    this.discordButton = new Button(
      this,
      centerX,
      startY + MENU_BUTTON_SPACING,
      'Discord (Em breve)',
      () => {}
    );
    this.discordButton.setEnabled(false);

    // Manual names button (enabled)
    this.manualButton = new Button(
      this,
      centerX,
      startY + MENU_BUTTON_SPACING * 2,
      'Nomes Manuais',
      () => this.showManualNamesPopup()
    );
  }

  private showManualNamesPopup(): void {
    if (this.popup) return;

    // Disable menu buttons while popup is open
    this.manualButton.setEnabled(false);

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

    // Re-enable menu button
    this.manualButton.setEnabled(true);

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

  private centerBitmapText(text: Phaser.GameObjects.BitmapText, centerX: number, y: number): void {
    const left = Math.round(centerX - text.width / 2);
    text.setOrigin(0, 0.5);
    text.setPosition(left, Math.round(y));
  }
}
