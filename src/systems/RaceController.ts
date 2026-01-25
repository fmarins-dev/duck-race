import Phaser from 'phaser';
import { Duck } from '../entities/Duck';
import { SeededRandom } from './SeededRandom';
import {
  RACE_DURATION_MS,
  FINISH_LINE_X_RATIO,
  FINISH_LINE_ENTRY_TIME,
  FINISH_LINE_ENTER_DURATION,
  RACE_START_X,
  TILE_SIZE,
} from '../config/constants';
import type { RaceState, TrajectoryKeyframe } from '../config/types';

export class RaceController {
  private scene: Phaser.Scene;
  private ducks: Duck[];
  private rng: SeededRandom;
  private winner: Duck | null = null;
  private winnerIndex: number = -1;

  private raceState: RaceState = 'idle';
  private elapsedTime: number = 0;

  private finishX: number;
  private finishLine: Phaser.GameObjects.Rectangle | null = null;
  private finishLineStartX: number = 0;

  private trajectories: Map<Duck, TrajectoryKeyframe[]> = new Map();

  private onRaceComplete?: (winner: Duck) => void;

  constructor(
    scene: Phaser.Scene,
    ducks: Duck[],
    seed?: number,
    onRaceComplete?: (winner: Duck) => void
  ) {
    this.scene = scene;
    this.ducks = ducks;
    this.rng = new SeededRandom(seed);
    this.onRaceComplete = onRaceComplete;

    this.finishX = scene.scale.width * FINISH_LINE_X_RATIO;
    this.finishLineStartX = scene.scale.width + 100;

    this.createFinishLine();
  }

  private createFinishLine(): void {
    // Calculate water-main area (where the finish line should appear)
    // Layout: 5 sky rows + 1 ground + 1 water-top = 7 rows before water-main
    const waterMainStartY = 7 * TILE_SIZE;
    // water-main ends where water-bottom starts
    const waterMainEndY = this.scene.scale.height - TILE_SIZE;
    const waterMainHeight = waterMainEndY - waterMainStartY;
    const waterMainCenterY = waterMainStartY + waterMainHeight / 2;

    // Create a simple checkered finish line (only in water-main area)
    const lineWidth = 20;

    this.finishLine = this.scene.add.rectangle(
      this.finishLineStartX,
      waterMainCenterY,
      lineWidth,
      waterMainHeight,
      0xffffff
    );
    // Set depth low so it's behind ducks but in front of tiles
    this.finishLine.setDepth(1);

    // Add checkered pattern effect
    const graphics = this.scene.add.graphics();
    graphics.setDepth(1);

    // Store graphics reference and water-main bounds for positioning
    (this.finishLine as any).checkeredGraphics = graphics;
    (this.finishLine as any).waterMainStartY = waterMainStartY;
    (this.finishLine as any).waterMainHeight = waterMainHeight;
  }

  private updateCheckeredPattern(): void {
    if (!this.finishLine) return;

    const graphics = (this.finishLine as any).checkeredGraphics as Phaser.GameObjects.Graphics;
    if (!graphics) return;

    const waterMainStartY = (this.finishLine as any).waterMainStartY as number;
    const waterMainHeight = (this.finishLine as any).waterMainHeight as number;

    graphics.clear();

    const x = this.finishLine.x - 10;
    const squareSize = 20;
    const numSquares = Math.ceil(waterMainHeight / squareSize);

    for (let i = 0; i < numSquares; i++) {
      const y = waterMainStartY + i * squareSize;
      // Alternating black and white squares
      graphics.fillStyle(i % 2 === 0 ? 0x000000 : 0xffffff);
      graphics.fillRect(x, y, squareSize, squareSize);
    }
  }

  getState(): RaceState {
    return this.raceState;
  }

  getElapsedTime(): number {
    return this.elapsedTime;
  }

  getWinner(): Duck | null {
    return this.winner;
  }

  getFinishLineX(): number {
    return this.finishLine?.x ?? this.finishLineStartX;
  }

  forceWinner(index: number): void {
    if (index >= 0 && index < this.ducks.length) {
      this.winnerIndex = index;
      this.winner = this.ducks[index];
    }
  }

  skipToTime(ms: number): void {
    if (this.raceState !== 'racing') return;

    // Jump to specified time
    const targetTime = Math.min(ms, RACE_DURATION_MS);
    this.elapsedTime = targetTime;

    // Update all positions immediately
    this.updateDuckPositions();
    this.updateFinishLinePosition();

    if (this.elapsedTime >= RACE_DURATION_MS) {
      this.endRace();
    }
  }

  startRace(): void {
    if (this.raceState === 'racing') return;

    this.raceState = 'racing';
    this.elapsedTime = 0;

    // Pre-determine winner if not already set
    if (this.winnerIndex < 0) {
      this.winnerIndex = this.rng.pickIndex(this.ducks);
    }
    this.winner = this.ducks[this.winnerIndex];

    // Position ducks at start
    this.ducks.forEach((duck) => {
      duck.setPosition(RACE_START_X);
    });

    // Calculate trajectories for all ducks
    this.calculateTrajectories();

    // Reset finish line position
    if (this.finishLine) {
      this.finishLine.x = this.finishLineStartX;
    }
  }

