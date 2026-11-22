import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { colorForSocket, getLudoGame, saveLudoGame, seatedColors, startRound } from "shadcn-ui/lib/ludo-store";
import { broadcast } from "shadcn-ui/lib/pusher";
import { ludoChannel } from "shadcn-ui/types/ludo";

// Starts the first game once at least two players are in, and every rematch after that
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  if (typeof gameId !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = await getLudoGame(gameId);
  if (!game || !colorForSocket(game, body.socketId)) {
    return NextResponse.json({ error: "You're not in this game" }, { status: 403 });
  }
  if (game.state.status === "playing") {
    return NextResponse.json({ error: "The game is already under way" }, { status: 400 });
  }
  const players = seatedColors(game);
  if (players.length < 2) {
    return NextResponse.json({ error: "Wait for at least one more player" }, { status: 400 });
  }

  game.state = startRound(game.state, players);
  await saveLudoGame(gameId, game);

  await broadcast(ludoChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
