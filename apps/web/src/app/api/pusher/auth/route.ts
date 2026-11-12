// app/api/pusher/auth/route.ts
import { NextResponse } from "next/server";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { getGame, markForSocket } from "shadcn-ui/lib/game-store";
import { gameChannel } from "shadcn-ui/types/game";

// Only the two players of a game may subscribe to its private channel
export async function POST(request: Request): Promise<NextResponse> {
  const params = new URLSearchParams(await request.text());
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");
  const gameId = channelName?.slice(gameChannel("").length);

  const game = gameId ? getGame(gameId) : undefined;
  if (
    !socketId ||
    !gameId ||
    channelName !== gameChannel(gameId) ||
    !game ||
    !markForSocket(game, socketId)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(pusherServer.authorizeChannel(socketId, channelName));
}
