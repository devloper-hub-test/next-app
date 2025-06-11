import { NextResponse } from "next/server";
import { createNewGame, getGame, updateGame } from "shadcn-ui/lib/game-store";
import { nanoid } from "nanoid";
import { pusherServer } from "shadcn-ui/lib/pusher";

interface CreateGameRequestBody {
  socketId: string;
}
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    // Validate request body structure
    if (
      typeof body !== "object" ||
      body === null ||
      !("socketId" in body) ||
      typeof (body as CreateGameRequestBody).socketId !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { socketId } = body as CreateGameRequestBody;
    let gameId = nanoid(6);
    while (getGame(gameId)) {
      gameId = nanoid(6);
    }
    createNewGame(gameId);
    updateGame(gameId, {
      players: { X: socketId, O: null },
      status: "waiting",
    });
    await pusherServer.trigger(socketId, "game-created", {
      gameId,
      playerSymbol: "X",
    });
    return NextResponse.json({ gameId, playerSymbol: "X" });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error during game creation." },
      { status: 500 }
    );
  }
}
