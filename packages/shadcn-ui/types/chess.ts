// types/chess.ts
export type Color = "w" | "b";
export type Seat = "host" | "guest"; // host created the room; colours swap each rematch

export type EndReason =
  | "checkmate"
  | "stalemate"
  | "threefold"
  | "insufficient"
  | "fifty-move"
  | "resignation"
  | "abandoned";

export interface ChessResult {
  winner: Color | null; // null = draw
  reason: EndReason;
}

// Public state of an online game, broadcast to both players (no socket ids)
export interface OnlineChessState {
  fen: string;
  moves: string[]; // SAN, e.g. ["e4", "e5", "Nf3"]
  lastMove: { from: string; to: string } | null;
  hostColor: Color;
  players: Record<Seat, boolean>; // whether each seat is taken
  status: "waiting" | "playing" | "finished";
  result: ChessResult | null;
  score: Record<Seat | "draws", number>;
}

export const chessChannel = (gameId: string): string => `private-chess-${gameId}`;

export const otherColor = (color: Color): Color => (color === "w" ? "b" : "w");

export const colorOfSeat = (seat: Seat, hostColor: Color): Color =>
  seat === "host" ? hostColor : otherColor(hostColor);
