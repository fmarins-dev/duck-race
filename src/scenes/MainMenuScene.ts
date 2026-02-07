import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { ManualNamesPopup } from '../ui/ManualNamesPopup';
import {
  GAME_WIDTH,
  MENU_TITLE_Y,
  MENU_BUTTONS_START_Y,
  MENU_BUTTON_SPACING,
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
    const centerX = GAME_WIDTH / 2;

    // Title
    const title = this.add.text(centerX, MENU_TITLE_Y, 'Duck Race', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#2d3436',
      strokeThickness: 3,
    });
    title.setOrigin(0.5, 0.5);

    // Subtitle
    const subtitle = this.add.text(centerX, MENU_TITLE_Y + 20, 'Escolha como adicionar participantes', {
      fontSize: '8px',
      fontFamily: 'Arial, sans-serif',
      color: '#dfe6e9',
    });
    subtitle.setOrigin(0.5, 0.5);

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
}
