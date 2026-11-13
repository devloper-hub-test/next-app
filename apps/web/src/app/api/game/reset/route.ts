import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import {
  emptyBoard,
  getGame,
  markForSocket,
  saveGame,
} from "shadcn-ui/lib/game-store";
import { broadcast } from "shadcn-ui/lib/pusher";
import { gameChannel } from "shadcn-ui/types/game";

// Starts the next round once the current one is finished
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  if (typeof gameId !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = getGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  if (!markForSocket(game, body.socketId)) {
    return NextResponse.json({ error: "You're not in this game" }, { status: 403 });
  }
  if (game.state.status !== "finished") {
    return NextResponse.json(
      { error: "The current round isn't finished yet" },
      { status: 400 }
    );
  }

  // Alternate who goes first each round
  const startingPlayer = game.state.startingPlayer === "X" ? "O" : "X";
  game.state = {
    ...game.state,
    board: emptyBoard(),
    startingPlayer,
    currentPlayer: startingPlayer,
    winner: null,
    winningLine: null,
    status: "playing",
  };
  saveGame(gameId, game);

  await broadcast(gameChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
