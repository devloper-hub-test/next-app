import type { ReactNode } from "react";
import { cellKey } from "../engine";
import type {
  Direction,
  GameSettings,
  Level,
  Position,
  SnakeState,
} from "../../../types/snake-game";
import { cn } from "../../../lib/utils";

// Snake colours per level: outline, body fill and head
const SNAKE_COLORS: Record<string, { outline: string; body: string; head: string }> = {
  emerald: { outline: "#047857", body: "#34d399", head: "#10b981" },
  blue: { outline: "#1d4ed8", body: "#60a5fa", head: "#3b82f6" },
  purple: { outline: "#7e22ce", body: "#c084fc", head: "#a855f7" },
  orange: { outline: "#c2410c", body: "#fb923c", head: "#f97316" },
  red: { outline: "#b91c1c", body: "#f87171", head: "#ef4444" },
  cyan: { outline: "#0e7490", body: "#22d3ee", head: "#06b6d4" },
  indigo: { outline: "#4338ca", body: "#818cf8", head: "#6366f1" },
  pink: { outline: "#be185d", body: "#f472b6", head: "#ec4899" },
  yellow: { outline: "#a16207", body: "#fde047", head: "#eab308" },
  teal: { outline: "#0f766e", body: "#2dd4bf", head: "#14b8a6" },
  green: { outline: "#15803d", body: "#4ade80", head: "#22c55e" },
  slate: { outline: "#334155", body: "#94a3b8", head: "#64748b" },
  gray: { outline: "#374151", body: "#9ca3af", head: "#6b7280" },
};

const FORWARD: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Pairs of neighbouring segments to draw as body pieces (skips the jump where the snake wraps an edge)
const bodyLinks = (snake: Position[]) =>
  snake.slice(1).flatMap((segment, i) => {
    const previous = snake[i];
    const adjacent = Math.abs(previous.x - segment.x) + Math.abs(previous.y - segment.y) === 1;
    return adjacent ? [{ from: previous, to: segment, index: i + 1 }] : [];
  });

// Full thickness, tapering over the last few segments into a thin tail
const thickness = (index: number, length: number) => {
  const fromTail = length - 1 - index;
  return fromTail >= 4 ? 1 : 0.45 + (fromTail / 4) * 0.55;
};

function SnakeSprite({ game, level }: { game: SnakeState; level: Level }) {
  const colors = SNAKE_COLORS[level.color] ?? SNAKE_COLORS.emerald;
  const head = game.snake[0];
  if (!head) return null;

  const links = bodyLinks(game.snake);
  const length = game.snake.length;
  const forward = FORWARD[game.direction];
  const side = { x: -forward.y, y: forward.x }; // perpendicular to the direction of travel
  const hx = head.x + 0.5;
  const hy = head.y + 0.5;
  const eyes = [1, -1].map((s) => ({
    x: hx + forward.x * 0.14 + side.x * 0.2 * s,
    y: hy + forward.y * 0.14 + side.y * 0.2 * s,
  }));
  const dead = game.status === "GAME_OVER";

  return (
    <g>
      {/* Body: dark outline pass, then a lighter fill pass on top, so it reads as one rounded tube.
          Each link is a trapezoid between the two segments' widths, with round joints, so the tail tapers smoothly. */}
      {[
        { color: colors.outline, width: 0.78 },
        { color: colors.body, width: 0.58 },
      ].map((pass) => (
        <g key={pass.color} fill={pass.color}>
          {links.map(({ from, to, index }) => {
            const r1 = (pass.width * thickness(index - 1, length)) / 2;
            const r2 = (pass.width * thickness(index, length)) / 2;
            const px = -(to.y - from.y); // unit perpendicular to the link
            const py = to.x - from.x;
            const [ax, ay, bx, by] = [from.x + 0.5, from.y + 0.5, to.x + 0.5, to.y + 0.5];
            return (
              <g key={index}>
                <polygon
                  points={`${ax + px * r1},${ay + py * r1} ${bx + px * r2},${by + py * r2} ${bx - px * r2},${by - py * r2} ${ax - px * r1},${ay - py * r1}`}
                />
                <circle cx={bx} cy={by} r={r2} />
              </g>
            );
          })}
        </g>
      ))}
      {/* Scale spots along the back */}
      {game.snake.slice(1, -2).map((segment, i) =>
        i % 2 === 1 ? (
          <circle key={i} cx={segment.x + 0.5} cy={segment.y + 0.5} r={0.1} fill={colors.outline} opacity={0.35} />
        ) : null
      )}
      {/* Head, a little wider than the body */}
      <circle cx={hx} cy={hy} r={0.48} fill={colors.outline} />
      <circle cx={hx} cy={hy} r={0.39} fill={colors.head} />
      {!dead && game.status === "PLAYING" && (
        <path
          d={`M ${hx + forward.x * 0.42} ${hy + forward.y * 0.42} l ${forward.x * 0.22} ${forward.y * 0.22}`}
          stroke="#e11d48"
          strokeWidth={0.07}
          strokeLinecap="round"
        />
      )}
      {eyes.map((eye, i) => (
        <g key={i}>
          <circle cx={eye.x} cy={eye.y} r={0.12} fill="white" />
          {dead ? (
            <path
              d={`M ${eye.x - 0.07} ${eye.y - 0.07} l 0.14 0.14 M ${eye.x + 0.07} ${eye.y - 0.07} l -0.14 0.14`}
              stroke="#111827"
              strokeWidth={0.04}
            />
          ) : (
            <circle
              cx={eye.x + forward.x * 0.04}
              cy={eye.y + forward.y * 0.04}
              r={0.06}
              fill="#111827"
            />
          )}
        </g>
      ))}
    </g>
  );
}

