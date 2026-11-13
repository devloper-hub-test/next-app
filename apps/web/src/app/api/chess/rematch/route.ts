import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { getChessGame, resetBoard, saveChessGame, seatForSocket } from "shadcn-ui/lib/chess-store";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { chessChannel, otherColor } from "shadcn-ui/types/chess";

// Starts a new game once the current one is over; players swap colours
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  if (typeof gameId !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = getChessGame(gameId);
  if (!game || !seatForSocket(game, body.socketId)) {
    return NextResponse.json({ error: "You're not in this game" }, { status: 403 });
  }
  if (game.state.status !== "finished" || !game.sockets.host || !game.sockets.guest) {
    return NextResponse.json(
      { error: "A rematch needs a finished game and both players" },
      { status: 400 }
    );
  }

  game.state = resetBoard(game.state, otherColor(game.state.hostColor));
  saveChessGame(gameId, game);

  await pusherServer.trigger(chessChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
