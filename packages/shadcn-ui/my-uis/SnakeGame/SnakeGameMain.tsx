"use client";

import { useEffect, useReducer, useRef, type ReactNode } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Grid3X3,
  Home,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import type {
  Direction,
  GameSettings,
  SnakeProgress,
} from "../../types/snake-game";
import { LEVELS } from "./levels";
import { initialSnakeState, snakeReducer } from "./engine";
import { useSound } from "./hooks/use-sound";
import { usePersistentState } from "../../hooks/use-persistent-state";
import { GameBoard } from "./components/game-board";
import { GameStatsPanel } from "./components/game-stats";
import { LevelSelector } from "./components/level-selector";

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "UP",
  w: "UP",
  W: "UP",
  ArrowDown: "DOWN",
  s: "DOWN",
  S: "DOWN",
  ArrowLeft: "LEFT",
  a: "LEFT",
  A: "LEFT",
  ArrowRight: "RIGHT",
  d: "RIGHT",
  D: "RIGHT",
};

const SWIPE_THRESHOLD_PX = 24;

export default function SnakeGame() {
  const [game, dispatch] = useReducer(snakeReducer, undefined, () =>
    initialSnakeState()
  );
  const [settings, setSettings] = usePersistentState<GameSettings>(
    "snake-settings",
    { nokiaMode: false, soundEnabled: true, showGrid: false }
  );
  const [progress, setProgress] = usePersistentState<SnakeProgress>(
    "snake-progress",
    { completedLevels: [], bestScores: {} }
  );
  const playSound = useSound(settings.soundEnabled);

  const level = LEVELS[game.levelIndex];
  const isLastLevel = game.levelIndex === LEVELS.length - 1;
  const best = progress.bestScores[level.id] ?? 0;

  const startLevel = (levelIndex: number) =>
    dispatch({ type: "START_LEVEL", levelIndex });
  const togglePause = () =>
    dispatch({ type: game.status === "PAUSED" ? "RESUME" : "PAUSE" });

  // Game loop: one tick per move at the level's speed
  useEffect(() => {
    if (game.status !== "PLAYING") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), level.speed);
    return () => clearInterval(id);
  }, [game.status, level.speed]);

  // Sounds and saved progress react to what just happened
  const previous = useRef(game);
  useEffect(() => {
    const before = previous.current;
    previous.current = game;
    if (game.foodEaten > before.foodEaten && game.status === "PLAYING") {
      playSound("eat");
    }
    if (game.status === before.status) return;
    if (game.status === "GAME_OVER") playSound("crash");
    if (game.status === "LEVEL_COMPLETE") playSound("complete");
    if (game.status === "GAME_OVER" || game.status === "LEVEL_COMPLETE") {
      setProgress((p) => ({
        completedLevels:
          game.status === "LEVEL_COMPLETE" && !p.completedLevels.includes(level.id)
            ? [...p.completedLevels, level.id]
            : p.completedLevels,
        bestScores:
          game.score > (p.bestScores[level.id] ?? 0)
            ? { ...p.bestScores, [level.id]: game.score }
            : p.bestScores,
      }));
    }
  }, [game, level.id, playSound, setProgress]);

  // Keyboard controls (ignored while typing in a form field elsewhere on the page)
  useEffect(() => {
    if (game.status === "MENU") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const direction = KEY_DIRECTIONS[e.key];
      if (direction) dispatch({ type: "TURN", direction });
      else if (e.key === " " || e.key === "p" || e.key === "P") {
        dispatch({ type: game.status === "PAUSED" ? "RESUME" : "PAUSE" });
      } else if (e.key === "r" || e.key === "R") startLevel(game.levelIndex);
      else if (e.key === "Escape") dispatch({ type: "MENU" });
      else if (e.key === "Enter" && game.status === "GAME_OVER") startLevel(game.levelIndex);
      else if (e.key === "Enter" && game.status === "LEVEL_COMPLETE" && !isLastLevel) {
        startLevel(game.levelIndex + 1);
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game.status, game.levelIndex, isLastLevel]);

  // Pause automatically when the tab is hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) dispatch({ type: "PAUSE" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Swipe controls: turn as soon as the finger has moved far enough, so swipes can chain
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchOrigin.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const origin = touchOrigin.current;
    if (!origin) return;
    const { clientX, clientY } = e.touches[0];
    const dx = clientX - origin.x;
    const dy = clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD_PX) return;
    const direction: Direction =
      Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "RIGHT" : "LEFT") : dy > 0 ? "DOWN" : "UP";
    dispatch({ type: "TURN", direction });
    touchOrigin.current = { x: clientX, y: clientY };
  };

  if (game.status === "MENU") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <LevelSelector
          levels={LEVELS}
          progress={progress}
          onSelectLevel={startLevel}
          nokiaMode={settings.nokiaMode}
          onToggleNokiaMode={() =>
            setSettings((s) => ({ ...s, nokiaMode: !s.nokiaMode }))
          }
        />
      </div>
    );
  }

  const menuButton = (
    <Button variant="outline" onClick={() => dispatch({ type: "MENU" })}>
      Levels
    </Button>
  );

  let overlay: ReactNode = null;
  switch (game.status) {
    case "READY":
      overlay = (
        <Overlay title={`Level ${level.id}: ${level.name}`}>
          <p className="text-sm text-muted-foreground">{level.description}</p>
          <p className="text-sm">
            Eat {level.foodTarget} food.{" "}
            {level.allowWallWrap ? "You can pass through the edges." : "The edges are solid walls."}
          </p>
          <Button onClick={() => dispatch({ type: "TURN", direction: game.direction })}>
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
          <p className="text-xs text-muted-foreground">or press an arrow key / swipe</p>
        </Overlay>
      );
      break;
    case "PAUSED":
      overlay = (
        <Overlay title="Paused">
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => dispatch({ type: "RESUME" })}>
              <Play className="mr-2 h-4 w-4" /> Resume
            </Button>
            <Button variant="outline" onClick={() => startLevel(game.levelIndex)}>
              Restart
            </Button>
            {menuButton}
          </div>
        </Overlay>
      );
      break;
    case "GAME_OVER":
      overlay = (
        <Overlay title="Game over">
          <p className="text-lg font-semibold">
            Score {game.score}
            {game.score > 0 && game.score === best && (
              <span className="ml-2 text-orange-500">New best!</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {game.foodEaten}/{level.foodTarget} food eaten
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => startLevel(game.levelIndex)} autoFocus>
              <RotateCcw className="mr-2 h-4 w-4" /> Try again
            </Button>
            {menuButton}
          </div>
        </Overlay>
      );
      break;
    case "LEVEL_COMPLETE":
      overlay = (
        <Overlay
          title={isLastLevel ? "You beat every level! 🎉" : "Level complete!"}
          icon={<Trophy className="h-8 w-8 text-yellow-500" />}
        >
          <p className="text-lg font-semibold">Score {game.score}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {!isLastLevel && (
              <Button onClick={() => startLevel(game.levelIndex + 1)} autoFocus>
                Next level
              </Button>
            )}
            <Button variant="outline" onClick={() => startLevel(game.levelIndex)}>
              Replay
            </Button>
            {menuButton}
          </div>
        </Overlay>
      );
      break;
  }

  const iconButton = (label: string, onClick: () => void, icon: ReactNode) => (
    <Button variant="outline" size="icon" onClick={onClick} aria-label={label} title={label}>
      {icon}
    </Button>
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-3">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 text-base">
            Level {level.id}
          </Badge>
          <div>
            <h1 className="text-xl font-bold leading-tight">{level.name}</h1>
            <p className="text-sm text-muted-foreground">{level.description}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {iconButton(
            settings.soundEnabled ? "Mute sounds" : "Unmute sounds",
            () => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled })),
            settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />
          )}
          {iconButton(
            settings.showGrid ? "Hide grid" : "Show grid",
            () => setSettings((s) => ({ ...s, showGrid: !s.showGrid })),
            <Grid3X3 className="h-4 w-4" />
          )}
          {(game.status === "PLAYING" || game.status === "PAUSED") &&
            iconButton(
              game.status === "PAUSED" ? "Resume (Space)" : "Pause (Space)",
              togglePause,
              game.status === "PAUSED" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />
            )}
          {iconButton("Restart level (R)", () => startLevel(game.levelIndex), <RotateCcw className="h-4 w-4" />)}
          {iconButton("Level menu (Esc)", () => dispatch({ type: "MENU" }), <Home className="h-4 w-4" />)}
        </div>
      </div>

      <GameStatsPanel
        score={game.score}
        best={best}
        foodEaten={game.foodEaten}
        seconds={(game.moves * level.speed) / 1000}
        level={level}
      />

      <div className="flex w-full justify-center" onTouchStart={onTouchStart} onTouchMove={onTouchMove}>
        <GameBoard level={level} game={game} settings={settings}>
          {overlay}
        </GameBoard>
      </div>

      {/* On-screen controls for touch devices */}
      <div className="grid grid-cols-3 gap-2 md:hidden" aria-label="Direction controls">
        <span />
        <DirectionButton direction="UP" onTurn={(direction) => dispatch({ type: "TURN", direction })} />
        <span />
        <DirectionButton direction="LEFT" onTurn={(direction) => dispatch({ type: "TURN", direction })} />
        <Button
          variant="secondary"
          className="h-14 w-14"
          onClick={togglePause}
          disabled={game.status !== "PLAYING" && game.status !== "PAUSED"}
          aria-label={game.status === "PAUSED" ? "Resume" : "Pause"}
        >
          {game.status === "PAUSED" ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
        <DirectionButton direction="RIGHT" onTurn={(direction) => dispatch({ type: "TURN", direction })} />
        <span />
        <DirectionButton direction="DOWN" onTurn={(direction) => dispatch({ type: "TURN", direction })} />
        <span />
      </div>
    </div>
  );
}

function Overlay({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 p-4 backdrop-blur-[2px]">
      <div className="flex max-w-xs flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center text-card-foreground shadow-xl">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const DIRECTION_ICONS: Record<Direction, ReactNode> = {
  UP: <ChevronUp className="h-6 w-6" />,
  DOWN: <ChevronDown className="h-6 w-6" />,
  LEFT: <ChevronLeft className="h-6 w-6" />,
  RIGHT: <ChevronRight className="h-6 w-6" />,
};

function DirectionButton({
  direction,
  onTurn,
}: {
  direction: Direction;
  onTurn: (direction: Direction) => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-14 w-14 touch-none"
      aria-label={`Move ${direction.toLowerCase()}`}
      // pointerdown reacts instantly; click would wait for the finger to lift
      onPointerDown={(e) => {
        e.preventDefault();
        onTurn(direction);
      }}
    >
      {DIRECTION_ICONS[direction]}
    </Button>
  );
}