function Apple({ at }: { at: Position }) {
  const x = at.x + 0.5;
  const y = at.y + 0.55;
  return (
    <g className="animate-pulse">
      <circle cx={x} cy={y} r={0.36} fill="#ef4444" />
      <circle cx={x - 0.12} cy={y - 0.1} r={0.08} fill="white" opacity={0.6} />
      <path d={`M ${x} ${y - 0.32} q 0.02 -0.12 0.08 -0.16`} stroke="#78350f" strokeWidth={0.05} fill="none" />
      <ellipse cx={x + 0.14} cy={y - 0.42} rx={0.12} ry={0.06} fill="#22c55e" transform={`rotate(-30 ${x + 0.14} ${y - 0.42})`} />
    </g>
  );
}

interface GameBoardProps {
  level: Level;
  game: SnakeState;
  settings: GameSettings;
  children?: ReactNode; // overlay (start, pause, game over…)
}

export function GameBoard({ level, game, settings, children }: GameBoardProps) {
  const nokia = settings.nokiaMode;
  const n = level.gridSize;

  // Grid cells hold the background, walls and (in Nokia mode) the pixel snake
  const cells = new Map<string, string>();
  level.obstacles.forEach((o) =>
    cells.set(cellKey(o), nokia ? "bg-[#43523d]" : "rounded-sm bg-slate-500 dark:bg-slate-500")
  );
  if (nokia) {
    if (game.food) cells.set(cellKey(game.food), "bg-[#43523d] rounded-full scale-75");
    game.snake.forEach((segment) => cells.set(cellKey(segment), "bg-[#43523d] scale-90"));
  }
  if (game.crash) cells.set(cellKey(game.crash), "bg-red-500/60 rounded-sm animate-pulse");

  return (
    // Fits one screen below the site header, stats and controls
    <div
      className="relative w-full"
      style={{ maxWidth: "max(16rem, min(100%, 32rem, calc(100dvh - 19rem)))" }}
    >
      <div
        className={cn(
          "relative grid aspect-square w-full touch-none select-none overflow-hidden rounded-xl border-4 p-1",
          nokia
            ? "border-[#43523d] bg-[#c7f0d8]"
            : "border-slate-200 bg-lime-50 dark:border-slate-700 dark:bg-slate-900",
          !level.allowWallWrap && !nokia && "border-slate-400 dark:border-slate-500"
        )}
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        role="img"
        aria-label={`Snake board, ${n} by ${n}`}
      >
        {Array.from({ length: n * n }, (_, i) => {
          const x = i % n;
          const y = Math.floor(i / n);
          const key = cellKey({ x, y });
          return (
            <div
              key={key}
              className={cn(
                "aspect-square",
                // Subtle checkerboard, like a lawn
                !nokia && (x + y) % 2 === 0 && "bg-lime-100/70 dark:bg-slate-800/40",
                settings.showGrid &&
                  (nokia
                    ? "outline outline-1 outline-[#43523d]/10"
                    : "outline outline-1 outline-slate-300/60 dark:outline-slate-700"),
                cells.get(key)
              )}
            />
          );
        })}

        {!nokia && (
          <svg
            className="pointer-events-none absolute inset-1"
            viewBox={`0 0 ${n} ${n}`}
            aria-hidden
          >
            {game.food && <Apple at={game.food} />}
            <SnakeSprite game={game} level={level} />
          </svg>
        )}
      </div>
      {children}
    </div>
  );
}
