// app/api/pusher/auth/route.ts
import { NextResponse } from "next/server";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { getGame, markForSocket } from "shadcn-ui/lib/game-store";
import { getChessGame, seatForSocket } from "shadcn-ui/lib/chess-store";
import { gameChannel } from "shadcn-ui/types/game";
import { chessChannel } from "shadcn-ui/types/chess";

// Only the players of a game may subscribe to its private channel
const isPlayer = (channelName: string, socketId: string): boolean => {
  const ticTacToePrefix = gameChannel("");
  const chessPrefix = chessChannel("");
  if (channelName.startsWith(ticTacToePrefix)) {
    const game = getGame(channelName.slice(ticTacToePrefix.length));
    return Boolean(game && markForSocket(game, socketId));
  }
  if (channelName.startsWith(chessPrefix)) {
    const game = getChessGame(channelName.slice(chessPrefix.length));
    return Boolean(game && seatForSocket(game, socketId));
  }
  return false;
};

export async function POST(request: Request): Promise<NextResponse> {
  const params = new URLSearchParams(await request.text());
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName || !isPlayer(channelName, socketId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(pusherServer.authorizeChannel(socketId, channelName));
}
