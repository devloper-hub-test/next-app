import { NextResponse } from "next/server";
import { getGame } from "shadcn-ui/lib/game-store";

export const dynamic = "force-dynamic";

// Current state of a game, used to resync after (re)subscribing to its channel
export function GET(request: Request): NextResponse {
  const gameId = new URL(request.url).searchParams.get("gameId");
  const game = gameId ? getGame(gameId) : undefined;
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  return NextResponse.json({ game: game.state });
}
