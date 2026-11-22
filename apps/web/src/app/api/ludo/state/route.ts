import { NextResponse } from "next/server";
import { getLudoGame } from "shadcn-ui/lib/ludo-store";

export const dynamic = "force-dynamic";

// Current state of a room, used to resync after (re)subscribing to its channel
export async function GET(request: Request): Promise<NextResponse> {
  const gameId = new URL(request.url).searchParams.get("gameId");
  const game = gameId ? await getLudoGame(gameId) : undefined;
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  return NextResponse.json({ game: game.state });
}
