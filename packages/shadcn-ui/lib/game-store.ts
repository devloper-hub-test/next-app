// lib/game-store.ts
import type { Board, GameState, Mark } from "../types/game";
import { createKvStore } from "./kv-store";

interface StoredGame {
  state: GameState;
  sockets: Record<Mark, string | null>; // Pusher socket id of each player
}

// Shared Redis store in production, in-memory locally (see lib/kv-store.ts)
const games = createKvStore<StoredGame>("ttt", 2 * 60 * 60);

export const emptyBoard = (): Board => Array(9).fill(null);

export const getGame = (gameId: string): Promise<StoredGame | undefined> => games.get(gameId);

export const createGame = async (gameId: string, socketId: string): Promise<StoredGame> => {
  const game: StoredGame = {
    state: {
      board: emptyBoard(),
      currentPlayer: "X",
      startingPlayer: "X",
      winner: null,
      winningLine: null,
      players: { X: true, O: false },
      scores: { X: 0, O: 0, draws: 0 },
      status: "waiting",
    },
    sockets: { X: socketId, O: null },
  };
  await games.set(gameId, game);
  return game;
};

export const saveGame = async (gameId: string, game: StoredGame): Promise<StoredGame> => {
  await games.set(gameId, game);
  return game;
};

export const deleteGame = (gameId: string): Promise<void> => games.delete(gameId);

export const markForSocket = (game: StoredGame, socketId: unknown): Mark | null => {
  if (typeof socketId !== "string" || !socketId) return null;
  if (game.sockets.X === socketId) return "X";
  if (game.sockets.O === socketId) return "O";
  return null;
};

export const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

export const checkWinner = (
  board: Board
): Pick<GameState, "winner" | "winningLine"> => {
  for (const line of winningCombinations) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) {
      return { winner: mark, winningLine: line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: "Draw", winningLine: null };
  }
  return { winner: null, winningLine: null };
};
