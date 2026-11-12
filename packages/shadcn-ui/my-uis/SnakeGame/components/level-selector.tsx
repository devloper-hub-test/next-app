"use client";

import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Target, Zap, Shield, Gamepad2, CheckCircle2 } from "lucide-react";
import type { Level, SnakeProgress } from "../../../types/snake-game";
import { cn } from "../../../lib/utils";

interface LevelSelectorProps {
  levels: Level[];
  progress: SnakeProgress;
  onSelectLevel: (index: number) => void;
  nokiaMode: boolean;
  onToggleNokiaMode: () => void;
}

const difficulty = (level: Level) => {
  if (level.speed > 150) return { text: "Easy", icon: <Target className="h-4 w-4 text-green-500" /> };
  if (level.speed > 100) return { text: "Medium", icon: <Zap className="h-4 w-4 text-yellow-500" /> };
  if (level.speed > 80) return { text: "Hard", icon: <Shield className="h-4 w-4 text-orange-500" /> };
  return { text: "Insane", icon: <Shield className="h-4 w-4 text-red-500" /> };
};

export function LevelSelector({
  levels,
  progress,
  onSelectLevel,
  nokiaMode,
  onToggleNokiaMode,
}: LevelSelectorProps) {
  const completed = new Set(progress.completedLevels);
  const nextUp = levels.findIndex((level) => !completed.has(level.id));

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-3 text-4xl font-bold">
          <Gamepad2 className="h-9 w-9 text-emerald-500" />
          Snake
        </h1>
        <p className="mt-2 text-muted-foreground">
          {completed.size}/{levels.length} levels cleared. Eat enough food to finish each level.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {nextUp >= 0 && (
            <Button onClick={() => onSelectLevel(nextUp)}>
              {completed.size ? `Continue: Level ${levels[nextUp].id}` : "Start playing"}
            </Button>
          )}
          <Button variant="outline" onClick={onToggleNokiaMode}>
            {nokiaMode ? "Switch to modern look" : "Switch to Nokia look"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level, index) => {
          const done = completed.has(level.id);
          const best = progress.bestScores[level.id];
          const { text, icon } = difficulty(level);
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onSelectLevel(index)}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-card p-4 text-left text-card-foreground transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                done && "border-green-300 dark:border-green-800"
              )}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold">
                  {level.id}. {level.name}
                  {done && <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="Completed" />}
                </p>
                <p className="text-sm text-muted-foreground">{level.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="secondary">{level.foodTarget} food</Badge>
                  <Badge variant="outline">{text}</Badge>
                  <Badge variant="outline">{level.allowWallWrap ? "Wrap-around" : "Solid walls"}</Badge>
                  {best ? <Badge variant="outline">Best {best}</Badge> : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Arrows / WASD to move · Space to pause · R to restart · Esc for menu · Swipe on touch screens
      </p>
    </div>
  );
}
