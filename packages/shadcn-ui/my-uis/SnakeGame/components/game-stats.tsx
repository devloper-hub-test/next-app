import { Trophy, Target, Clock, Medal } from "lucide-react";
import type { Level } from "../../../types/snake-game";

interface GameStatsProps {
  score: number;
  best: number;
  foodEaten: number;
  seconds: number;
  level: Level;
}

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;

export function GameStatsPanel({ score, best, foodEaten, seconds, level }: GameStatsProps) {
  const progress = Math.min(100, (foodEaten / level.foodTarget) * 100);

  return (
    <div className="grid w-full grid-cols-4 gap-2 rounded-xl border bg-card p-3 text-center text-card-foreground shadow-sm">
      <Stat icon={<Trophy className="h-4 w-4 text-yellow-500" />} label="Score" value={score} />
      <Stat icon={<Medal className="h-4 w-4 text-orange-500" />} label="Best" value={Math.max(best, score)} />
      <div>
        <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Target className="h-4 w-4 text-green-500" /> Food
        </p>
        <p className="text-lg font-bold tabular-nums">
          {foodEaten}/{level.foodTarget}
        </p>
        <div className="mx-auto h-1.5 w-full max-w-[5rem] overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <Stat icon={<Clock className="h-4 w-4 text-blue-500" />} label="Time" value={formatTime(seconds)} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        {icon} {label}
      </p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
