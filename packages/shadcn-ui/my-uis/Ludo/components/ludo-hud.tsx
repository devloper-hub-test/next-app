"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils";
import { homeOf } from "../../../lib/ludo-rules";
import type { LudoColor, LudoGame, LudoNote } from "../../../types/ludo";
import { COLOR_HEX, ColorDot } from "./ludo-board";

// Pip positions on a 3×3 grid (0–8, reading order) for each face
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const ROLL_MS = 1000;

// Each face's place on the cube, and the cube rotation [x, y] that turns it to face you.
// Opposite faces add up to 7, like a real die.
const FACES: { value: number; transform: string; show: [number, number] }[] = [
  { value: 1, transform: "rotateY(0deg)", show: [0, 0] },
  { value: 6, transform: "rotateY(180deg)", show: [0, 180] },
  { value: 3, transform: "rotateY(90deg)", show: [0, -90] },
  { value: 4, transform: "rotateY(-90deg)", show: [0, 90] },
  { value: 2, transform: "rotateX(90deg)", show: [-90, 0] },
  { value: 5, transform: "rotateX(-90deg)", show: [90, 0] },
];
const showFace = (value: number): [number, number] => (FACES.find((f) => f.value === value) ?? FACES[1]).show;

// Smallest angle at least `minimum` that lands on `target` (mod 360), so the cube always spins forward
const spinTo = (target: number, minimum: number): number => target + 360 * Math.ceil((minimum - target) / 360);

interface DieProps {
  value: number | null;
  rollId: number; // changes on every roll, even when the same number comes up twice
  color: LudoColor; // whose turn it is: the die takes their colour
  rolledBy: LudoColor | null; // who threw the last roll, so it keeps their colour while it tumbles
  canRoll: boolean;
  onRoll: () => void;
}

/**
 * A 3D die that sits in the middle of the board. Whenever anyone rolls it jumps, tumbles
 * and bounces before settling on the number; on your roll it glows and is tappable.
 */
