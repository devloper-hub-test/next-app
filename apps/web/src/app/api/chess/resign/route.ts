import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { finishGame, getChessGame, saveChessGame, seatForSocket } from "shadcn-ui/lib/chess-store";
import { broadcast } from "shadcn-ui/lib/pusher";
import { chessChannel, colorOfSeat, otherColor } from "shadcn-ui/types/chess";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  if (typeof gameId !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = await getChessGame(gameId);
  const seat = game && seatForSocket(game, body.socketId);
  if (!game || !seat) {
    return NextResponse.json({ error: "You're not in this game" }, { status: 403 });
  }
  if (game.state.status !== "playing") {
    return NextResponse.json({ error: "Game is not active" }, { status: 400 });
  }

  const winner = otherColor(colorOfSeat(seat, game.state.hostColor));
  game.state = finishGame(game.state, { winner, reason: "resignation" });
  await saveChessGame(gameId, game);

  await broadcast(chessChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
