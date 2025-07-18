import { Card, CardContent } from "../../../components/ui/card";
import { Trophy, Target, Clock, Zap } from "lucide-react";
import type { GameStats, Level } from "../../../types/snake-game";

interface GameStatsProps {
  stats: GameStats;
  level: Level;
  formatTime: (seconds: number) => string;
}

export function GameStatsPanel({ stats, level, formatTime }: GameStatsProps) {
  const progress = (stats.foodEaten / level.foodTarget) * 100;

  return (
    <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 shadow-lg">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-slate-600">Score</p>
              <p className="text-xl font-bold text-slate-800">{stats.score}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-slate-600">Progress</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-slate-800">
                  {stats.foodEaten}/{level.foodTarget}
                </p>
                <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-slate-600">Time</p>
              <p className="text-xl font-bold text-slate-800">
                {formatTime(stats.timeElapsed)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-slate-600">Moves</p>
              <p className="text-xl font-bold text-slate-800">{stats.moves}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
