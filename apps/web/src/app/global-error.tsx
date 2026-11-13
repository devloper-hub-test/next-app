"use client";

import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Last resort: replaces the whole site (including the root layout) if the layout itself crashes,
// so it renders its own <html> and avoids anything that might be broken
export default function GlobalError({ error, reset }: GlobalErrorProps): JSX.Element {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center text-gray-900 antialiased dark:bg-neutral-950 dark:text-gray-100">
        <p className="select-none text-8xl font-black leading-none tracking-tighter text-rose-500">500</p>
        <h1 className="mt-4 text-2xl font-bold">The site hit an unexpected error</h1>
        <p className="mt-3 max-w-md text-gray-600 dark:text-gray-400">Please try again. If it keeps happening, check back a little later.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          {/* A plain link (full reload) is the safest way out when the app shell is broken */}
          <a className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold dark:border-gray-700" href="/">
            Back to home
          </a>
        </div>
        {error.digest ? <p className="mt-10 text-xs text-gray-500">Error reference: {error.digest}</p> : null}
      </body>
    </html>
  );
}
