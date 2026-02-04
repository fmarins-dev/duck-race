import type { DUCK_VARIANTS } from './constants';

export type RaceState = 'idle' | 'ready' | 'racing' | 'finished';

export type DuckVariant = (typeof DUCK_VARIANTS)[number];

export interface DuckConfig {
  name: string;
  variant: DuckVariant;
  laneY: number;
  startX: number;
  scale: number;
  labelFontSize: number;
  labelOffsetY: number;
  depth: number;
}

export interface TrajectoryKeyframe {
  time: number;
  x: number;
}

export interface TestState {
  ready: boolean;
  raceState: RaceState;
  elapsedTime: number;
  ducks: Array<{
    name: string;
    x: number;
    y: number;
    variant: string;
  }>;
  winner: string | null;
  finishLineX: number;
}

export interface TestInterface {
  ready: boolean;
  state: () => TestState;
  skipToTime?: (ms: number) => void;
  setWinner?: (index: number) => void;
}

export interface MenuTestInterface {
  ready: boolean;
  popupVisible: boolean;
  openPopup: () => void;
  closePopup: () => void;
  setNames: (names: string[]) => void;
  submitNames: () => void;
}

export interface GameSceneData {
  customNames?: string[];
}

declare global {
  interface Window {
    __TEST__?: TestInterface;
    __TEST_MENU__?: MenuTestInterface;
  }
}
