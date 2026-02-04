export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

export const TILE_SIZE = 16;
export const DUCK_SIZE = 32;

export const COLORS = {
  SKY_GREEN: 0x9acd7a,
};

export const TILE_INDICES = {
  // Note: Index 0 is unused (error tile in spritesheet)
  WATER_TOP: 1,    // Water tile bordering the ground
  GROUND: 2,       // Brown brick ground/shore
  WATER_BOTTOM: 3, // Water tile at screen bottom edge
  WATER_MAIN: 4,   // Repeating water tile for the lake/sea body
};

export const DUCK_VARIANTS = [
  { name: 'doge', startFrame: 0, endFrame: 2 },
  { name: 'viking', startFrame: 3, endFrame: 5 },
  { name: 'astronaut', startFrame: 6, endFrame: 8 },
  { name: 'mario', startFrame: 9, endFrame: 11 },
  { name: 'plain', startFrame: 12, endFrame: 14 },
] as const;

// Race Configuration
export const RACE_DURATION_MS = 15000;
export const RACE_DURATION_SEC = 15;

// Positions
export const RACE_START_X = -150;
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
  return { duckScale: 3.5, labelFontSize: 24, labelOffsetY: -55 };
}

// UI
export const BUTTON_WIDTH = 340;
export const BUTTON_HEIGHT = 70;

// Menu
export const MENU_BUTTON_SPACING = 100;
export const MENU_TITLE_Y = 250;
export const MENU_BUTTONS_START_Y = 450;

// Popup
export const POPUP_WIDTH = 500;
export const POPUP_HEIGHT = 500;
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
