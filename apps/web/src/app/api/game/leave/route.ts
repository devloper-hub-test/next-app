import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import {
  deleteGame,
  emptyBoard,
  getGame,
  markForSocket,
  saveGame,
} from "shadcn-ui/lib/game-store";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { gameChannel } from "shadcn-ui/types/game";

// Called when a player clicks "Leave" or closes the tab (via navigator.sendBeacon)
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  if (typeof gameId !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = getGame(gameId);
  const mark = game && markForSocket(game, body.socketId);
  if (!game || !mark) {
    return NextResponse.json({ success: true });
  }

  game.sockets[mark] = null;
  if (!game.sockets.X && !game.sockets.O) {
    deleteGame(gameId);
    return NextResponse.json({ success: true });
  }

  // Free the seat and restart the round so a new opponent can join with the same code
  game.state = {
    ...game.state,
    board: emptyBoard(),
    players: { ...game.state.players, [mark]: false },
    currentPlayer: game.state.startingPlayer,
    winner: null,
    winningLine: null,
    status: "waiting",
  };
  saveGame(gameId, game);

  await pusherServer.trigger(gameChannel(gameId), "opponent-left", {});
  await pusherServer.trigger(gameChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ success: true });
}
