import { NextResponse } from "next/server";
import { getGame, updateGame } from "shadcn-ui/lib/game-store";
import { pusherServer } from "shadcn-ui/lib/pusher";
import type { Board, GameState } from "shadcn-ui/types/game";

// Safely typed initial board
const initialBoard: Board = Array(9).fill(null) as Board;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as { gameId: string };

  const game: GameState | undefined = getGame(body.gameId);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const updatedGame = updateGame(body.gameId, {
    board: initialBoard,
    currentPlayer: "X",
    winner: null,
    status: "playing",
  });

  if (updatedGame) {
    await pusherServer.trigger(
      `private-${body.gameId}`,
      "game-state-update",
      updatedGame
    );
    return NextResponse.json({ success: true, game: updatedGame });
  }

  return NextResponse.json({ error: "Failed to reset game" }, { status: 500 });
}
