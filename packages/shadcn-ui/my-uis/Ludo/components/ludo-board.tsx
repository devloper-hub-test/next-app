"use client";

import { useEffect, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { BASE, homeOf, lastTrack, trackSquare } from "../../../lib/ludo-rules";
import {
  BOARD_COLORS,
  LUDO_COLORS,
  LUDO_COLOR_NAMES,
  type BoardSize,
  type LudoColor,
  type LudoGame,
} from "../../../types/ludo";

// Keeps the square board inside the viewport, leaving room for the header
export const BOARD_COLUMN_STYLE: CSSProperties = {
  maxWidth: "max(17rem, min(100%, calc(100dvh - 8rem)))",
};

export const COLOR_HEX: Record<LudoColor, { main: string; light: string; dark: string }> = {
  red: { main: "#ef4444", light: "#fecaca", dark: "#991b1b" },
  green: { main: "#22c55e", light: "#bbf7d0", dark: "#166534" },
  yellow: { main: "#eab308", light: "#fef08a", dark: "#854d0e" },
  blue: { main: "#3b82f6", light: "#bfdbfe", dark: "#1e40af" },
  orange: { main: "#f97316", light: "#fed7aa", dark: "#9a3412" },
  purple: { main: "#a855f7", light: "#e9d5ff", dark: "#6b21a8" },
};

type Point = [number, number]; // [x, y] in board cells

/*
 * The board is a polygon in the middle with one arm per colour sticking out of each side.
 * Every arm is 3 cells wide and 6 long. Arms are laid out in a local frame where the arm
 * points straight up from the centre, then rotated into place: with 4 arms that's the
 * classic 15×15 board, with 6 it's a hexagon whose bases sit in the gaps between the arms.
 *
 * In that frame column -1 is the left side of the arm (walked outward), 0 the middle (the
 * owner's home column) and 1 the right side (walked inward); row 0 is next to the centre
 * and row 5 at the tip.
 */
const LAYOUT: Record<BoardSize, { size: number; apothem: number; baseDistance: number; dieWidth: string }> = {
  4: { size: 15, apothem: 1.5, baseDistance: 4.5 * Math.SQRT2, dieWidth: "11%" },
  // Hexagon with 3-cell sides; each base is the biggest circle that fits in the 60° gap between two arms
  6: { size: 19, apothem: 1.5 * Math.sqrt(3), baseDistance: 7.2, dieWidth: "9%" },
};
const HEX_BASE_RADIUS = 2.1;

// Screen angle (clockwise from pointing right) of the arm owned by the colour in seat `seat`
const armAngle = (arms: BoardSize, seat: number): number => 180 + (seat * 360) / arms;
const seatOf = (arms: BoardSize, color: LudoColor): number => BOARD_COLORS[arms].indexOf(color);

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Moves a point from an arm's local frame onto the board */
const fromArm = (arms: BoardSize, seat: number, [x, y]: Point): Point => {
  const { size } = LAYOUT[arms];
  const turn = toRadians(armAngle(arms, seat) - 270);
  return [size / 2 + x * Math.cos(turn) - y * Math.sin(turn), size / 2 + x * Math.sin(turn) + y * Math.cos(turn)];
};

const cellCentre = (arms: BoardSize, seat: number, column: number, row: number): Point =>
  fromArm(arms, seat, [column, -(LAYOUT[arms].apothem + row + 0.5)]);

/** Where square `square` of the shared loop is. Square 13×seat is that seat's start square. */
const trackPoint = (arms: BoardSize, square: number): Point => {
  const seat = Math.floor(square / 13);
  const step = square % 13;
  const next = (seat + 1) % arms;
  if (step < 5) return cellCentre(arms, seat, 1, 4 - step); // down the rest of your own arm
  if (step < 11) return cellCentre(arms, next, -1, step - 5); // up the next arm
  return step === 11 ? cellCentre(arms, next, 0, 5) : cellCentre(arms, next, 1, 5); // across its tip
};

const baseCentre = (arms: BoardSize, seat: number): Point => {
  const { size, baseDistance } = LAYOUT[arms];
  const angle = toRadians(armAngle(arms, seat) + 180 / arms); // the gap clockwise of your arm
  return [size / 2 + baseDistance * Math.cos(angle), size / 2 + baseDistance * Math.sin(angle)];
};

const baseSpots = (arms: BoardSize, seat: number): Point[] => {
  const [x, y] = baseCentre(arms, seat);
  const d = arms === 4 ? 1 : 0.7;
  return [
    [x - d, y - d],
    [x + d, y - d],
    [x - d, y + d],
    [x + d, y + d],
  ];
};

// Turns the board so `perspective`'s base sits bottom-left, like at a real table
const rotationFor = (arms: BoardSize, perspective: LudoColor): number => {
  const seat = Math.max(0, seatOf(arms, perspective));
  return 135 - (armAngle(arms, seat) + 180 / arms);
};

/** Centre of the spot a token is drawn on */
const tokenPoint = (arms: BoardSize, color: LudoColor, progress: number, index: number): Point => {
  const seat = seatOf(arms, color);
  if (progress === BASE) return baseSpots(arms, seat)[index];
  // Finished tokens gather at the outer edge of their colour's triangle, clear of the die in the middle
  if (progress === homeOf(arms)) return fromArm(arms, seat, [0, -0.85 * LAYOUT[arms].apothem]);
  const last = lastTrack(arms);
  if (progress <= last) return trackPoint(arms, trackSquare(arms, color, progress) as number);
  return cellCentre(arms, seat, 0, 4 - (progress - last - 1));
};

const STEP_MS = 130;

// Walks tokens forward one square at a time instead of teleporting. Captures and resets
// (backward jumps) wait until every forward move has finished.
function useSteppedTokens(tokens: LudoGame["tokens"]): LudoGame["tokens"] {
  const [shown, setShown] = useState(tokens);
  useEffect(() => {
    const walking = (color: LudoColor, i: number) => {
      const from = shown[color][i];
      const to = tokens[color][i];
      return to > from && to - from <= 6 && (from !== BASE || to === 0);
    };
    if (LUDO_COLORS.every((color) => tokens[color].every((p, i) => p === shown[color][i]))) return;
    const timer = setTimeout(() => {
      const anyWalking = LUDO_COLORS.some((color) => tokens[color].some((_, i) => walking(color, i)));
      if (!anyWalking) {
        setShown(tokens);
        return;
      }
      setShown((prev) => {
        const next = { ...prev };
        for (const color of LUDO_COLORS) next[color] = prev[color].map((p, i) => (walking(color, i) ? p + 1 : p));
        return next;
      });
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [shown, tokens]);
  return shown;
}

interface LudoBoardProps {
  game: LudoGame;
  movable: number[]; // tokens of `game.turn` the viewer may click
  onTokenClick: (token: number) => void;
  perspective?: LudoColor;
  label: (color: LudoColor) => string; // e.g. "You" or "Green bot", for screen readers
  center?: ReactNode; // drawn over the middle of the board (the die)
}

export function LudoBoard({ game, movable, onTokenClick, perspective = "blue", label, center }: LudoBoardProps) {
  const { arms } = game;
  const { size, apothem, dieWidth } = LAYOUT[arms];
  const shown = useSteppedTokens(game.tokens);

  // Spread out tokens that share a spot so each one stays visible and clickable
  const placed = game.players.flatMap((color) =>
    shown[color].map((progress, index) => ({
      color,
      index,
      point: tokenPoint(arms, color, progress, index),
    }))
  );
  const stacks = new Map<string, number>();
  const tokens = placed.map((token) => {
    const key = token.point.map((n) => n.toFixed(2)).join(",");
    const position = stacks.get(key) ?? 0;
    stacks.set(key, position + 1);
    return { ...token, key, position };
  });
  const offset = (key: string, position: number): Point => {
    const count = stacks.get(key) ?? 1;
    if (count === 1) return [0, 0];
    const angle = (position / count) * Math.PI * 2 - Math.PI / 4;
    return [Math.cos(angle) * 0.2, Math.sin(angle) * 0.2];
  };
  const isMovable = (color: LudoColor, index: number) => color === game.turn && movable.includes(index);
  // Clickable tokens are drawn last so nothing covers them
  tokens.sort((a, b) => Number(isMovable(a.color, a.index)) - Number(isMovable(b.color, b.index)));

  const onKey = (event: KeyboardEvent, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onTokenClick(index);
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="aspect-square w-full select-none rounded-xl shadow-lg"
        role="img"
        aria-label={`Ludo board for ${arms === 4 ? "up to four" : "up to six"} players`}
      >
        <rect width={size} height={size} fill="#fafaf9" />
        <g transform={`rotate(${rotationFor(arms, perspective)} ${size / 2} ${size / 2})`}>

          {BOARD_COLORS[arms].map((color, seat) => {
            const hex = COLOR_HEX[color];
            const [bx, by] = baseCentre(arms, seat);
            const active = game.status === "playing" && game.turn === color;
            const cells: { column: number; row: number; fill: string; star?: "start" | "safe" }[] = [];
            for (const column of [-1, 0, 1]) {
              for (let row = 0; row < 6; row++) {
                const homeColumn = column === 0 && row < 5;
                const start = column === 1 && row === 4;
                const safe = column === -1 && row === 3; // the star 8 squares after the previous colour's start
                cells.push({
                  column,
                  row,
                  fill: homeColumn || start ? hex.main : "#fff",
                  star: start ? "start" : safe ? "safe" : undefined,
                });
              }
            }
            return (
              <g key={color}>
                <g transform={`translate(${size / 2} ${size / 2}) rotate(${armAngle(arms, seat) - 270})`}>
                  {cells.map(({ column, row, fill, star }) => (
                    <g key={`${column}-${row}`}>
                      <rect
                        x={column - 0.5}
                        y={-(apothem + row + 1)}
                        width={1}
                        height={1}
                        fill={fill}
                        stroke="#a8a29e"
                        strokeWidth={0.03}
                      />
                      {star && (
                        <text
                          x={column}
                          y={-(apothem + row + 0.28)}
                          fontSize={0.62}
                          textAnchor="middle"
                          fill={star === "start" ? "#fff" : "#a8a29e"}
                          aria-hidden
                        >
                          ★
                        </text>
                      )}
                    </g>
                  ))}
                  <polygon
                    points={`-1.5,${-apothem} 1.5,${-apothem} 0,0`}
                    fill={hex.main}
                    stroke="#fff"
                    strokeWidth={0.04}
                  />
                </g>

                {arms === 4 ? (
                  <>
                    <rect
                      x={bx - 3}
                      y={by - 3}
                      width={6}
                      height={6}
                      fill={hex.main}
                      stroke="#a8a29e"
                      strokeWidth={0.03}
                    />
                    <rect x={bx - 2} y={by - 2} width={4} height={4} rx={0.4} fill="#fff" />
                  </>
                ) : (
                  <>
                    <circle cx={bx} cy={by} r={HEX_BASE_RADIUS} fill={hex.main} />
                    <circle cx={bx} cy={by} r={HEX_BASE_RADIUS - 0.5} fill="#fff" />
                  </>
                )}
                {active &&
                  // Pulsing outline round the base of whoever's turn it is
                  (arms === 4 ? (
                    <rect
                      x={bx - 2.85}
                      y={by - 2.85}
                      width={5.7}
                      height={5.7}
                      rx={0.35}
                      fill="none"
                      stroke="#fff"
                      strokeWidth={0.22}
                    >
                      <animate attributeName="stroke-opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite" />
                    </rect>
                  ) : (
                    <circle cx={bx} cy={by} r={HEX_BASE_RADIUS - 0.18} fill="none" stroke="#fff" strokeWidth={0.2}>
                      <animate attributeName="stroke-opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  ))}
                {baseSpots(arms, seat).map(([x, y]) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r={arms === 4 ? 0.55 : 0.45}
                    fill={hex.light}
                    stroke={hex.main}
                    strokeWidth={0.08}
                  />
                ))}
              </g>
            );
          })}

          {tokens.map(({ color, index, point, key, position }) => {
            const [dx, dy] = offset(key, position);
            const stacked = (stacks.get(key) ?? 1) > 1;
            const canClick = isMovable(color, index);
            const hex = COLOR_HEX[color];
            return (
              <g
                key={`${color}-${index}`}
                style={{
                  transform: `translate(${point[0] + dx}px, ${point[1] + dy}px)`,
                  transition: `transform ${STEP_MS - 20}ms ease-out`,
                  cursor: canClick ? "pointer" : undefined,
                }}
                onClick={canClick ? () => onTokenClick(index) : undefined}
                onKeyDown={canClick ? (event) => onKey(event, index) : undefined}
                role={canClick ? "button" : undefined}
                tabIndex={canClick ? 0 : undefined}
                aria-label={canClick ? `Move ${label(color)}'s token ${index + 1}` : undefined}
                className="outline-none [&:focus-visible>circle:first-child]:stroke-sky-500"
              >
                {canClick && (
                  <circle r={0.48} fill="none" stroke="#111827" strokeWidth={0.07}>
                    <animate attributeName="r" values="0.4;0.52;0.4" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                <g transform={stacked ? "scale(0.72)" : undefined}>
                  <circle r={0.36} cy={0.05} fill="#000" opacity={0.25} />
                  <circle r={0.36} fill={hex.main} stroke={hex.dark} strokeWidth={0.07} />
                  <circle r={0.17} fill="#fff" opacity={0.85} />
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      {center && (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ width: dieWidth }}>
          {center}
        </div>
      )}
    </div>
  );
}

export function ColorDot({ color, className }: { color: LudoColor; className?: string }) {
  return (
    <span
      className={className ?? "inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-black/20"}
      style={{ backgroundColor: COLOR_HEX[color].main }}
      aria-label={LUDO_COLOR_NAMES[color]}
    />
  );
}
