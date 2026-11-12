import { NextResponse } from "next/server";
import {
  checkWinner,
  getGame,
  markForSocket,
  saveGame,
} from "shadcn-ui/lib/game-store";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { gameChannel } from "shadcn-ui/types/game";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const gameId = body?.gameId;
  const index = body?.index;
  if (
    typeof gameId !== "string" ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > 8
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = getGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // The player is identified by their socket id, not by a symbol the client claims
  const mark = markForSocket(game, body.socketId);
  if (!mark) {
    return NextResponse.json({ error: "You're not in this game" }, { status: 403 });
  }

  const { state } = game;
  if (state.status !== "playing") {
    return NextResponse.json({ error: "Game is not active" }, { status: 400 });
  }
  if (state.currentPlayer !== mark) {
    return NextResponse.json({ error: "Not your turn" }, { status: 400 });
  }
  if (state.board[index] !== null) {
    return NextResponse.json({ error: "Cell already taken" }, { status: 400 });
  }

  const board = [...state.board];
  board[index] = mark;
  const { winner, winningLine } = checkWinner(board);

  game.state = {
    ...state,
    board,
    winner,
    winningLine,
    currentPlayer: winner ? null : mark === "X" ? "O" : "X",
    status: winner ? "finished" : "playing",
    scores: winner
      ? {
          ...state.scores,
          [winner === "Draw" ? "draws" : winner]:
            state.scores[winner === "Draw" ? "draws" : winner] + 1,
        }
      : state.scores,
  };
  saveGame(gameId, game);

  await pusherServer.trigger(gameChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
