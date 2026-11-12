"use client";

import { useCallback, useRef } from "react";

export type SoundName = "eat" | "crash" | "complete";

// Short synthesized beeps, so the game ships no audio files
const NOTES: Record<SoundName, { freq: number; start: number; length: number }[]> = {
  eat: [{ freq: 880, start: 0, length: 0.07 }],
  crash: [
    { freq: 220, start: 0, length: 0.15 },
    { freq: 140, start: 0.15, length: 0.25 },
  ],
  complete: [
    { freq: 523, start: 0, length: 0.1 },
    { freq: 659, start: 0.1, length: 0.1 },
    { freq: 784, start: 0.2, length: 0.1 },
    { freq: 1047, start: 0.3, length: 0.2 },
  ],
};

export function useSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  return useCallback(
    (name: SoundName) => {
      if (!enabled || typeof window === "undefined" || !window.AudioContext) return;
      try {
        contextRef.current ??= new AudioContext();
        const ctx = contextRef.current;
        if (ctx.state === "suspended") void ctx.resume();
        for (const note of NOTES[name]) {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          oscillator.type = "square";
          oscillator.frequency.value = note.freq;
          const at = ctx.currentTime + note.start;
          gain.gain.setValueAtTime(0.06, at);
          gain.gain.exponentialRampToValueAtTime(0.0001, at + note.length);
          oscillator.connect(gain).connect(ctx.destination);
          oscillator.start(at);
          oscillator.stop(at + note.length);
        }
      } catch {
        // Audio is a nice-to-have; ignore browsers that block it
      }
    },
    [enabled]
  );
}
