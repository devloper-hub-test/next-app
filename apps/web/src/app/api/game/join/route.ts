import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { getGame, markForSocket, saveGame } from "shadcn-ui/lib/game-store";
import { broadcast } from "shadcn-ui/lib/pusher";
import { gameChannel, type Mark } from "shadcn-ui/types/game";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  const socketId = body.socketId;
  if (typeof gameId !== "string" || typeof socketId !== "string" || !socketId) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = await getGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  if (markForSocket(game, socketId)) {
    return NextResponse.json(
      { error: "You're already in this game" },
      { status: 400 }
    );
  }

  // Take whichever seat is free (X can be free if the creator left)
  let playerSymbol: Mark | null = null;
  if (!game.sockets.X) playerSymbol = "X";
  else if (!game.sockets.O) playerSymbol = "O";
  if (!playerSymbol) {
    return NextResponse.json({ error: "Game is full" }, { status: 409 });
  }

  game.sockets[playerSymbol] = socketId;
  game.state.players[playerSymbol] = true;
  game.state.status = "playing";
  await saveGame(gameId, game);

  await broadcast(gameChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ gameId, playerSymbol, game: game.state });
}
