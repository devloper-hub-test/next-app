import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import {
  checkWinner,
  getGame,
  markForSocket,
  saveGame,
} from "shadcn-ui/lib/game-store";
import { broadcast } from "shadcn-ui/lib/pusher";
import { gameChannel } from "shadcn-ui/types/game";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  const index = body.index;
  if (typeof gameId !== "string" || typeof index !== "number" || !Number.isInteger(index) || index < 0 || index > 8) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = await getGame(gameId);
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

  const nextPlayer = mark === "X" ? "O" : "X";
  const scoreKey = winner === "Draw" ? "draws" : winner;
  game.state = {
    ...state,
    board,
    winner,
    winningLine,
    currentPlayer: winner ? null : nextPlayer,
    status: winner ? "finished" : "playing",
    scores: scoreKey ? { ...state.scores, [scoreKey]: state.scores[scoreKey] + 1 } : state.scores,
  };
  await saveGame(gameId, game);

  await broadcast(gameChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ game: game.state });
}
