"use client";
import Link from "next/link";
import { Header, SnakeGame } from "shadcn-ui";

export default function SnakePage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="mt-20">
        <div className="mx-auto max-w-5xl px-4">
          <Link className="text-sm text-muted-foreground hover:underline" href="/games">
            ← All games
          </Link>
        </div>
        <SnakeGame />
      </main>
    </>
  );
}
