import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { customAlphabet } from "nanoid";
import { createLudoGame, getLudoGame } from "shadcn-ui/lib/ludo-store";

// Short, easy-to-share codes without look-alike characters (0/O, 1/I)
const newGameId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const socketId = body.socketId;
  const arms = body.arms ?? 4;
  if (typeof socketId !== "string" || !socketId || (arms !== 4 && arms !== 6)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let gameId = newGameId();
  // eslint-disable-next-line no-await-in-loop -- retry until we find an unused code (collisions are rare)
  while (await getLudoGame(gameId)) {
    gameId = newGameId();
  }
  const game = await createLudoGame(gameId, socketId, arms);

  return NextResponse.json({ gameId, color: "red", game: game.state });
}
