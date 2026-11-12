import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { createGame, getGame } from "shadcn-ui/lib/game-store";

// Short, easy-to-share codes without look-alike characters (0/O, 1/I)
const newGameId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const socketId = body?.socketId;
  if (typeof socketId !== "string" || !socketId) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let gameId = newGameId();
  while (getGame(gameId)) {
    gameId = newGameId();
  }
  const game = createGame(gameId, socketId);

  return NextResponse.json({ gameId, playerSymbol: "X", game: game.state });
}
