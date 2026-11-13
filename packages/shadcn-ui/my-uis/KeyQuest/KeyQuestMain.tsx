"use client";

import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Keyboard as KeyboardIcon,
  RotateCcw,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { usePersistentState } from "../../hooks/use-persistent-state";
import {
  accuracy,
  multiplier,
  newSession,
  starsFor,
  typingReducer,
  wordsPerMinute,
  type TypingSession,
} from "./engine";
import { MODES, makeText, weakKeysMode, type Mode } from "./texts";
import {
  averageWpm,
  emptyProgress,
  recordSession,
  resultOf,
  weakKeys,
  type BestResult,
  type HistoryEntry,
  type KeyQuestProgress,
} from "./progress";
import { useTypingSound } from "./use-typing-sound";
import { OnScreenKeyboard, fingerFor } from "./components/on-screen-keyboard";

interface Settings {
  sound: boolean;
  showKeyboard: boolean;
}

const formatTime = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
};

export default function KeyQuest() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [session, dispatch] = useReducer(typingReducer, newSession(""));
  const [now, setNow] = useState(() => Date.now());
  const [capsLock, setCapsLock] = useState(false);
  const [progress, setProgress] = usePersistentState<KeyQuestProgress>(
    "keyquest-progress",
    emptyProgress
  );
  const [settings, setSettings] = usePersistentState<Settings>("keyquest-settings", {
    sound: false,
    showKeyboard: true,
  });
  const playSound = useTypingSound(settings.sound);

  // Latest progress for event handlers, so "new best" never compares against stale data
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const previousBest = useRef<BestResult | undefined>(undefined);
  const averageBefore = useRef(0);

  const start = (next: Mode) => {
    const current = progressRef.current;
    previousBest.current = current.best[next.id];
    averageBefore.current = averageWpm(current.history);
    setMode(next);
    dispatch({ type: "RESET", text: makeText(next.id, weakKeys(current)) });
  };
  const type = (key: string) => dispatch({ type: "KEY", key, at: Date.now() });

  const running = !!session.startedAt && !session.finishedAt;
  const finished = !!session.finishedAt;

  // Clock for live speed and the countdown
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [running]);

  // Timed mode ends when the clock runs out
  useEffect(() => {
    if (mode?.seconds && session.startedAt && !finished) {
      const end = session.startedAt + mode.seconds * 1000;
      if (now >= end) dispatch({ type: "FINISH", at: end });
    }
  }, [now, mode, session.startedAt, finished]);

  // Key click / error sounds
  const counts = useRef({ correct: 0, errors: 0 });
  useEffect(() => {
    if (session.errors > counts.current.errors) playSound("error");
    else if (session.correct > counts.current.correct) playSound("click");
    counts.current = { correct: session.correct, errors: session.errors };
  }, [session.correct, session.errors, playSound]);

  // Physical keyboard input
  useEffect(() => {
    if (!mode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      setCapsLock(e.getModifierState?.("CapsLock") ?? false);

      if (e.key === "Escape") {
        e.preventDefault();
        setMode(null);
      } else if (e.key === "Tab" || (finished && e.key === "Enter")) {
        e.preventDefault();
        start(mode);
      } else if (!finished && e.key.length === 1) {
        e.preventDefault(); // stops Space from scrolling the page
        type(e.key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, finished]);

  // Save results when a session ends
  useEffect(() => {
    if (!mode || !session.finishedAt || session.index === 0) return;
    setProgress((p) => recordSession(p, mode.id, session));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.finishedAt]);

  if (!mode) {
    return <Menu progress={progress} onStart={start} />;
  }

  const wpm = wordsPerMinute(session, now);
  const acc = accuracy(session);
  const timeText = mode.seconds
    ? formatTime(mode.seconds * 1000 - (session.startedAt ? now - session.startedAt : 0))
    : formatTime(session.startedAt ? (session.finishedAt ?? now) - session.startedAt : 0);
  const nextChar = session.text[session.index];
  const progressPercent = mode.seconds
    ? Math.min(100, ((session.startedAt ? now - session.startedAt : 0) / (mode.seconds * 1000)) * 100)
    : (session.index / Math.max(1, session.text.length)) * 100;

  const toggle = (label: string, on: boolean, onIcon: React.ReactNode, offIcon: React.ReactNode, key: keyof Settings) => (
    <Button
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
    >
      {on ? onIcon : offIcon}
    </Button>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">KeyQuest · {mode.title}</h1>
          <p className="text-sm text-muted-foreground">{mode.description}</p>
        </div>
        <div className="flex gap-2">
          {toggle(
            settings.sound ? "Turn sounds off" : "Turn sounds on",
            settings.sound,
            <Volume2 className="h-4 w-4" />,
            <VolumeX className="h-4 w-4" />,
            "sound"
          )}
          {toggle(
            settings.showKeyboard ? "Hide keyboard" : "Show keyboard",
            settings.showKeyboard,
            <Eye className="h-4 w-4" />,
            <EyeOff className="h-4 w-4" />,
            "showKeyboard"
          )}
          <Button variant="outline" onClick={() => start(mode)} title="New text (Tab)">
            <RotateCcw className="mr-2 h-4 w-4" /> New text
          </Button>
          <Button variant="outline" onClick={() => setMode(null)}>
            Modes
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card text-center text-card-foreground shadow-sm">
        <div className="grid grid-cols-5 gap-2 p-3">
          <Stat label="Score" value={session.score} />
          <Stat
            label="Combo"
            value={
              <span className={cn(session.streak >= 10 && "text-orange-500")}>
                ×{multiplier(session.streak)}
              </span>
            }
          />
          <Stat label="WPM" value={wpm} />
          <Stat label="Accuracy" value={`${acc}%`} />
          <Stat label={mode.seconds ? "Time left" : "Time"} value={timeText} />
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {finished ? (
        <Results
          session={session}
          previousBest={previousBest.current}
          averageBefore={averageBefore.current}
          onAgain={() => start(mode)}
          onModes={() => setMode(null)}
        />
      ) : (
        <>
          <TypingText session={session} />
          <p className="min-h-5 text-center text-sm text-muted-foreground" aria-live="polite">
            {capsLock ? (
              <span className="font-semibold text-red-500">Caps Lock is on</span>
            ) : !session.startedAt ? (
              "Start typing to begin. The clock starts on your first key."
            ) : nextChar ? (
              <>
                Next:{" "}
                <kbd className="rounded border bg-muted px-1.5 font-mono">
                  {nextChar === " " ? "Space" : nextChar}
                </kbd>{" "}
                with your {fingerFor(nextChar)}
                {session.streak >= 10 && ` · ${session.streak} in a row!`}
              </>
            ) : null}
          </p>
          {settings.showKeyboard ? (
            <OnScreenKeyboard nextChar={nextChar} onKey={type} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Keyboard hidden: trust your fingers.
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Tab for new text · Esc to change mode · on a phone, tap the keys above
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tabular-nums sm:text-xl">{value}</p>
    </div>
  );
}

function TypingText({ session }: { session: TypingSession }) {
  const currentRef = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);
  const missed = useMemo(() => new Set(session.missedAt), [session.missedAt]);

  // Group characters into words so lines only break between words
  const words = useMemo(() => {
    const groups: { char: string; i: number }[][] = [[]];
    [...session.text].forEach((char, i) => {
      groups[groups.length - 1].push({ char, i });
      if (char === " ") groups.push([]);
    });
    return groups;
  }, [session.text]);

  // Scroll whole lines so the current line is always the second of three visible lines
  useLayoutEffect(() => {
    const el = currentRef.current;
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 40;
    const line = Math.floor((el.offsetTop + lineHeight / 4) / lineHeight);
    setOffset(Math.max(0, line - 1) * lineHeight);
  }, [session.index, session.text]);

  return (
    <div className="h-[9.5rem] overflow-hidden rounded-xl border bg-card px-4 py-4 font-mono text-xl leading-10 sm:text-2xl">
      <div
        className="relative transition-transform duration-150"
        style={{ transform: `translateY(-${offset}px)` }}
      >
        {words.map((word, w) => (
          <span key={w} className="inline-block">
            {word.map(({ char, i }) => {
              const current = i === session.index;
              return (
                <span
                  key={current ? `${i}-${session.errorPulse}` : i}
                  ref={current ? currentRef : undefined}
                  className={cn(
                    "rounded-sm",
                    i < session.index &&
                      (missed.has(i) ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"),
                    current && "border-b-2 border-emerald-500 bg-emerald-500/20",
                    current && missed.has(i) && "kq-wrong",
                    i > session.index && "text-muted-foreground"
                  )}
                >
                  {char === " " ? " " : char}
                </span>
              );
            })}
          </span>
        ))}
      </div>
    </div>
  );
}

function Results({
  session,
  previousBest,
  averageBefore,
  onAgain,
  onModes,
}: {
  session: TypingSession;
  previousBest?: BestResult;
  averageBefore: number;
  onAgain: () => void;
  onModes: () => void;
}) {
  const { wpm, accuracy: acc } = resultOf(session);
  const stars = starsFor(wpm, acc);
  const newBest = session.score > 0 && (!previousBest || session.score > previousBest.score);
  const troubleKeys = Object.entries(session.missedKeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const difference = wpm - averageBefore;

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center text-card-foreground shadow-sm">
      <div className="flex gap-1" aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            className={cn(
              "h-9 w-9",
              n <= stars ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"
            )}
          />
        ))}
      </div>
      <h2 className="text-3xl font-bold">
        {session.score} points
        {newBest && (
          <Badge className="ml-3 bg-orange-500 align-middle hover:bg-orange-500">
            <Trophy className="mr-1 h-3.5 w-3.5" /> New best
          </Badge>
        )}
      </h2>
      <p className="text-muted-foreground">
        {wpm} WPM · {acc}% accuracy · best streak {session.bestStreak}
      </p>
      {averageBefore > 0 && (
        <p className={cn("text-sm font-medium", difference >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
          {difference >= 0
            ? `${difference} WPM above your recent average (${averageBefore})`
            : `${-difference} WPM below your recent average (${averageBefore}). Keep at it!`}
        </p>
      )}
      {troubleKeys.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Missed keys:</span>
          {troubleKeys.map(([key, count]) => (
            <kbd key={key} className="rounded border bg-muted px-2 py-0.5 font-mono">
              {key === " " ? "Space" : key} <span className="text-red-500">×{count}</span>
            </kbd>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {stars === 3
          ? "Outstanding! Try a harder mode."
          : stars === 2
            ? "Nice work. Aim for 97% accuracy and 40 WPM for three stars."
            : "Keep going: accuracy first, speed comes with practice."}
      </p>
      <div className="flex gap-2">
        <Button onClick={onAgain} autoFocus>
          Play again
        </Button>
        <Button variant="outline" onClick={onModes}>
          Change mode
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Enter to play again · Esc for modes</p>
    </div>
  );
}

// Tiny WPM trend line for the last sessions
function Sparkline({ history }: { history: HistoryEntry[] }) {
  if (history.length < 2) return null;
  const width = 240;
  const height = 48;
  const max = Math.max(...history.map((h) => h.wpm), 10);
  const points = history
    .map((h, i) => `${(i / (history.length - 1)) * width},${height - (h.wpm / max) * (height - 4) - 2}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-12 w-full max-w-[15rem]"
      role="img"
      aria-label={`Speed over your last ${history.length} sessions`}
    >
      <polyline points={points} fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Menu({ progress, onStart }: { progress: KeyQuestProgress; onStart: (mode: Mode) => void }) {
  const weak = weakKeys(progress);
  const modes = weak.length ? [...MODES, weakKeysMode(weak)] : MODES;
  const bestWpm = Math.max(0, ...progress.history.map((h) => h.wpm));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8">
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-3 text-4xl font-bold">
          <KeyboardIcon className="h-9 w-9 text-emerald-500" /> KeyQuest
        </h1>
        <p className="mt-2 text-muted-foreground">
          Level up your typing, one key at a time. Every correct key scores points, and streaks
          multiply them.
        </p>
      </div>

      {progress.history.length > 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-5 text-card-foreground sm:flex-row sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Your progress
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {progress.history.length} recent sessions · average {averageWpm(progress.history)} WPM ·
              best {bestWpm} WPM
            </p>
            {weak.length > 0 && (
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                <Target className="h-4 w-4 text-red-500" /> Letters to work on:
                {weak.map((key) => (
                  <kbd key={key} className="rounded border bg-muted px-1.5 font-mono uppercase">
                    {key}
                  </kbd>
                ))}
              </p>
            )}
          </div>
          <Sparkline history={progress.history} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {modes.map((mode) => {
          const best = progress.best[mode.id];
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onStart(mode)}
              className={cn(
                "flex flex-col rounded-xl border bg-card p-5 text-left text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode.id === "weak" && "border-red-300 dark:border-red-900"
              )}
            >
              <span className="text-lg font-semibold">{mode.title}</span>
              <span className="mt-1 flex-1 text-sm text-muted-foreground">{mode.description}</span>
              <span className="mt-4 text-sm">
                {best ? (
                  <>
                    Best: <b>{best.score}</b> pts · {best.wpm} WPM · {best.accuracy}%
                  </>
                ) : (
                  <span className="text-muted-foreground">Not played yet</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="flex items-center gap-2 font-semibold">
          <Zap className="h-4 w-4 text-yellow-500" /> How scoring works
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Each correct key is worth 10 points.</li>
          <li>Every 10 correct keys in a row raise your combo, up to ×5. A wrong key resets it.</li>
          <li>A wrong key doesn&apos;t move you forward; press the right one to continue.</li>
          <li>Rest your fingers on the home row: A S D F and J K L ; (feel the bumps on F and J).</li>
          <li>The letters you miss most are tracked, and a practice mode for them appears here.</li>
        </ul>
      </div>
    </div>
  );
}
