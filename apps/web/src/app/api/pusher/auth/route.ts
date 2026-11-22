// app/api/pusher/auth/route.ts
import { NextResponse } from "next/server";
import { pusherServer } from "shadcn-ui/lib/pusher";
import { getGame, markForSocket } from "shadcn-ui/lib/game-store";
import { getChessGame, seatForSocket } from "shadcn-ui/lib/chess-store";
import { colorForSocket, getLudoGame } from "shadcn-ui/lib/ludo-store";
import { gameChannel } from "shadcn-ui/types/game";
import { chessChannel } from "shadcn-ui/types/chess";
import { ludoChannel } from "shadcn-ui/types/ludo";

// Only the players of a game may subscribe to its private channel
const isPlayer = async (channelName: string, socketId: string): Promise<boolean> => {
  const ticTacToePrefix = gameChannel("");
  const chessPrefix = chessChannel("");
  const ludoPrefix = ludoChannel("");
  if (channelName.startsWith(ticTacToePrefix)) {
    const game = await getGame(channelName.slice(ticTacToePrefix.length));
    return Boolean(game && markForSocket(game, socketId));
  }
  if (channelName.startsWith(chessPrefix)) {
    const game = await getChessGame(channelName.slice(chessPrefix.length));
    return Boolean(game && seatForSocket(game, socketId));
  }
  if (channelName.startsWith(ludoPrefix)) {
    const game = await getLudoGame(channelName.slice(ludoPrefix.length));
    return Boolean(game && colorForSocket(game, socketId));
  }
  return false;
};

export async function POST(request: Request): Promise<NextResponse> {
  const params = new URLSearchParams(await request.text());
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName || !(await isPlayer(channelName, socketId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(pusherServer.authorizeChannel(socketId, channelName));
}
