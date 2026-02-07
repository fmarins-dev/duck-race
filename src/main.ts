import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from './config/constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: COLORS.GRASS_GREEN,
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    zoom: 1,
    autoRound: true,
  },
  scene: [BootScene, MainMenuScene, GameScene],
};

const game = new Phaser.Game(config);

const applyIntegerScale = (): void => {
  const parent = game.scale.parent as HTMLElement | null;
  const parentWidth = parent?.clientWidth ?? window.innerWidth;
  const parentHeight = parent?.clientHeight ?? window.innerHeight;
  const zoom = Math.max(
    1,
    Math.floor(Math.min(parentWidth / GAME_WIDTH, parentHeight / GAME_HEIGHT))
  );
  game.scale.setZoom(zoom);
};

applyIntegerScale();
window.addEventListener('resize', applyIntegerScale);

// Expose for debugging
(window as any).game = game;
