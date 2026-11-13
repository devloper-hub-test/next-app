"use client";
import Link from "next/link";
import { Header, KeyQuest } from "shadcn-ui";

export default function TypingPage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="mt-20">
        <div className="mx-auto max-w-4xl px-4">
          <Link className="text-sm text-muted-foreground hover:underline" href="/learn">
            ← Learn skills
          </Link>
        </div>
        <KeyQuest />
      </main>
    </>
  );
}
