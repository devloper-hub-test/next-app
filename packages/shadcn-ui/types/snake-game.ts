export type Position = { x: number; y: number };
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameStatus =
  | "MENU"
  | "READY" // board shown, waiting for the first move
  | "PLAYING"
  | "PAUSED"
  | "GAME_OVER"
  | "LEVEL_COMPLETE";

export interface Level {
  id: number;
  name: string;
  description: string;
  gridSize: number;
  obstacles: Position[];
  foodTarget: number;
  speed: number; // ms per move
  color: string;
  allowWallWrap: boolean;
}

export interface SnakeState {
  status: GameStatus;
  levelIndex: number;
  snake: Position[]; // head first
  direction: Direction;
  queuedTurns: Direction[]; // turns pressed faster than the snake moves
  food: Position | null;
  score: number;
  foodEaten: number;
  moves: number;
  crash: Position | null; // where the snake died
}

export interface GameSettings {
  nokiaMode: boolean;
  soundEnabled: boolean;
  showGrid: boolean;
}

export interface SnakeProgress {
  completedLevels: number[]; // level ids
  bestScores: Record<number, number>; // level id -> best score
}
