"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "shadcn-ui";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Shown when a page crashes while loading or rendering (the site's "500" page)
export default function ErrorPage({ error, reset }: ErrorPageProps): JSX.Element {
  useEffect(() => {
    // Keep the details in the browser console for debugging
    // eslint-disable-next-line no-console -- intentional error reporting
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center">
        <p className="select-none text-[7rem] font-black leading-none tracking-tighter sm:text-[10rem]">
          <span className="bg-gradient-to-br from-orange-400 to-rose-500 bg-clip-text text-transparent">500</span>
        </p>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Something went wrong on our side</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          It&apos;s not you, it&apos;s the server. Try again in a moment. If it keeps happening, the page might be
          having a bad day.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={reset}
            type="button"
          >
            ↻ Try again
          </button>
          <Link
            className="rounded-full border px-6 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted"
            href="/"
          >
            Back to home
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-10 text-xs text-muted-foreground">
            Error reference: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{error.digest}</code>
          </p>
        ) : null}
      </main>
    </>
  );
}
