import Phaser from 'phaser';
import {
  TILE_SIZE,
  TILE_INDICES,
  LAYOUT,
  DUCK_VARIANTS,
  DEFAULT_NAMES,
  RACE_START_X,
  WATER_SCROLL_SPEED,
  WATER_TRANSITION_SCROLL_RATIO,
  getDuckDisplayConfig,
  UI_FONT_KEY,
  UI_FONT_SIZE_MD,
} from '../config/constants';
import { Duck } from '../entities/Duck';
import { Button } from '../ui/Button';
import { RaceController } from '../systems/RaceController';
import { SeededRandom } from '../systems/SeededRandom';
import type { RaceState, GameSceneData } from '../config/types';

export class GameScene extends Phaser.Scene {
  private ducks: Duck[] = [];
  private waterTiles: Phaser.GameObjects.TileSprite[] = [];
  private raceController!: RaceController;
  private startButton!: Button;
  private keepWinnerButton!: Button;
  private removeWinnerButton!: Button;
  private menuButton!: Button;
  private winnerText!: Phaser.GameObjects.BitmapText;
  private seed?: number;
  private customNames?: string[];
  private lastWinnerName: string | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    // Reset instance state (Phaser reuses the same scene instance on restart)
    this.ducks = [];
    this.waterTiles = [];
    this.lastWinnerName = null;

    // Check for test mode seed
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    if (seedParam) {
      this.seed = parseInt(seedParam, 10);
    }

