"use client";

import { useCallback, useState } from "react";
import { Bot, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { usePersistentState } from "../../hooks/use-persistent-state";
import { BOARD_COLORS, LUDO_COLOR_NAMES, type BoardSize, type BotLevel, type LudoColor } from "../../types/ludo";
import SoloLudo, { type SoloRecord } from "./SoloLudo";
import OnlineLudo from "./OnlineLudo";
import { BOT_LEVELS } from "./bot-levels";
import { ColorDot } from "./components/ludo-board";

type Screen =
  | { kind: "menu" }
  | {
      kind: "solo";
      level: BotLevel;
      arms: BoardSize;
      you: LudoColor;
      opponents: LudoColor[];
      key: number;
    }
  | { kind: "online" };

const emptyRecord: SoloRecord = { wins: 0, games: 0 };

// Five or six players need the big hexagon board
const boardFor = (players: number): BoardSize => (players > 4 ? 6 : 4);

// Seats for the bots, counted clockwise from you, spread as evenly as the board allows
const BOT_SEATS: Record<number, number[]> = { 2: [2], 3: [1, 2], 4: [1, 2, 3], 5: [1, 2, 4, 5], 6: [1, 2, 3, 4, 5] };

const opponentsFor = (you: LudoColor, players: number): LudoColor[] => {
  const colors = BOARD_COLORS[boardFor(players)];
  const start = colors.indexOf(you);
  // On the hexagon a lone opponent still sits straight across
  const seats = players === 2 && colors.length === 6 ? [3] : BOT_SEATS[players];
  return seats.map((step) => colors[(start + step) % colors.length]);
};

export default function LudoGame() {
  const [screen, setScreen] = useState<Screen>({ kind: "menu" });
  const [level, setLevel] = useState<BotLevel>("medium");
  const [you, setYou] = useState<LudoColor>("red");
  const [playerCount, setPlayerCount] = useState(4);
  const [records, setRecords] = usePersistentState<Partial<Record<BotLevel, SoloRecord>>>("ludo-records", {});

  const onGameOver = useCallback(
    (played: BotLevel, won: boolean) =>
      setRecords((r) => {
        const record = r[played] ?? emptyRecord;
        return {
          ...r,
          [played]: {
            wins: record.wins + (won ? 1 : 0),
            games: record.games + 1,
          },
        };
      }),
    [setRecords]
  );

  if (screen.kind === "solo") {
    return (
      <SoloLudo
        key={screen.key}
        you={screen.you}
        opponents={screen.opponents}
        arms={screen.arms}
        level={screen.level}
        onExit={() => setScreen({ kind: "menu" })}
        onGameOver={onGameOver}
      />
    );
  }
  if (screen.kind === "online") {
    return <OnlineLudo onExit={() => setScreen({ kind: "menu" })} />;
  }

  const startSolo = () =>
    setScreen({
      kind: "solo",
      level,
      arms: boardFor(playerCount),
      you,
      opponents: opponentsFor(you, playerCount),
      key: Date.now(),
    });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">🎲 Ludo</h1>
        <p className="mt-2 text-muted-foreground">Roll, race and capture. First to get all four tokens home wins.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Bot className="h-5 w-5 text-emerald-500" /> Play against bots
          </h2>

          <div className="space-y-2" role="radiogroup" aria-label="Bot difficulty">
            {(Object.keys(BOT_LEVELS) as BotLevel[]).map((option) => {
              const record = records[option];
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={level === option}
                  onClick={() => setLevel(option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition",
                    level === option ? "border-emerald-500 bg-emerald-500/10" : "hover:bg-muted"
                  )}
                >
                  <span className="flex items-start gap-3">
                    <span className="text-2xl leading-none" aria-hidden>
                      {BOT_LEVELS[option].emoji}
                    </span>
                    <span>
                      <span className="font-medium">{BOT_LEVELS[option].name}</span>
                      <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">{option}</span>
                      <span className="block text-sm text-muted-foreground">{BOT_LEVELS[option].description}</span>
                    </span>
                  </span>
                  {record && (
                    <span className="shrink-0 pl-2 text-xs text-muted-foreground">
                      Won {record.wins} of {record.games}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Players</p>
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Number of players">
              {[2, 3, 4, 5, 6].map((count) => (
                <Button
                  key={count}
                  role="radio"
                  aria-checked={playerCount === count}
                  variant={playerCount === count ? "default" : "outline"}
                  onClick={() => {
                    setPlayerCount(count);
                    if (!BOARD_COLORS[boardFor(count)].includes(you)) setYou("red");
                  }}
                >
                  {count}
                </Button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              You and {playerCount - 1} bot{playerCount === 2 ? "" : "s"}
              {playerCount > 4 ? " on the big six-player board" : ""}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Your colour</p>
            <div
              className={cn("grid gap-2", playerCount > 4 ? "grid-cols-3" : "grid-cols-4")}
              role="radiogroup"
              aria-label="Your colour"
            >
              {BOARD_COLORS[boardFor(playerCount)].map((color) => (
                <Button
                  key={color}
                  role="radio"
                  aria-checked={you === color}
                  variant={you === color ? "default" : "outline"}
                  onClick={() => setYou(color)}
                  className="gap-1.5 px-2"
                >
                  <ColorDot color={color} />
                  <span className="text-xs sm:text-sm">{LUDO_COLOR_NAMES[color]}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={startSolo}>
            Let&apos;s roll!
          </Button>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5 text-sky-500" /> Play with friends
          </h2>
          <p className="flex-1 text-muted-foreground">
            Open a table, send your friends a 5-letter code, and play live with up to six players. The server rolls
            every die, so no one can cheat their way to a six.
          </p>
          <Button className="w-full" size="lg" variant="outline" onClick={() => setScreen({ kind: "online" })}>
            Create or join a game
          </Button>
        </section>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Roll a 6 to bring a token out. Land on an opponent to send it back to base, except on ★ safe squares. Sixes,
        captures and getting a token home earn another roll; three sixes in a row lose the turn.
      </p>
    </div>
  );
}
