// lib/game-store.ts
import type { GameState, Board, Player } from "../types/game";

const initialBoard: Board = Array(9).fill(null);

// In-memory store for game states. NOT FOR PRODUCTION.
// In production, use a database like Redis, Supabase, or PostgreSQL.
const games: { [gameId: string]: GameState } = {};

export const getGame = (gameId: string): GameState | undefined => {
  return games[gameId];
};

export const createNewGame = (gameId: string): GameState => {
  const newGame: GameState = {
    board: initialBoard,
    currentPlayer: "X",
    winner: null,
    players: { X: null, O: null },
    status: "waiting",
  };
  games[gameId] = newGame;
  return newGame;
};

export const updateGame = (
  gameId: string,
  newState: Partial<GameState>
): GameState | undefined => {
  if (games[gameId]) {
    games[gameId] = { ...games[gameId], ...newState };
    return games[gameId];
  }
  return undefined;
};

export const deleteGame = (gameId: string) => {
  delete games[gameId];
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

export const checkWinner = (currentBoard: Board): Player | "Draw" | null => {
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return currentBoard[a];
    }
  }
  if (currentBoard.every((cell) => cell !== null)) {
    return "Draw";
  }
  return null;
};
