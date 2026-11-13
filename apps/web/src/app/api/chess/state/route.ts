import { NextResponse } from "next/server";
import { getChessGame } from "shadcn-ui/lib/chess-store";

export const dynamic = "force-dynamic";

// Current state of a game, used to resync after (re)subscribing to its channel
export async function GET(request: Request): Promise<NextResponse> {
  const gameId = new URL(request.url).searchParams.get("gameId");
  const game = gameId ? await getChessGame(gameId) : undefined;
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  return NextResponse.json({ game: game.state });
}
