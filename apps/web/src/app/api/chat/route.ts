// app/api/chat/route.ts
import { NextResponse } from "next/server";

const POLLINATIONS_API_URL = "https://text.pollinations.ai";

// Proxy to Pollinations: browser requests (with an Origin header) are
// rejected with "Missing Turnstile token", server requests are not.
export async function POST(request: Request): Promise<NextResponse> {
  const { prompt } = await request.json();

  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const res = await fetch(
    `${POLLINATIONS_API_URL}/${encodeURIComponent(prompt)}`,
    { cache: "no-store" }
  );
  const text = await res.text();

  if (!res.ok) {
    console.error("Pollinations error:", res.status, text);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }

  return NextResponse.json({ text });
}
