export type Position = { x: number; y: number };
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameState =
  | "MENU"
  | "PLAYING"
  | "PAUSED"
  | "GAME_OVER"
  | "LEVEL_COMPLETE"
  | "LOADING";

export interface Level {
  id: number;
  name: string;
  description: string;
  gridSize: number;
  obstacles: Position[];
  foodTarget: number;
  speed: number;
  color: string;
  allowWallWrap: boolean;
}

export interface GameStats {
  score: number;
  foodEaten: number;
  moves: number;
  timeElapsed: number;
}

export interface GameSettings {
  nokiaMode: boolean;
  soundEnabled: boolean;
  showGrid: boolean;
}
