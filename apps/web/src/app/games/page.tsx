import Link from "next/link";
import { Header } from "shadcn-ui";
import { ChessArt, SnakeArt, TicTacToeArt } from "./_components/game-art";
import { GameProgress } from "./_components/game-progress";

interface Game {
  href: string;
  title: string;
  tagline: string;
  description: string;
  chips: string[];
  art: JSX.Element;
  artBackground: string;
  badge?: string;
  progress?: "chess" | "snake";
}

const FEATURED: Game = {
  href: "/games/chess",
  title: "Chess",
  tagline: "Outsmart the bots, or your best friend.",
  description:
    "Face four bot opponents, from the clumsy Pawn Pusher to The Grandmaster, or send a friend a code and battle it out live.",
  chips: ["🤖 4 bot levels", "👥 2 players online", "💡 Hints & undo"],
  art: <ChessArt />,
  artBackground: "bg-emerald-800",
  badge: "New",
  progress: "chess",
};

const GAMES: Game[] = [
  {
    href: "/games/snake",
    title: "Snake",
    tagline: "The Nokia classic, levelled up.",
    description: "20 levels of mazes, walls and speed. Eat, grow, and don't bite your own tail.",
    chips: ["👤 Solo", "🏁 20 levels", "📱 Swipe to play"],
    art: <SnakeArt />,
    artBackground: "bg-gradient-to-br from-lime-500 to-emerald-700",
    progress: "snake",
  },
  {
    href: "/games/tic-tac-toe",
    title: "Tic-Tac-Toe",
    tagline: "Three in a row, live with a friend.",
    description: "Share a code, take turns in real time, and keep score across rematches.",
    chips: ["👥 2 players online", "⚡ Quick rounds"],
    art: <TicTacToeArt />,
    artBackground: "bg-gradient-to-br from-indigo-500 to-sky-600",
  },
];

function Chips({ chips }: { chips: string[] }): JSX.Element {
  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li className="rounded-full border bg-background/60 px-2.5 py-1 text-xs font-medium" key={chip}>
          {chip}
        </li>
      ))}
    </ul>
  );
}

function PlayButton(): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition group-hover:gap-2">
      Play now <span aria-hidden>→</span>
    </span>
  );
}

const CARD =
  "group relative flex overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function GameCard({ game }: { game: Game }): JSX.Element {
  return (
    <Link className={`${CARD} flex-col`} href={game.href}>
      <div className={`h-44 overflow-hidden ${game.artBackground}`}>
        <div className="h-full transition duration-500 group-hover:scale-105">{game.art}</div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h2 className="text-2xl font-bold">{game.title}</h2>
          <p className="font-medium text-muted-foreground">{game.tagline}</p>
        </div>
        <p className="text-sm text-muted-foreground">{game.description}</p>
        <Chips chips={game.chips} />
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          {game.progress ? <GameProgress source={game.progress} /> : <span />}
          <PlayButton />
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ game }: { game: Game }): JSX.Element {
  return (
    <Link className={`${CARD} flex-col md:flex-row`} href={game.href}>
      <div className={`relative h-52 overflow-hidden md:h-auto md:w-1/2 ${game.artBackground}`}>
        <div className="h-full transition duration-500 group-hover:scale-105">{game.art}</div>
        {game.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-950 shadow">
            {game.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Featured game
        </p>
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">{game.title}</h2>
          <p className="mt-1 text-lg font-medium text-muted-foreground">{game.tagline}</p>
        </div>
        <p className="text-muted-foreground">{game.description}</p>
        <Chips chips={game.chips} />
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          {game.progress ? <GameProgress source={game.progress} /> : <span />}
          <PlayButton />
        </div>
      </div>
    </Link>
  );
}

export default function GamesPage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="mx-auto mt-28 max-w-5xl px-4 pb-20">
        <section className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            🎮 Free to play · no sign-up
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Take a break.{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
              Play something.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Classic games, rebuilt for the browser. Beat the bots, chase a high score, or send a friend a code and play
            live.
          </p>
        </section>

        <div className="mt-12 grid gap-6">
          <FeaturedCard game={FEATURED} />
          <div className="grid gap-6 sm:grid-cols-2">
            {GAMES.map((game) => (
              <GameCard game={game} key={game.href} />
            ))}
          </div>
        </div>

        <Link
          className="group mt-10 flex flex-col items-center justify-between gap-3 rounded-3xl border border-dashed p-6 text-center transition hover:border-solid hover:bg-card sm:flex-row sm:text-left"
          href="/learn/typing"
        >
          <div>
            <p className="font-semibold">⌨️ Fingers warmed up?</p>
            <p className="text-sm text-muted-foreground">
              Turn them into speed demons with KeyQuest, a typing game where every key scores.
            </p>
          </div>
          <span className="font-semibold text-primary group-hover:underline">Try KeyQuest →</span>
        </Link>
      </main>
    </>
  );
}
