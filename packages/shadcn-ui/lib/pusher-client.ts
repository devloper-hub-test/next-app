// lib/pusher-client.ts
import PusherClient from "pusher-js";

let client: PusherClient | null = null;

// Created lazily so the websocket only opens in the browser, not during server rendering
export const getPusherClient = (): PusherClient => {
  client ??= new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    authEndpoint: "/api/pusher/auth",
    forceTLS: true,
  });
  return client;
};
