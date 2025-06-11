import { NextResponse } from "next/server";
import { getGame, updateGame, checkWinner } from "shadcn-ui/lib/game-store";
import { pusherServer } from "shadcn-ui/lib/pusher";
import type { Player, GameState } from "shadcn-ui/types/game";

interface MoveRequestBody {
  gameId: string;
  index: number;
  playerSymbol: Player;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("gameId" in body) ||
      !("index" in body) ||
      !("playerSymbol" in body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { gameId, index, playerSymbol } = body as MoveRequestBody;

    const game: GameState | undefined = getGame(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "playing" || game.winner) {
      return NextResponse.json(
        { error: "Game is not active or already finished" },
        { status: 400 }
      );
    }

    if (game.currentPlayer !== playerSymbol) {
      return NextResponse.json({ error: "Not your turn" }, { status: 400 });
    }

    if (game.board[index] !== null) {
      return NextResponse.json(
        { error: "Cell already taken" },
        { status: 400 }
      );
    }

    const newBoard = [...game.board];
    newBoard[index] = playerSymbol;

    const gameWinner: Player | "Draw" = checkWinner(newBoard);
    let nextPlayer: Player = null;
    if (!gameWinner) {
      nextPlayer = playerSymbol === "X" ? "O" : "X";
    }
    const newStatus: GameState["status"] = gameWinner ? "finished" : "playing";

    const updatedGame = updateGame(gameId, {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: gameWinner,
      status: newStatus,
    });

    if (updatedGame) {
      await pusherServer.trigger(
        `private-${gameId}`,
        "game-state-update",
        updatedGame
      );
      return NextResponse.json({ success: true, game: updatedGame });
    }

    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
