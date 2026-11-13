"use client";

import { useCallback, useRef } from "react";

// Soft synthesized key clicks; no audio files needed
export function useTypingSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  return useCallback(
    (kind: "click" | "error") => {
      if (!enabled || typeof window === "undefined" || !window.AudioContext) return;
      try {
        contextRef.current ??= new AudioContext();
        const ctx = contextRef.current;
        if (ctx.state === "suspended") void ctx.resume();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const length = kind === "click" ? 0.03 : 0.12;
        oscillator.type = kind === "click" ? "triangle" : "sawtooth";
        oscillator.frequency.value = kind === "click" ? 1200 : 160;
        gain.gain.setValueAtTime(kind === "click" ? 0.04 : 0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + length);
        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + length);
      } catch {
        // Audio is optional
      }
    },
    [enabled]
  );
}
