import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { colorForSocket, getLudoGame, saveLudoGame, withGame } from "shadcn-ui/lib/ludo-store";
import { applyMove, legalTokens } from "shadcn-ui/lib/ludo-rules";
import { broadcast } from "shadcn-ui/lib/pusher";
import { ludoChannel } from "shadcn-ui/types/ludo";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const { gameId, token } = body;
  if (typeof gameId !== "string" || typeof token !== "number" || !Number.isInteger(token)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = await getLudoGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  const color = colorForSocket(game, body.socketId);
  if (!color) {
    return NextResponse.json({ error: "You're not in this game" }, { status: 403 });
  }
  const current = game.state.game;
  if (game.state.status !== "playing" || !current) {
    return NextResponse.json({ error: "Game is not active" }, { status: 400 });
  }
  if (current.turn !== color) {
    return NextResponse.json({ error: "Not your turn" }, { status: 400 });
  }
  if (!legalTokens(current).includes(token)) {
    return NextResponse.json({ error: "That token can't move" }, { status: 400 });
  }

  game.state = withGame(game.state, applyMove(current, token));
  await saveLudoGame(gameId, game);

  await broadcast(ludoChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
