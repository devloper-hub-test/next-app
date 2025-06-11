// app/api/pusher/auth/route.ts
import { pusherServer } from "shadcn-ui/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.text();
  const [socketId, channelName] = data
    .split("&")
    .map((str) => str.split("=")[1]);

  // In a real application, you would verify the user's identity here
  // For this example, we'll allow all authenticated requests to private channels
  const auth = pusherServer.authorizeChannel(socketId, channelName);

  return NextResponse.json(auth);
}
