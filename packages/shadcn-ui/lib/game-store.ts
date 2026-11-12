// lib/game-store.ts
import type { Board, GameState, Mark } from "../types/game";

interface StoredGame {
  state: GameState;
  sockets: Record<Mark, string | null>; // Pusher socket id of each player
  updatedAt: number;
}

// In-memory store, NOT FOR PRODUCTION: games are lost on restart, and serverless
// hosts (e.g. Vercel) run routes in separate instances. Use Redis or a database there.
// Kept on globalThis so every route handler shares one store and it survives dev reloads.
const globalForGames = globalThis as typeof globalThis & {
  ticTacToeGames?: Map<string, StoredGame>;
};
const games = (globalForGames.ticTacToeGames ??= new Map());

const GAME_TTL_MS = 2 * 60 * 60 * 1000;

const pruneStaleGames = () => {
  const now = Date.now();
  games.forEach((game, id) => {
    if (now - game.updatedAt > GAME_TTL_MS) games.delete(id);
  });
};

export const emptyBoard = (): Board => Array(9).fill(null);

export const getGame = (gameId: string): StoredGame | undefined =>
  games.get(gameId);

export const createGame = (gameId: string, socketId: string): StoredGame => {
  pruneStaleGames();
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
    updatedAt: Date.now(),
  };
  games.set(gameId, game);
  return game;
};

export const saveGame = (gameId: string, game: StoredGame): StoredGame => {
  game.updatedAt = Date.now();
  games.set(gameId, game);
  return game;
};

export const deleteGame = (gameId: string) => {
  games.delete(gameId);
};

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
