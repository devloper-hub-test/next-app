"use client";

import { useEffect, useState } from "react";

type ProgressSource = "chess" | "snake";

const readJson = <T,>(key: string): T | null => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
};

// Reads what the games already save in this browser
const describe: Record<ProgressSource, () => string | null> = {
  snake: () => {
    const progress = readJson<{ completedLevels?: number[] }>("snake-progress");
    const cleared = progress?.completedLevels?.length ?? 0;
    return cleared ? `${cleared}/20 levels cleared` : null;
  },
  chess: () => {
    const records = readJson<Record<string, { wins?: number }>>("chess-records");
    const wins = Object.values(records ?? {}).reduce((sum, r) => sum + (r.wins ?? 0), 0);
    if (!wins) return null;
    return `${wins} ${wins === 1 ? "win" : "wins"} vs the bots`;
  },
};

/** "Your progress" pill on a game card; renders nothing until there is progress to show */
export function GameProgress({ source }: { source: ProgressSource }): JSX.Element | null {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    setText(describe[source]());
  }, [source]);
  if (!text) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
      🏅 {text}
    </span>
  );
}
