import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { customAlphabet } from "nanoid";
import { createGame, getGame } from "shadcn-ui/lib/game-store";

// Short, easy-to-share codes without look-alike characters (0/O, 1/I)
const newGameId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const socketId = body.socketId;
  if (typeof socketId !== "string" || !socketId) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let gameId = newGameId();
  // eslint-disable-next-line no-await-in-loop -- retry until we find an unused code (collisions are rare)
  while (await getGame(gameId)) {
    gameId = newGameId();
  }
  const game = await createGame(gameId, socketId);

  return NextResponse.json({ gameId, playerSymbol: "X", game: game.state });
}
