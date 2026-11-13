"use client";

import { useCallback, useState } from "react";
import { Bot, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { Color } from "../../types/chess";
import SoloChess, { type SoloRecord } from "./SoloChess";
import OnlineChess from "./OnlineChess";
import { DIFFICULTIES, type Difficulty } from "./use-stockfish";

type Screen = { kind: "menu" } | { kind: "solo"; difficulty: Difficulty; color: Color; key: number } | { kind: "online" };

const emptyRecord: SoloRecord = { wins: 0, losses: 0, draws: 0 };

export default function ChessGame() {
  const [screen, setScreen] = useState<Screen>({ kind: "menu" });
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [colorChoice, setColorChoice] = useState<Color | "random">("w");
  const [records, setRecords] = usePersistentState<Partial<Record<Difficulty, SoloRecord>>>(
    "chess-records",
    {}
  );

  const onGameOver = useCallback(
    (level: Difficulty, outcome: keyof SoloRecord) =>
      setRecords((r) => {
        const record = r[level] ?? emptyRecord;
        return { ...r, [level]: { ...record, [outcome]: record[outcome] + 1 } };
      }),
    [setRecords]
  );

  if (screen.kind === "solo") {
    return (
      <SoloChess
        key={screen.key}
        difficulty={screen.difficulty}
        playerColor={screen.color}
        onExit={() => setScreen({ kind: "menu" })}
        onGameOver={onGameOver}
      />
    );
  }
  if (screen.kind === "online") {
    return <OnlineChess onExit={() => setScreen({ kind: "menu" })} />;
  }

  const startSolo = () =>
    setScreen({
      kind: "solo",
      difficulty,
      color: colorChoice === "random" ? (Math.random() < 0.5 ? "w" : "b") : colorChoice,
      key: Date.now(),
    });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">♞ Chess</h1>
        <p className="mt-2 text-muted-foreground">Outsmart the bots, or take on a friend. Your move!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Bot className="h-5 w-5 text-emerald-500" /> Pick your opponent
          </h2>

          <div className="space-y-2" role="radiogroup" aria-label="Difficulty">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((level) => {
              const record = records[level];
              return (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={difficulty === level}
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition",
                    difficulty === level ? "border-emerald-500 bg-emerald-500/10" : "hover:bg-muted"
                  )}
                >
                  <span className="flex items-start gap-3">
                    <span className="text-2xl leading-none" aria-hidden>
                      {DIFFICULTIES[level].emoji}
                    </span>
                    <span>
                      <span className="font-medium">{DIFFICULTIES[level].name}</span>
                      <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                        {DIFFICULTIES[level].label}
                      </span>
                      <span className="block text-sm text-muted-foreground">{DIFFICULTIES[level].description}</span>
                    </span>
                  </span>
                  {record && (
                    <span className="shrink-0 pl-2 text-xs text-muted-foreground">
                      Won {record.wins} of {record.wins + record.losses + record.draws}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Play as</p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Your colour">
              {(
                [
                  ["w", "White"],
                  ["random", "Random"],
                  ["b", "Black"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  role="radio"
                  aria-checked={colorChoice === value}
                  variant={colorChoice === value ? "default" : "outline"}
                  onClick={() => setColorChoice(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={startSolo}>
            Let&apos;s play!
          </Button>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5 text-sky-500" /> Challenge a friend
          </h2>
          <p className="flex-1 text-muted-foreground">
            Start a game, send your friend a 5-letter code, and battle it out live from anywhere. Lost? Hit rematch
            and swap colours for revenge.
          </p>
          <Button className="w-full" size="lg" variant="outline" onClick={() => setScreen({ kind: "online" })}>
            Start or join a match
          </Button>
        </section>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Drag a piece, or tap it and then tap where it should go. Bots powered by{" "}
        <a className="underline" href="https://stockfishchess.org" target="_blank" rel="noreferrer">
          Stockfish
        </a>
        , one of the strongest chess engines in the world.
      </p>
    </div>
  );
}
