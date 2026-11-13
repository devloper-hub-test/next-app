// lib/chess-store.ts
import { Chess } from "chess.js";
import type { ChessResult, Color, OnlineChessState, Seat } from "../types/chess";
import { colorOfSeat } from "../types/chess";
import { createKvStore } from "./kv-store";

interface StoredChessGame {
  state: OnlineChessState;
  sockets: Record<Seat, string | null>; // Pusher socket id of each player
}

// Shared Redis store in production, in-memory locally (see lib/kv-store.ts)
const games = createKvStore<StoredChessGame>("chess", 6 * 60 * 60);

const START_FEN = new Chess().fen();

export const getChessGame = (gameId: string): Promise<StoredChessGame | undefined> => games.get(gameId);

export const createChessGame = async (gameId: string, socketId: string, hostColor: Color) => {
  const game: StoredChessGame = {
    state: {
      fen: START_FEN,
      moves: [],
      lastMove: null,
      hostColor,
      players: { host: true, guest: false },
      status: "waiting",
      result: null,
      score: { host: 0, guest: 0, draws: 0 },
    },
    sockets: { host: socketId, guest: null },
  };
  await games.set(gameId, game);
  return game;
};

export const saveChessGame = async (gameId: string, game: StoredChessGame) => {
  await games.set(gameId, game);
  return game;
};

export const deleteChessGame = (gameId: string): Promise<void> => games.delete(gameId);

export const seatForSocket = (game: StoredChessGame, socketId: unknown): Seat | null => {
  if (typeof socketId !== "string" || !socketId) return null;
  if (game.sockets.host === socketId) return "host";
  if (game.sockets.guest === socketId) return "guest";
  return null;
};

// Fresh board, keeping players and score
export const resetBoard = (state: OnlineChessState, hostColor = state.hostColor): OnlineChessState => ({
  ...state,
  fen: START_FEN,
  moves: [],
  lastMove: null,
  hostColor,
  result: null,
  status: "playing",
});

// Ends the game and updates the running score
export const finishGame = (state: OnlineChessState, result: ChessResult): OnlineChessState => {
  const winnerSeat = (["host", "guest"] as Seat[]).find(
    (seat) => result.winner && colorOfSeat(seat, state.hostColor) === result.winner
  );
  return {
    ...state,
    status: "finished",
    result,
    score: winnerSeat
      ? { ...state.score, [winnerSeat]: state.score[winnerSeat] + 1 }
      : { ...state.score, draws: state.score.draws + 1 },
  };
};