  private calculateTrajectories(): void {
    this.trajectories.clear();

    const numKeyframes = 30; // One keyframe every 500ms

    this.ducks.forEach((duck, index) => {
      const isWinner = index === this.winnerIndex;
      const keyframes: TrajectoryKeyframe[] = [];

      // Winner ends past finish line, others fall short
      const endX = isWinner
        ? this.finishX + 80
        : this.finishX - this.rng.nextInt(50, 250);

      const totalDistance = endX - RACE_START_X;

      for (let i = 0; i <= numKeyframes; i++) {
        const t = i / numKeyframes; // 0 to 1
        const time = t * RACE_DURATION_MS;

        // Base position (slightly eased progress)
        const easedT = this.easeInOutQuad(t);
        let x = RACE_START_X + totalDistance * easedT;

        // Add oscillation for "jockey for position" effect
        // More variance in middle of race, less at start/end
        if (i > 0 && i < numKeyframes) {
          const varianceFactor = Math.sin(t * Math.PI); // Peak at 0.5
          const oscillation = Math.sin(t * Math.PI * 6 + index * 1.5) * 40 * varianceFactor;
          const randomVariance = this.rng.nextFloat(-20, 20) * varianceFactor;
          x += oscillation + randomVariance;
        }

        keyframes.push({ time, x });
      }

      // Ensure final position is exact
      keyframes[keyframes.length - 1].x = endX;

      this.trajectories.set(duck, keyframes);
    });
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  update(delta: number): void {
    if (this.raceState !== 'racing') return;

    this.elapsedTime += delta;

    this.updateDuckPositions();
    this.updateFinishLinePosition();

    // Check for race completion
    if (this.elapsedTime >= RACE_DURATION_MS) {
      this.endRace();
    }
  }

  private updateDuckPositions(): void {
    for (const duck of this.ducks) {
      const keyframes = this.trajectories.get(duck);
      if (!keyframes) continue;

      const targetX = this.interpolatePosition(keyframes, this.elapsedTime);
      duck.setTarget(targetX);
    }
  }

  private interpolatePosition(keyframes: TrajectoryKeyframe[], time: number): number {
    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, RACE_DURATION_MS));

    // Find surrounding keyframes
    let lower = keyframes[0];
    let upper = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (keyframes[i].time <= clampedTime && keyframes[i + 1].time >= clampedTime) {
        lower = keyframes[i];
        upper = keyframes[i + 1];
        break;
      }
    }

    // Handle edge case
    if (upper.time === lower.time) return lower.x;

    // Linear interpolation between keyframes
    const segmentProgress = (clampedTime - lower.time) / (upper.time - lower.time);
    return lower.x + (upper.x - lower.x) * segmentProgress;
  }

  private updateFinishLinePosition(): void {
    if (!this.finishLine) return;

    if (this.elapsedTime < FINISH_LINE_ENTRY_TIME) {
      // Finish line still off-screen
      this.finishLine.x = this.finishLineStartX;
      this.updateCheckeredPattern();
      return;
    }

    // Calculate finish line position (enters from right)
    const entryProgress =
      (this.elapsedTime - FINISH_LINE_ENTRY_TIME) / FINISH_LINE_ENTER_DURATION;
    const clampedProgress = Math.min(entryProgress, 1);

    // Ease-out for natural deceleration
    const easedProgress = 1 - Math.pow(1 - clampedProgress, 2);

    this.finishLine.x =
      this.finishLineStartX + (this.finishX - this.finishLineStartX) * easedProgress;

    this.updateCheckeredPattern();
  }

  private endRace(): void {
    this.raceState = 'finished';

    // Stop all ducks
    this.ducks.forEach((duck) => duck.stopMoving());

    // Ensure winner is past finish line
    if (this.winner) {
      const finalX = this.finishX + 80;
      this.winner.setTarget(finalX);
    }

    // Trigger callback
    if (this.onRaceComplete && this.winner) {
      this.onRaceComplete(this.winner);
    }
  }

  reset(): void {
    this.raceState = 'idle';
    this.elapsedTime = 0;
    this.winner = null;
    this.winnerIndex = -1;
    this.trajectories.clear();

    // Reset finish line
    if (this.finishLine) {
      this.finishLine.x = this.finishLineStartX;
    }
    this.updateCheckeredPattern();

    // Reset duck positions
    this.ducks.forEach((duck) => {
      duck.setPosition(RACE_START_X);
      duck.stopMoving();
    });
  }

  destroy(): void {
    if (this.finishLine) {
      const graphics = (this.finishLine as any).checkeredGraphics;
      if (graphics) graphics.destroy();
      this.finishLine.destroy();
    }
  }
}