export function Die({ value, rollId, color, rolledBy, canRoll, onRoll }: DieProps) {
  const [rotation, setRotation] = useState<[number, number]>(() => showFace(value ?? 6));
  const [reduceMotion, setReduceMotion] = useState(false);
  const [tumbling, setTumbling] = useState(false);
  const hop = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const lastRoll = useRef(rollId);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (rollId === lastRoll.current) return;
    lastRoll.current = rollId;
    if (!value) return; // a new game, nothing rolled yet

    const [x, y] = showFace(value);
    const turns = reduceMotion ? 0 : 2;
    setRotation(([px, py]) => [spinTo(x, px + 360 * turns), spinTo(y, py + 360 * (turns + 1))]);
    if (reduceMotion) return;

    // Up in the air, down with a bounce, and a little settle
    setTumbling(true);
    const flight = hop.current?.animate(
      [
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(-55%) scale(1.7)", offset: 0.3 },
        { transform: "translateY(0) scale(1.25)", offset: 0.62 },
        { transform: "translateY(-14%) scale(1.15)", offset: 0.78 },
        { transform: "translateY(0) scale(1)" },
      ],
      { duration: ROLL_MS, easing: "ease-out" }
    );
    if (flight) flight.onfinish = () => setTumbling(false);
    else setTumbling(false);
    shadow.current?.animate(
      [
        { transform: "scale(1)", opacity: 0.35 },
        { transform: "scale(0.6)", opacity: 0.15, offset: 0.3 },
        { transform: "scale(1.2)", opacity: 0.35, offset: 0.62 },
        { transform: "scale(0.9)", opacity: 0.25, offset: 0.78 },
        { transform: "scale(1)", opacity: 0.35 },
      ],
      { duration: ROLL_MS, easing: "ease-out" }
    );
  }, [rollId, value, reduceMotion]);

  const hex = COLOR_HEX[tumbling && rolledBy ? rolledBy : color];

  return (
    <button
      type="button"
      onClick={onRoll}
      disabled={!canRoll}
      aria-label={canRoll ? "Roll the die" : value ? `Die shows ${value}` : "Die"}
      className={cn(
        "group relative block aspect-square w-full rounded-[22%] outline-none [perspective:400px]",
        canRoll ? "animate-bounce cursor-pointer" : "cursor-default",
        "focus-visible:ring-4 focus-visible:ring-sky-500"
      )}
    >
      {/* Shadow on the board, shrinking as the die jumps */}
      <div
        ref={shadow}
        className="absolute inset-x-[8%] -bottom-[14%] h-[22%] rounded-[50%] bg-black opacity-35 blur-[3px]"
        aria-hidden
      />
      {canRoll && (
        <span
          className="absolute -inset-[18%] animate-ping rounded-full opacity-60"
          style={{ backgroundColor: hex.main }}
          aria-hidden
        />
      )}
      <div
        ref={hop}
        className={cn(
          "relative h-full w-full [container-type:inline-size] [transform-style:preserve-3d]",
          canRoll && "transition-transform group-hover:scale-110"
        )}
      >
        <div
          className="relative h-full w-full [transform-style:preserve-3d]"
          style={{
            transform: `rotateX(${rotation[0]}deg) rotateY(${rotation[1]}deg)`,
            transition: `transform ${reduceMotion ? 150 : ROLL_MS}ms cubic-bezier(0.15, 0.65, 0.25, 1)`,
          }}
        >
          {FACES.map((face) => (
            <div
              key={face.value}
              className="absolute inset-0 grid grid-cols-3 grid-rows-3 rounded-[18%] p-[16%] [backface-visibility:hidden]"
              style={{
                transform: `${face.transform} translateZ(50cqw)`,
                background: `linear-gradient(145deg, color-mix(in srgb, ${hex.main} 65%, white) 0%, ${hex.main} 45%, color-mix(in srgb, ${hex.main} 55%, ${hex.dark}) 100%)`,
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35), inset -3px -4px 8px rgba(0,0,0,0.25)",
              }}
              aria-hidden
            >
              {Array.from({ length: 9 }, (_, i) => (
                <span
                  key={i}
                  className="m-auto aspect-square w-[78%] rounded-full"
                  style={
                    PIPS[face.value].includes(i)
                      ? {
                          background: "radial-gradient(circle at 35% 35%, #ffffff, #e5e7eb)",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.45)",
                          transform: face.value === 1 ? "scale(1.5)" : undefined,
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

interface TurnBannerProps {
  color: LudoColor; // whose turn it is
  mine: boolean;
  title: string;
  subtitle?: string | null;
}

/** Strip above the board saying whose turn it is, filled with your colour when it's yours */
export function TurnBanner({ color, mine, title, subtitle }: TurnBannerProps) {
  // A buzz on phones, and a tab title that says so when you're looking elsewhere
  useEffect(() => {
    if (!mine) return;
    navigator.vibrate?.(80);
    const original = document.title;
    document.title = `🎲 Your turn! · ${original}`;
    return () => {
      document.title = original;
    };
  }, [mine]);

  const hex = COLOR_HEX[color];
  if (!mine) {
    return (
      <div className="flex min-h-14 items-center gap-3 rounded-xl border bg-card px-4 py-2 text-card-foreground">
        <ColorDot color={color} className="h-5 w-5 shrink-0 rounded-full border border-black/20" />
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex min-h-14 items-center gap-3 rounded-xl px-4 py-2 shadow-md"
      style={{ backgroundColor: hex.main, color: color === "yellow" ? "#422006" : "#fff" }}
    >
      <span className="text-2xl leading-none" aria-hidden>
        🎲
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold">{title}</p>
        {subtitle && <p className="text-sm font-medium opacity-90">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Wait until the die stops tumbling before acting on a roll */
export const DIE_SETTLE_MS = ROLL_MS + 100;

export function describeNote(note: LudoNote | null, name: (color: LudoColor) => string): string | null {
  if (!note) return null;
  switch (note.kind) {
    case "no-move":
      return `${name(note.color)} rolled a ${note.value}: no moves.`;
    case "three-sixes":
      return `Three sixes in a row! ${name(note.color)} loses the turn.`;
    case "capture":
      return `${name(note.color)} sent ${note.victims.map(name).join(" and ")} back to base!`;
    case "home":
      return `${name(note.color)} got a token home!`;
  }
}

interface PlayerListProps {
  game: LudoGame;
  colors: LudoColor[]; // everyone at the table, including anyone who has left
  name: (color: LudoColor) => string;
  extra?: (color: LudoColor) => string | null; // e.g. a running score
}

export function PlayerList({ game, colors, name, extra }: PlayerListProps) {
  return (
    <ul className="space-y-1.5">
      {colors.map((color) => {
        const playing = game.players.includes(color);
        const home = game.tokens[color].filter((p) => p === homeOf(game.arms)).length;
        const active = game.status === "playing" && game.turn === color;
        return (
          <li
            key={color}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition",
              active ? "border-foreground/30 bg-muted" : "border-transparent",
              !playing && "opacity-50"
            )}
          >
            <span className="flex items-center gap-2">
              <ColorDot color={color} />
              <span className="font-medium">{name(color)}</span>
              {active && <Badge variant="secondary">to play</Badge>}
              {!playing && game.status === "playing" && <span className="text-xs text-muted-foreground">left</span>}
            </span>
            <span className="text-xs text-muted-foreground">
              {[`${home}/4 home`, extra?.(color)].filter(Boolean).join(" · ")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
