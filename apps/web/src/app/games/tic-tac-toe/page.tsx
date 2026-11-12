"use client";
import Link from "next/link";
import { Header, TicTacToe } from "shadcn-ui";

export default function OnlineTicTacToePage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="mt-20">
        <div className="mx-auto max-w-md px-4">
          <Link className="text-sm text-muted-foreground hover:underline" href="/games">
            ← All games
          </Link>
        </div>
        <TicTacToe />
      </main>
    </>
  );
}
