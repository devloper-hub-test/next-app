// lib/ludo-store.ts
import { newLudoGame, removePlayer } from "./ludo-rules";
import {
  BOARD_COLORS,
  LUDO_COLORS,
  type BoardSize,
  type LudoColor,
  type LudoGame,
  type OnlineLudoState,
} from "../types/ludo";
import { createKvStore } from "./kv-store";

interface StoredLudoGame {
  state: OnlineLudoState;
  sockets: Record<LudoColor, string | null>; // Pusher socket id of each player
}

// Shared Redis store in production, in-memory locally (see lib/kv-store.ts)
const games = createKvStore<StoredLudoGame>("ludo", 6 * 60 * 60);

// Seats fill opposite each other first, so a two-player game uses facing corners, then spread evenly
const SEAT_ORDER: Record<BoardSize, LudoColor[]> = {
  4: ["red", "yellow", "green", "blue"],
  6: ["red", "yellow", "green", "blue", "orange", "purple"],
};

const allColors = <T>(value: T): Record<LudoColor, T> =>
  Object.fromEntries(LUDO_COLORS.map((color) => [color, value])) as Record<LudoColor, T>;

export const getLudoGame = (gameId: string): Promise<StoredLudoGame | undefined> => games.get(gameId);

export const createLudoGame = async (gameId: string, socketId: string, arms: BoardSize) => {
  const game: StoredLudoGame = {
    state: {
      arms,
      seats: { ...allColors(false), red: true },
      status: "waiting",
      game: null,
      score: allColors(0),
      version: 0,
    },
    sockets: { ...allColors<string | null>(null), red: socketId },
  };
  await games.set(gameId, game);
  return game;
};

export const saveLudoGame = async (gameId: string, game: StoredLudoGame) => {
  game.state = { ...game.state, version: game.state.version + 1 };
  await games.set(gameId, game);
  return game;
};

export const deleteLudoGame = (gameId: string): Promise<void> => games.delete(gameId);

export const colorForSocket = (game: StoredLudoGame, socketId: unknown): LudoColor | null => {
  if (typeof socketId !== "string" || !socketId) return null;
  return LUDO_COLORS.find((color) => game.sockets[color] === socketId) ?? null;
};

export const freeSeat = (game: StoredLudoGame): LudoColor | null =>
  SEAT_ORDER[game.state.arms].find((color) => !game.sockets[color]) ?? null;

export const seatedColors = (game: StoredLudoGame): LudoColor[] =>
  BOARD_COLORS[game.state.arms].filter((color) => game.sockets[color]);

// New game with everyone currently seated; whoever won last time goes first
export const startRound = (state: OnlineLudoState, players: LudoColor[]): OnlineLudoState => ({
  ...state,
  status: "playing",
  game: newLudoGame(players, state.game?.winner ?? undefined, state.arms),
});

// Keeps the room status and score in step with the game after a move or a player leaving
export const withGame = (state: OnlineLudoState, game: LudoGame): OnlineLudoState => {
  if (game.status !== "finished" || state.status === "finished") return { ...state, game };
  const winner = game.winner as LudoColor;
  return { ...state, game, status: "finished", score: { ...state.score, [winner]: state.score[winner] + 1 } };
};

export const leaveSeat = (state: OnlineLudoState, color: LudoColor): OnlineLudoState => {
  const seats = { ...state.seats, [color]: false };
  if (state.status !== "playing" || !state.game) return { ...state, seats };
  return withGame({ ...state, seats }, removePlayer(state.game, color));
};
