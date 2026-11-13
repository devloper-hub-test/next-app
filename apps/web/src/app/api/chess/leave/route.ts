import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import {
  deleteChessGame,
  finishGame,
  getChessGame,
  saveChessGame,
  seatForSocket,
} from "shadcn-ui/lib/chess-store";
import { broadcast } from "shadcn-ui/lib/pusher";
import { chessChannel, colorOfSeat, otherColor } from "shadcn-ui/types/chess";

// Called when a player clicks "Leave" or closes the tab (via navigator.sendBeacon)
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  if (typeof gameId !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = getChessGame(gameId);
  const seat = game && seatForSocket(game, body.socketId);
  if (!game || !seat) {
    return NextResponse.json({ success: true });
  }

  game.sockets[seat] = null;
  if (!game.sockets.host && !game.sockets.guest) {
    deleteChessGame(gameId);
    return NextResponse.json({ success: true });
  }

  // Leaving mid-game forfeits it; the seat opens up for someone new
  if (game.state.status === "playing") {
    const winner = otherColor(colorOfSeat(seat, game.state.hostColor));
    game.state = finishGame(game.state, { winner, reason: "abandoned" });
  }
  game.state = { ...game.state, players: { ...game.state.players, [seat]: false } };
  saveChessGame(gameId, game);

  await broadcast(chessChannel(gameId), "opponent-left", {});
  await broadcast(chessChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ success: true });
}
