// types/game.ts
export type Player = "X" | "O" | null;
export type Board = (Player | null)[];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | "Draw" | null;
  players: { X: string | null; O: string | null }; // socketId of players
  status: "waiting" | "playing" | "finished";
}
