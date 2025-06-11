import { NextResponse } from "next/server";
import { getGame, updateGame } from "shadcn-ui/lib/game-store";
import { pusherServer } from "shadcn-ui/lib/pusher";

interface JoinGameRequestBody {
  gameId: string;
  socketId: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("gameId" in body) ||
      !("socketId" in body) ||
      typeof (body as JoinGameRequestBody).gameId !== "string" ||
      typeof (body as JoinGameRequestBody).socketId !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { gameId, socketId } = body as JoinGameRequestBody;

    const game = getGame(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.players.X && game.players.O) {
      return NextResponse.json({ error: "Game is full" }, { status: 400 });
    }

    let playerSymbol: "X" | "O";
    if (!game.players.X) {
      playerSymbol = "X";
      updateGame(gameId, { players: { ...game.players, X: socketId } });
    } else {
      playerSymbol = "O";
      updateGame(gameId, { players: { ...game.players, O: socketId } });
    }

    const updatedGame = updateGame(gameId, { status: "playing" });

    // Notify joining player
    await pusherServer.trigger(socketId, "game-joined", {
      gameId,
      playerSymbol,
    });

    // Notify existing player
    const otherPlayerSocketId =
      playerSymbol === "X" ? game.players.O : game.players.X;
    if (otherPlayerSocketId) {
      await pusherServer.trigger(otherPlayerSocketId, "opponent-joined", {
        game: updatedGame,
      });
    }

    // Notify private channel with updated game state
    await pusherServer.trigger(
      `private-${gameId}`,
      "game-state-update",
      updatedGame
    );

    return NextResponse.json({ gameId, playerSymbol });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error during game join." },
      { status: 500 }
    );
  }
}
