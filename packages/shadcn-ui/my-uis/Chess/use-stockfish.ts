"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Difficulty = "easy" | "medium" | "hard" | "very-hard";

interface EngineSettings {
  label: string; // difficulty, e.g. "Medium"
  name: string; // the opponent's character name
  emoji: string;
  description: string;
  skill: number; // Stockfish "Skill Level", 0-20
  go: string; // UCI search limits
  randomChance: number; // chance of a random legal move instead, to keep easy levels beatable
}

export const DIFFICULTIES: Record<Difficulty, EngineSettings> = {
  easy: {
    label: "Easy",
    name: "Pawn Pusher",
    emoji: "🐣",
    description: "Still learning how the horse moves. Perfect for your first win!",
    skill: 0,
    go: "go depth 1",
    randomChance: 0.4,
  },
  medium: {
    label: "Medium",
    name: "Knight Rider",
    emoji: "🐴",
    description: "Knows a few tricks, but slips up now and then. Catch it napping!",
    skill: 4,
    go: "go depth 4 movetime 400",
    randomChance: 0.1,
  },
  hard: {
    label: "Hard",
    name: "Castle Crusher",
    emoji: "🏰",
    description: "Sharp and patient. One careless move and it pounces.",
    skill: 12,
    go: "go depth 10 movetime 1000",
    randomChance: 0,
  },
  "very-hard": {
    label: "Very hard",
    name: "The Grandmaster",
    emoji: "👑",
    description: "Thinks like a world champion. Beat this and you have bragging rights forever.",
    skill: 20,
    go: "go movetime 2000",
    randomChance: 0,
  },
};

const ENGINE_URL = "/stockfish/stockfish-19-lite-single.js";

/**
 * Runs Stockfish in a Web Worker and asks it for moves over the UCI protocol.
 * Only one search runs at a time; starting a new one cancels the previous.
 */
export function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const pending = useRef<((move: string | null) => void) | null>(null);
  const staleResults = useRef(0); // bestmove replies still owed for cancelled searches
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let worker: Worker;
    try {
      worker = new Worker(ENGINE_URL);
    } catch {
      setFailed(true);
      return;
    }
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent) => {
      const line = String(event.data);
      if (line === "readyok") setReady(true);
      if (!line.startsWith("bestmove")) return;
      if (staleResults.current > 0) {
        staleResults.current -= 1;
        return;
      }
      const move = line.split(" ")[1];
      const resolve = pending.current;
      pending.current = null;
      resolve?.(move && move !== "(none)" ? move : null);
    };
    worker.onerror = () => setFailed(true);
    worker.postMessage("uci");
    worker.postMessage("isready");
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const cancel = useCallback(() => {
    if (!pending.current) return;
    pending.current(null);
    pending.current = null;
    staleResults.current += 1;
    workerRef.current?.postMessage("stop");
  }, []);

  /** Best move in UCI form (e.g. "e2e4", "e7e8q"), or null if cancelled */
  const bestMove = useCallback(
    (fen: string, skill: number, go: string): Promise<string | null> => {
      const worker = workerRef.current;
      if (!worker) return Promise.resolve(null);
      cancel();
      return new Promise((resolve) => {
        pending.current = resolve;
        worker.postMessage(`setoption name Skill Level value ${skill}`);
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(go);
      });
    },
    [cancel]
  );

  return { ready, failed, bestMove, cancel };
}
