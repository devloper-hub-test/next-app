// Saved progress: personal bests, session history and per-letter accuracy
import { accuracy, wordsPerMinute, type TypingSession } from "./engine";
import type { ModeId } from "./texts";

export interface BestResult {
  score: number;
  wpm: number;
  accuracy: number;
}

export interface HistoryEntry extends BestResult {
  at: number;
  mode: ModeId;
}

export interface KeyQuestProgress {
  best: Partial<Record<ModeId, BestResult>>;
  history: HistoryEntry[]; // most recent last
  keyStats: Record<string, { hits: number; misses: number }>; // lowercase letters only
}

export const emptyProgress: KeyQuestProgress = { best: {}, history: [], keyStats: {} };

const HISTORY_LIMIT = 30;
const STATS_CAP = 200; // halve old counts so recent practice matters more

export const resultOf = (session: TypingSession): BestResult => ({
  score: session.score,
  wpm: wordsPerMinute(session, session.finishedAt ?? Date.now()),
  accuracy: accuracy(session),
});

export function recordSession(
  progress: KeyQuestProgress,
  mode: ModeId,
  session: TypingSession
): KeyQuestProgress {
  const result = resultOf(session);
  const best = progress.best[mode];

  const keyStats = { ...progress.keyStats };
  const bump = (char: string, field: "hits" | "misses", amount = 1) => {
    const letter = char.toLowerCase();
    if (!/^[a-z]$/.test(letter)) return;
    let stat = keyStats[letter] ?? { hits: 0, misses: 0 };
    stat = { ...stat, [field]: stat[field] + amount };
    if (stat.hits + stat.misses > STATS_CAP) {
      stat = { hits: Math.round(stat.hits / 2), misses: Math.round(stat.misses / 2) };
    }
    keyStats[letter] = stat;
  };
  for (const char of session.text.slice(0, session.index)) bump(char, "hits");
  for (const [char, count] of Object.entries(session.missedKeys)) bump(char, "misses", count);

  return {
    best: !best || result.score > best.score ? { ...progress.best, [mode]: result } : progress.best,
    history: [...progress.history, { ...result, at: Date.now(), mode }].slice(-HISTORY_LIMIT),
    keyStats,
  };
}

// Letters missed most often (relative to how often they were typed)
export function weakKeys(progress: KeyQuestProgress, limit = 5): string[] {
  return Object.entries(progress.keyStats)
    .filter(([, s]) => s.misses >= 2)
    .map(([key, s]) => ({ key, rate: s.misses / (s.hits + s.misses) }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit)
    .map(({ key }) => key);
}

export const averageWpm = (history: HistoryEntry[], last = 10) => {
  const recent = history.slice(-last);
  return recent.length ? Math.round(recent.reduce((sum, h) => sum + h.wpm, 0) / recent.length) : 0;
};