    // Store custom names if provided
    this.customNames = data?.customNames;
  }

  create(): void {
    // Lock camera - prevent any scrolling
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.setZoom(1);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.useBounds = true;

    this.createTileBackground();
    this.createDuckAnimations();
    this.createDucks();
    this.createRaceController();
    this.createUI();
    this.setupTestSeam();
  }

  update(_time: number, delta: number): void {
    // Force camera to stay at origin
    this.cameras.main.setScroll(0, 0);

    // Update race controller
    this.raceController.update(delta);

    // Scroll water tiles only during the race
    if (this.raceController.getState() === 'racing') {
      const baseScroll = WATER_SCROLL_SPEED * (delta / 1000);
      for (let i = 0; i < this.waterTiles.length; i++) {
        const speed = i < 2 ? baseScroll * WATER_TRANSITION_SCROLL_RATIO : baseScroll;
        this.waterTiles[i].tilePositionX += speed;
      }
    }

    // Update all ducks
    for (const duck of this.ducks) {
      duck.update(delta);
    }
  }

  private createTileBackground(): void {
    const cols = Math.ceil(this.scale.width / TILE_SIZE);
    const width = this.scale.width;

    // Rows 0-1: Grass solid (static)
    for (let row = LAYOUT.GRASS_TOP_START; row <= LAYOUT.GRASS_TOP_END; row++) {
      this.createUniformTileRow(row, cols, TILE_INDICES.GRASS_SOLID);
    }

    // Row 2: Grass-to-water transition (TileSprite, slower scroll)
    const grassBottomVariant = TILE_INDICES.GRASS_BOTTOM_VARIANTS[
      Math.floor(Math.random() * TILE_INDICES.GRASS_BOTTOM_VARIANTS.length)
    ];
    this.createWaterTileSprite(LAYOUT.GRASS_TO_WATER, width, grassBottomVariant);

    // Row 3: Water-to-grass transition (TileSprite, slower scroll)
    const waterTopVariant = TILE_INDICES.WATER_TOP_VARIANTS[
      Math.floor(Math.random() * TILE_INDICES.WATER_TOP_VARIANTS.length)
    ];
    this.createWaterTileSprite(LAYOUT.WATER_TO_GRASS_BOTTOM, width, waterTopVariant);

    // Rows 4-13: Water solid (TileSprite, full scroll)
    for (let row = LAYOUT.WATER_START; row <= LAYOUT.WATER_END; row++) {
      this.createWaterTileSprite(row, width, TILE_INDICES.WATER_SOLID);
    }

    // Rows 14-16: Grass solid (static)
    for (let row = LAYOUT.GRASS_BOTTOM_START; row <= LAYOUT.GRASS_BOTTOM_END; row++) {
      this.createUniformTileRow(row, cols, TILE_INDICES.GRASS_SOLID);
    }
  }

  private createUniformTileRow(row: number, cols: number, tileIndex: number): void {
    const y = row * TILE_SIZE;
    for (let col = 0; col < cols; col++) {
      this.add.image(col * TILE_SIZE, y, 'tiles', tileIndex).setOrigin(0, 0);
    }
  }

  private createWaterTileSprite(row: number, width: number, frameIndex: number): void {
    const y = row * TILE_SIZE;
    const tile = this.add.tileSprite(0, y, width, TILE_SIZE, 'tiles', frameIndex);
    tile.setOrigin(0, 0);
    tile.setDepth(0);
    this.waterTiles.push(tile);
  }

  private createDuckAnimations(): void {
    for (const variant of DUCK_VARIANTS) {
      if (!this.anims.exists(`swim-${variant.name}`)) {
        this.anims.create({
          key: `swim-${variant.name}`,
          frames: this.anims.generateFrameNumbers('ducks', {
            start: variant.startFrame,
            end: variant.endFrame,
          }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
  }

  private createDucks(): void {
    const waterStartY = LAYOUT.WATER_START * TILE_SIZE;
    const waterEndY = (LAYOUT.WATER_END + 1) * TILE_SIZE;

    const names = this.customNames ?? DEFAULT_NAMES;
    const duckCount = names.length;
    const waterHeight = waterEndY - waterStartY;
    const spacing = waterHeight / (duckCount + 1);

    const displayConfig = getDuckDisplayConfig(duckCount);

    // Separate RNG for skin assignment (offset seed to not interfere with race RNG)
    const skinSeed = (this.seed ?? Date.now()) + 1000;
    const skinRng = new SeededRandom(skinSeed);

    for (let i = 0; i < duckCount; i++) {
      const variantIndex = skinRng.nextInt(0, DUCK_VARIANTS.length - 1);
      const variant = DUCK_VARIANTS[variantIndex];
      const laneY = Math.round(waterStartY + spacing * (i + 1));

      const duck = new Duck(this, {
        name: names[i],
        variant,
        laneY,
        startX: RACE_START_X,
        scale: displayConfig.duckScale,
        labelFontSize: displayConfig.labelFontSize,
        labelOffsetY: displayConfig.labelOffsetY,
        depth: 10 + i * 2,
      });

      this.ducks.push(duck);
    }
  }

  private createRaceController(): void {
    this.raceController = new RaceController(
      this,
      this.ducks,
      this.seed,
      (winner) => this.onRaceComplete(winner)
    );
  }

  private createUI(): void {
    const centerX = this.scale.width / 2;
    const topY = 12;

    // Start button
    this.startButton = new Button(this, centerX, topY, 'Iniciar Corrida', () => {
      this.startRace();
    }, 80, 18);
    this.startButton.setDepth(200);
    this.startButton.setScrollFactor(0);

    // Keep Winner button (hidden initially)
    this.keepWinnerButton = new Button(this, centerX - 65, topY, 'Manter Vencedor', () => {
      this.restartKeepWinner();
    }, 80, 18);
    this.keepWinnerButton.setDepth(200);
    this.keepWinnerButton.setVisible(false);
    this.keepWinnerButton.setScrollFactor(0);

    // Remove Winner button (hidden initially)
    this.removeWinnerButton = new Button(this, centerX, topY, 'Remover Vencedor', () => {
      this.restartRemoveWinner();
    }, 80, 18);
    this.removeWinnerButton.setDepth(200);
    this.removeWinnerButton.setVisible(false);
    this.removeWinnerButton.setScrollFactor(0);

    // Menu button (hidden initially)
    this.menuButton = new Button(this, centerX + 65, topY, 'Menu', () => {
      this.scene.start('MainMenuScene');
    }, 80, 18);
    this.menuButton.setDepth(200);
    this.menuButton.setVisible(false);
    this.menuButton.setScrollFactor(0);

    // Winner text (hidden initially)
    this.winnerText = this.add.bitmapText(centerX, topY + 22, UI_FONT_KEY, '', UI_FONT_SIZE_MD);
    this.centerBitmapText(this.winnerText, centerX, topY + 22);
    this.winnerText.setTint(0xffeb3b);
    this.winnerText.setDepth(200);
    this.winnerText.setScrollFactor(0);
    this.winnerText.setVisible(false);
  }

  private startRace(): void {
    this.startButton.setVisible(false);
    this.keepWinnerButton.setVisible(false);
    this.removeWinnerButton.setVisible(false);
    this.menuButton.setVisible(false);
    this.winnerText.setVisible(false);

    this.raceController.startRace();
  }

  private onRaceComplete(winner: Duck): void {
    this.lastWinnerName = winner.name;

    // Show winner announcement
    this.winnerText.setText(`${winner.name} venceu!`);
    this.centerBitmapText(this.winnerText, this.scale.width / 2, 12 + 22);
    this.winnerText.setVisible(true);

    // Show restart options and menu button after a delay
    this.time.delayedCall(1500, () => {
      this.keepWinnerButton.setVisible(true);
      this.removeWinnerButton.setVisible(true);
      this.menuButton.setVisible(true);
    });
  }

  private restartKeepWinner(): void {
    const names = this.customNames ?? DEFAULT_NAMES;
    this.scene.start('GameScene', { customNames: names });
  }

  private restartRemoveWinner(): void {
    const names = this.customNames ?? DEFAULT_NAMES;
    const copy = [...names];
    const idx = copy.indexOf(this.lastWinnerName!);
    if (idx !== -1) copy.splice(idx, 1);

    if (copy.length < 2) {
      this.scene.start('MainMenuScene');
      return;
    }

    this.scene.start('GameScene', { customNames: copy });
  }

  private setupTestSeam(): void {
    const params = new URLSearchParams(window.location.search);
    const isTestMode = params.get('test') === '1';

    if (!isTestMode) return;

    window.__TEST__ = {
      ready: false,
      state: () => ({
        ready: window.__TEST__?.ready ?? false,
        raceState: this.raceController.getState(),
        elapsedTime: this.raceController.getElapsedTime(),
        ducks: this.ducks.map((d) => ({
          name: d.name,
          x: d.x,
          y: d.y,
          variant: d.variant.name,
        })),
        winner: this.raceController.getWinner()?.name ?? null,
        finishLineX: this.raceController.getFinishLineX(),
      }),
      skipToTime: (ms: number) => {
        this.raceController.skipToTime(ms);
      },
      setWinner: (index: number) => {
        this.raceController.forceWinner(index);
      },
      restartKeepWinner: () => {
        this.restartKeepWinner();
      },
      restartRemoveWinner: () => {
        this.restartRemoveWinner();
      },
      currentNames: () => {
        return this.customNames ?? DEFAULT_NAMES;
      },
    };

    // Mark as ready after first update
    this.time.delayedCall(100, () => {
      if (window.__TEST__) {
        window.__TEST__.ready = true;
      }
    });
  }

  // Public getters for test seam
  getDucks(): Duck[] {
    return this.ducks;
  }

  getRaceState(): RaceState {
    return this.raceController.getState();
  }

  private centerBitmapText(text: Phaser.GameObjects.BitmapText, centerX: number, y: number): void {
    const left = Math.round(centerX - text.width / 2);
    text.setOrigin(0, 0.5);
    text.setPosition(left, Math.round(y));
  }
}
