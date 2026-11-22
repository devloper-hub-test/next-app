import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { colorForSocket, getLudoGame, saveLudoGame, withGame } from "shadcn-ui/lib/ludo-store";
import { applyRoll } from "shadcn-ui/lib/ludo-rules";
import { broadcast } from "shadcn-ui/lib/pusher";
import { ludoChannel } from "shadcn-ui/types/ludo";

// The server rolls the die, so nobody can pick their own number
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  if (typeof gameId !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = await getLudoGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  // Players are identified by their socket id, never by a colour the client claims
  const color = colorForSocket(game, body.socketId);
  if (!color) {
    return NextResponse.json({ error: "You're not in this game" }, { status: 403 });
  }
  const current = game.state.game;
  if (game.state.status !== "playing" || !current) {
    return NextResponse.json({ error: "Game is not active" }, { status: 400 });
  }
  if (current.turn !== color || current.phase !== "roll") {
    return NextResponse.json({ error: "It's not your roll" }, { status: 400 });
  }

  game.state = withGame(game.state, applyRoll(current, randomInt(1, 7)));
  await saveLudoGame(gameId, game);

  await broadcast(ludoChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
