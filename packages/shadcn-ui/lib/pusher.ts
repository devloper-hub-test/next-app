// lib/pusher.ts
// Server-side Pusher instance. Only import this from API routes; the browser
// client lives in lib/pusher-client.ts.
import PusherServer from "pusher";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  useTLS: true,
});

// The game state is already saved when we broadcast it, so a Pusher outage or
// bad credentials shouldn't turn a successful join/move into a 500 for the player.
export async function broadcast(channel: string, event: string, data: unknown): Promise<void> {
  try {
    await pusherServer.trigger(channel, event, data);
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed broadcasts
    console.error(`Pusher broadcast "${event}" on ${channel} failed:`, error);
  }
}
