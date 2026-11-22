// types/ludo.ts
export type LudoColor = "red" | "green" | "yellow" | "blue" | "orange" | "purple";

export const LUDO_COLORS: LudoColor[] = ["red", "green", "yellow", "blue", "orange", "purple"];

// How many arms (and so seats) the board has: the classic square board, or the hexagon for up to six
export type BoardSize = 4 | 6;

// Each board's colours clockwise from red, which is also the turn order. Red always sits opposite yellow.
export const BOARD_COLORS: Record<BoardSize, LudoColor[]> = {
  4: ["red", "green", "yellow", "blue"],
  6: ["red", "green", "orange", "yellow", "blue", "purple"],
};

export type BotLevel = "easy" | "medium" | "hard";

// Something worth telling the players about after a roll or move
export type LudoNote =
  | { kind: "no-move"; color: LudoColor; value: number }
  | { kind: "three-sixes"; color: LudoColor }
  | { kind: "capture"; color: LudoColor; victims: LudoColor[] }
  | { kind: "home"; color: LudoColor };

/**
 * One game of Ludo. Each token's position is its progress along its own colour's path:
 * -1 in the base, then the shared track from its start square (0), five squares up its home
 * column, and home. On the classic board that's 0–50 on the track, 51–55 in the home column
 * and 56 home; every extra pair of arms adds 26 track squares (see lib/ludo-rules.ts).
 */
export interface LudoGame {
  arms: BoardSize;
  players: LudoColor[]; // still playing, in turn order
  tokens: Record<LudoColor, number[]>;
  turn: LudoColor;
  phase: "roll" | "move";
  roll: { color: LudoColor; value: number } | null; // most recent roll
  rolls: number; // counts every roll, so the UI can animate repeat values
  sixes: number; // sixes in a row this turn
  lastMove: { color: LudoColor; token: number; from: number; to: number } | null;
  note: LudoNote | null;
  status: "playing" | "finished";
  winner: LudoColor | null;
}

// Public state of an online room, broadcast to every player (no socket ids)
export interface OnlineLudoState {
  arms: BoardSize;
  seats: Record<LudoColor, boolean>; // whether each colour is taken
  status: "waiting" | "playing" | "finished";
  game: LudoGame | null; // null until the first game starts
  score: Record<LudoColor, number>;
  version: number; // bumps on every save, so clients can ignore updates that arrive out of order
}

export const ludoChannel = (gameId: string): string => `private-ludo-${gameId}`;

export const LUDO_COLOR_NAMES: Record<LudoColor, string> = {
  red: "Red",
  green: "Green",
  yellow: "Yellow",
  blue: "Blue",
  orange: "Orange",
  purple: "Purple",
};
