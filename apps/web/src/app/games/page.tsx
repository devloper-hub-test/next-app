import Link from "next/link";
import { Header } from "shadcn-ui";

const GAMES = [
  {
    href: "/games/chess",
    emoji: "♞",
    title: "Chess",
    description: "Play the Stockfish engine on Easy, Medium, Hard or Very hard, or challenge a friend online.",
    tag: "1 player vs computer · 2 players online",
  },
  {
    href: "/games/snake",
    emoji: "🐍",
    title: "Snake",
    description: "20 levels from easy to brutal, with obstacles, mazes and a retro Nokia mode. Works with keyboard or swipe.",
    tag: "Single player",
  },
  {
    href: "/games/tic-tac-toe",
    emoji: "❌⭕",
    title: "Online Tic-Tac-Toe",
    description: "Create a game, share the code, and play a friend in real time from anywhere.",
    tag: "2 players · online",
  },
];

export default function GamesPage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="mx-auto mt-28 max-w-4xl px-4 pb-16">
        <h1 className="text-center text-4xl font-bold">Games</h1>
        <p className="mt-2 text-center text-muted-foreground">
          A couple of small games built with Next.js. Pick one and play.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {GAMES.map((game) => (
            <Link
              className="group rounded-2xl border bg-card p-6 text-card-foreground shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={game.href}
              key={game.href}
            >
              <div aria-hidden className="text-4xl">
                {game.emoji}
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{game.title}</h2>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {game.tag}
              </p>
              <p className="mt-3 text-muted-foreground">{game.description}</p>
              <span className="mt-4 inline-block font-medium text-primary group-hover:underline">
                Play →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
