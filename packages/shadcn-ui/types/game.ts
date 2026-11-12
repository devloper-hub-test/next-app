// types/game.ts
export type Mark = "X" | "O";
export type Player = Mark | null;
export type Board = Player[];

// Public game state, broadcast to both players. Socket ids stay on the server.
export interface GameState {
  board: Board;
  currentPlayer: Player;
  startingPlayer: Mark;
  winner: Mark | "Draw" | null;
  winningLine: number[] | null;
  players: Record<Mark, boolean>; // whether each seat is taken
  scores: Record<Mark | "draws", number>;
  status: "waiting" | "playing" | "finished";
}

export const gameChannel = (gameId: string): string => `private-game-${gameId}`;
