export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

export const UI_FONT_KEY = 'press-start-2p';
export const UI_FONT_SIZE_SM = 10;
export const UI_FONT_SIZE_MD = 20;
export const UI_FONT_SIZE_LG = 30;

export const TILE_SIZE = 16;
export const DUCK_SIZE = 32;

export const COLORS = {
  GRASS_GREEN: 0x9acd7a,
};

export const TILE_INDICES = {
  GRASS_BOTTOM_VARIANTS: [0, 1, 2, 3],
  GRASS_SOLID: 4,
  WATER_TOP_VARIANTS: [5, 6, 7, 8],
  WATER_SOLID: 9,
};

// Tile layout zones (row indices, each row = 16px)
export const LAYOUT = {
  GRASS_TOP_START: 0,
  GRASS_TOP_END: 1,
  GRASS_TO_WATER: 2,
  WATER_TO_GRASS_BOTTOM: 3,
  WATER_START: 4,
  WATER_END: 13,
  GRASS_BOTTOM_START: 14,
  GRASS_BOTTOM_END: 16,
};

export const WATER_SCROLL_SPEED = 30; // px/s (para esquerda)
export const WATER_TRANSITION_SCROLL_RATIO = 0.6; // transicao mais lenta

export const DUCK_VARIANTS = [
  { name: 'doge', startFrame: 0, endFrame: 2 },
  { name: 'viking', startFrame: 3, endFrame: 5 },
  { name: 'astronaut', startFrame: 6, endFrame: 8 },
  { name: 'mario', startFrame: 9, endFrame: 11 },
  { name: 'plain', startFrame: 12, endFrame: 14 },
  { name: 'alien', startFrame: 15, endFrame: 17 },
  { name: 'wizard', startFrame: 18, endFrame: 20 },
  { name: 'cowboy', startFrame: 21, endFrame: 23 },
] as const;

// Race Configuration
export const RACE_DURATION_MS = 15000;
export const RACE_DURATION_SEC = 15;

// Positions
export const RACE_START_X = -40;
export const FINISH_LINE_X_RATIO = 0.5;
export const FINISH_LINE_ENTRY_TIME = 12000;
export const FINISH_LINE_ENTER_DURATION = 3000;

// Duck racing
export const MAX_NAMES = 25;
export const POSITION_UPDATE_INTERVAL = 500;

export function getDuckDisplayConfig(_duckCount: number): {
  duckScale: number;
  labelFontSize: number;
  labelOffsetY: number;
} {
  const scale = 1;
  const labelFontSize = UI_FONT_SIZE_SM;
  const labelOffsetY = -16;
  return { duckScale: scale, labelFontSize, labelOffsetY };
}

// UI
export const BUTTON_WIDTH = 170;
export const BUTTON_HEIGHT = 24;

// Menu
export const MENU_BUTTON_SPACING = 30;
export const MENU_TITLE_Y = 50;
export const MENU_BUTTONS_START_Y = 110;

// Popup
export const POPUP_WIDTH = 460;
export const POPUP_HEIGHT = 250;
export const POPUP_BG_COLOR = 0x2d3436;
export const POPUP_OVERLAY_ALPHA = 0.7;

// Default names
export const DEFAULT_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve',
  'Frank', 'Grace', 'Hank', 'Iris', 'Jack',
  'Karen', 'Leo', 'Mona', 'Nick', 'Olga',
  'Paul', 'Quinn', 'Rita', 'Sam', 'Tina',
  'Uriel', 'Vera', 'Will', 'Xena', 'Yara',
];
