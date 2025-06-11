// lib/pusher.ts
import PusherClient from "pusher-js";
import PusherServer from "pusher";

// Client-side Pusher instance
export const pusherClient = new PusherClient("25baf320fb69be6755ef", {
  cluster: "ap2",
  authEndpoint: "/api/pusher/auth",
  authTransport: "ajax",
  forceTLS: true,
});

// Server-side Pusher instance
export const pusherServer = new PusherServer({
  appId: "1912882",
  key: "25baf320fb69be6755ef",
  secret: "3c5b084cc45903bf609c",
  cluster: "ap2",
  useTLS: true,
});
