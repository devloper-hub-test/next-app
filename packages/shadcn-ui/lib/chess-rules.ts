// lib/chess-rules.ts — shared by the browser and the API routes
import { Chess } from "chess.js";
import type { ChessResult, Color } from "../types/chess";

export const replay = (moves: string[]): Chess => {
  const chess = new Chess();
  moves.forEach((move) => chess.move(move));
  return chess;
};

export function gameResult(chess: Chess): ChessResult | null {
  if (chess.isCheckmate()) return { winner: chess.turn() === "w" ? "b" : "w", reason: "checkmate" };
  if (chess.isStalemate()) return { winner: null, reason: "stalemate" };
  if (chess.isInsufficientMaterial()) return { winner: null, reason: "insufficient" };
  if (chess.isThreefoldRepetition()) return { winner: null, reason: "threefold" };
  if (chess.isDrawByFiftyMoves()) return { winner: null, reason: "fifty-move" };
  return null;
}

const REASON_TEXT: Record<ChessResult["reason"], string> = {
  checkmate: "by checkmate",
  stalemate: "stalemate",
  threefold: "threefold repetition",
  insufficient: "insufficient material",
  "fifty-move": "50-move rule",
  resignation: "by resignation",
  abandoned: "opponent left",
};

const COLOR_NAME: Record<Color, string> = { w: "White", b: "Black" };

// e.g. "You win by checkmate!" / "Black wins by resignation" / "Draw: stalemate"
export function describeResult(result: ChessResult, myColor?: Color): string {
  const reason = REASON_TEXT[result.reason];
  if (!result.winner) return `Draw: ${reason}`;
  if (!myColor) return `${COLOR_NAME[result.winner]} wins ${reason}`;
  return result.winner === myColor ? `You win ${reason}! 🎉` : `You lose ${reason}`;
}

export const colorName = (color: Color) => COLOR_NAME[color];
