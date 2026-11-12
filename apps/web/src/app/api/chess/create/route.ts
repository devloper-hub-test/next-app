import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { customAlphabet } from "nanoid";
import { createChessGame, getChessGame } from "shadcn-ui/lib/chess-store";
import type { Color } from "shadcn-ui/types/chess";

// Short, easy-to-share codes without look-alike characters (0/O, 1/I)
const newGameId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const socketId = body.socketId;
  const choice = body.color;
  if (typeof socketId !== "string" || !socketId || (choice !== "w" && choice !== "b" && choice !== "random")) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let gameId = newGameId();
  while (getChessGame(gameId)) {
    gameId = newGameId();
  }
  const randomColor: Color = Math.random() < 0.5 ? "w" : "b";
  const hostColor: Color = choice === "random" ? randomColor : choice;
  const game = createChessGame(gameId, socketId, hostColor);

  return NextResponse.json({ gameId, seat: "host", game: game.state });
}
