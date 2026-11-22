import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { colorForSocket, freeSeat, getLudoGame, saveLudoGame } from "shadcn-ui/lib/ludo-store";
import { broadcast } from "shadcn-ui/lib/pusher";
import { ludoChannel } from "shadcn-ui/types/ludo";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  const socketId = body.socketId;
  if (typeof gameId !== "string" || typeof socketId !== "string" || !socketId) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = await getLudoGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  if (colorForSocket(game, socketId)) {
    return NextResponse.json({ error: "You're already in this game" }, { status: 400 });
  }
  if (game.state.status === "playing") {
    return NextResponse.json({ error: "This game has already started" }, { status: 409 });
  }
  const color = freeSeat(game);
  if (!color) {
    return NextResponse.json({ error: "Game is full" }, { status: 409 });
  }

  game.sockets[color] = socketId;
  game.state = { ...game.state, seats: { ...game.state.seats, [color]: true } };
  await saveLudoGame(gameId, game);

  await broadcast(ludoChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ gameId, color, game: game.state });
}
