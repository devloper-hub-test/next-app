import { NextResponse } from "next/server";
import { readBody } from "shadcn-ui/lib/request-body";
import { colorForSocket, deleteLudoGame, getLudoGame, leaveSeat, saveLudoGame } from "shadcn-ui/lib/ludo-store";
import { broadcast } from "shadcn-ui/lib/pusher";
import { ludoChannel } from "shadcn-ui/types/ludo";

// Called when a player clicks "Leave" or closes the tab (via navigator.sendBeacon)
export async function POST(request: Request): Promise<NextResponse> {
  const body = await readBody(request);
  const gameId = body.gameId;
  if (typeof gameId !== "string") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const game = await getLudoGame(gameId);
  const color = game && colorForSocket(game, body.socketId);
  if (!game || !color) {
    return NextResponse.json({ success: true });
  }

  game.sockets[color] = null;
  if (Object.values(game.sockets).every((socket) => !socket)) {
    await deleteLudoGame(gameId);
    return NextResponse.json({ success: true });
  }

  // A player leaving mid-game drops out; if only one is left, they win
  game.state = leaveSeat(game.state, color);
  await saveLudoGame(gameId, game);

  await broadcast(ludoChannel(gameId), "player-left", { color });
  await broadcast(ludoChannel(gameId), "game-state-update", game.state);

  return NextResponse.json({ success: true });
}
