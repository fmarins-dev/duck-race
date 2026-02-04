import Phaser from 'phaser';
import {
  TILE_SIZE,
  TILE_INDICES,
  DUCK_VARIANTS,
  DEFAULT_NAMES,
  RACE_START_X,
  getDuckDisplayConfig,
} from '../config/constants';
import { Duck } from '../entities/Duck';
import { Button } from '../ui/Button';
import { RaceController } from '../systems/RaceController';
import { SeededRandom } from '../systems/SeededRandom';
import type { RaceState, GameSceneData } from '../config/types';

export class GameScene extends Phaser.Scene {
  private ducks: Duck[] = [];
  private raceController!: RaceController;
  private startButton!: Button;
  private restartButton!: Button;
  private menuButton!: Button;
  private winnerText!: Phaser.GameObjects.Text;
  private seed?: number;
  private customNames?: string[];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    // Reset instance state (Phaser reuses the same scene instance on restart)
    this.ducks = [];

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

    // Update all ducks
    for (const duck of this.ducks) {
      duck.update(delta);
    }
  }

  private createTileBackground(): void {
    const gameHeight = this.scale.height;
    const skyRows = 5;
    let currentY = skyRows * TILE_SIZE;

    this.createTileRow(currentY, TILE_INDICES.GROUND);
    currentY += TILE_SIZE;

    this.createTileRow(currentY, TILE_INDICES.WATER_TOP);
    currentY += TILE_SIZE;

    const waterBottomY = gameHeight - TILE_SIZE;
    while (currentY < waterBottomY) {
      this.createTileRow(currentY, TILE_INDICES.WATER_MAIN);
      currentY += TILE_SIZE;
    }

    this.createTileRow(currentY, TILE_INDICES.WATER_BOTTOM);
  }

  private createTileRow(y: number, tileIndex: number): void {
    const gameWidth = this.scale.width;
    const tilesNeeded = Math.ceil(gameWidth / TILE_SIZE);

    for (let col = 0; col < tilesNeeded; col++) {
      this.add.image(col * TILE_SIZE, y, 'tiles', tileIndex).setOrigin(0, 0);
    }
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
    const gameHeight = this.scale.height;
    const waterStartY = 5 * TILE_SIZE + TILE_SIZE + TILE_SIZE;
    const waterEndY = gameHeight - TILE_SIZE;

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
      const laneY = waterStartY + spacing * (i + 1);

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
    const topY = 50;

    // Start button
    this.startButton = new Button(this, centerX, topY, 'Iniciar Corrida', () => {
      this.startRace();
    });
    this.startButton.setDepth(200);
    this.startButton.setScrollFactor(0);

    // Restart button (hidden initially)
    this.restartButton = new Button(this, centerX - 110, topY, 'Reiniciar', () => {
      this.restartRace();
    });
    this.restartButton.setDepth(200);
    this.restartButton.setVisible(false);
    this.restartButton.setScrollFactor(0);

    // Menu button (hidden initially)
    this.menuButton = new Button(this, centerX + 110, topY, 'Menu', () => {
      this.scene.start('MainMenuScene');
    });
    this.menuButton.setDepth(200);
    this.menuButton.setVisible(false);
    this.menuButton.setScrollFactor(0);

    // Winner text (hidden initially)
    this.winnerText = this.add.text(centerX, topY + 80, '', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffeb3b',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
    });
    this.winnerText.setOrigin(0.5, 0.5);
    this.winnerText.setDepth(200);
    this.winnerText.setScrollFactor(0);
    this.winnerText.setVisible(false);
  }

  private startRace(): void {
    this.startButton.setVisible(false);
    this.restartButton.setVisible(false);
    this.menuButton.setVisible(false);
    this.winnerText.setVisible(false);

    this.raceController.startRace();
  }

  private onRaceComplete(winner: Duck): void {
    // Show winner announcement
    this.winnerText.setText(`${winner.name} venceu!`);
    this.winnerText.setVisible(true);

    // Show restart and menu buttons after a delay
    this.time.delayedCall(1500, () => {
      this.restartButton.setVisible(true);
      this.menuButton.setVisible(true);
    });
  }

  private restartRace(): void {
    // Reset race controller (generates new winner)
    this.raceController.reset();

    // Reset UI
    this.winnerText.setVisible(false);
    this.restartButton.setVisible(false);
    this.menuButton.setVisible(false);

    // If not in test mode with fixed seed, create new RNG
    if (!this.seed) {
      this.raceController = new RaceController(
        this,
        this.ducks,
        undefined,
        (winner) => this.onRaceComplete(winner)
      );
    }

    // Show start button
    this.time.delayedCall(300, () => {
      this.startButton.setVisible(true);
    });
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
}
