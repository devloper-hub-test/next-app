import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { finishGame, getChessGame, saveChessGame, seatForSocket } from "shadcn-ui/lib/chess-store";
import { gameResult, replay } from "shadcn-ui/lib/chess-rules";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { chessChannel, colorOfSeat } from "shadcn-ui/types/chess";

const SQUARE = /^[a-h][1-8]$/;

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const { gameId, from, to, promotion } = body;
  const validSquare = (square: unknown): square is string =>
    typeof square === "string" && SQUARE.test(square);
  const validPromotion = (piece: unknown): piece is string | undefined =>
    piece === undefined || (typeof piece === "string" && /^[qrbn]$/.test(piece));
  if (typeof gameId !== "string" || !validSquare(from) || !validSquare(to) || !validPromotion(promotion)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = getChessGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  // Players are identified by their socket id, never by a colour the client claims
  const seat = seatForSocket(game, body.socketId);
  if (!seat) {
    return NextResponse.json({ error: "You're not in this game" }, { status: 403 });
  }
  if (game.state.status !== "playing") {
    return NextResponse.json({ error: "Game is not active" }, { status: 400 });
  }

  const chess = replay(game.state.moves);
  if (chess.turn() !== colorOfSeat(seat, game.state.hostColor)) {
    return NextResponse.json({ error: "Not your turn" }, { status: 400 });
  }

  let san: string;
  try {
    san = chess.move({ from, to, promotion }).san;
  } catch {
    return NextResponse.json({ error: "Illegal move" }, { status: 400 });
  }

  game.state = {
    ...game.state,
    fen: chess.fen(),
    moves: [...game.state.moves, san],
    lastMove: { from, to },
  };
  const result = gameResult(chess);
  if (result) game.state = finishGame(game.state, result);
  saveChessGame(gameId, game);

  await pusherServer.trigger(chessChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
