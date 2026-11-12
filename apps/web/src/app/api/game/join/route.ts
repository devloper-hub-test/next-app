import { NextResponse } from "next/server";
import { getGame, markForSocket, saveGame } from "shadcn-ui/lib/game-store";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { gameChannel, type Mark } from "shadcn-ui/types/game";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const gameId = body?.gameId;
  const socketId = body?.socketId;
  if (typeof gameId !== "string" || typeof socketId !== "string" || !socketId) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = getGame(gameId);
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
  const playerSymbol: Mark | null = !game.sockets.X
    ? "X"
    : !game.sockets.O
      ? "O"
      : null;
  if (!playerSymbol) {
    return NextResponse.json({ error: "Game is full" }, { status: 409 });
  }

  game.sockets[playerSymbol] = socketId;
  game.state.players[playerSymbol] = true;
  game.state.status = "playing";
  saveGame(gameId, game);

  await pusherServer.trigger(gameChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ gameId, playerSymbol, game: game.state });
}
