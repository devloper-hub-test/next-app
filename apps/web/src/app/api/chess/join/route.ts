import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { getChessGame, resetBoard, saveChessGame, seatForSocket } from "shadcn-ui/lib/chess-store";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { chessChannel, type Seat } from "shadcn-ui/types/chess";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  const socketId = body.socketId;
  if (typeof gameId !== "string" || typeof socketId !== "string" || !socketId) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = getChessGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  if (seatForSocket(game, socketId)) {
    return NextResponse.json({ error: "You're already in this game" }, { status: 400 });
  }
  let seat: Seat | null = null;
  if (!game.sockets.host) seat = "host";
  else if (!game.sockets.guest) seat = "guest";
  if (!seat) {
    return NextResponse.json({ error: "Game is full" }, { status: 409 });
  }

  game.sockets[seat] = socketId;
  // A new opponent always starts from a fresh board
  game.state = resetBoard({ ...game.state, players: { ...game.state.players, [seat]: true } });
  saveChessGame(gameId, game);

  await pusherServer.trigger(chessChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ gameId, seat, game: game.state });
}
