import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "shadcn-ui";

export const metadata: Metadata = {
  title: "Page not found · Rahul Verma",
};

const SUGGESTIONS = [
  { href: "/#projects", label: "Projects", emoji: "🚀" },
  { href: "/blog", label: "Blog", emoji: "📝" },
  { href: "/games", label: "Games", emoji: "🎮" },
  { href: "/learn", label: "Learn", emoji: "⌨️" },
];

// Shown for any unknown URL, and wherever a page calls notFound()
export default function NotFound(): JSX.Element {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center">
        <p className="select-none text-[7rem] font-black leading-none tracking-tighter sm:text-[10rem]">
          <span className="bg-gradient-to-br from-brand to-sky-500 bg-clip-text text-transparent">404</span>
        </p>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">This page took a wrong turn</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          The link might be broken, or the page may have moved. Let&apos;s get you somewhere useful.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-md"
            href="/"
          >
            ← Back to home
          </Link>
          <Link
            className="rounded-full border px-6 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted"
            href="/games"
          >
            Play a game instead
          </Link>
        </div>

        <div className="mt-12 w-full">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Or try one of these</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SUGGESTIONS.map((item) => (
              <li key={item.href}>
                <Link
                  className="flex flex-col items-center gap-1 rounded-2xl border bg-card p-4 text-sm font-medium text-card-foreground transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
                  href={item.href}
                >
                  <span aria-hidden className="text-2xl">
                    {item.emoji}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
