"use client";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Target, Zap, Shield, Gamepad2 } from "lucide-react";
import type { Level } from "../../../types/snake-game";

interface LevelSelectorProps {
  levels: Level[];
  onSelectLevel: (index: number) => void;
  completedLevels: number[];
  nokiaMode: boolean;
  onToggleNokiaMode: () => void;
}

export function LevelSelector({
  levels,
  onSelectLevel,
  completedLevels,
  nokiaMode,
  onToggleNokiaMode,
}: LevelSelectorProps) {
  const getDifficultyIcon = (level: Level) => {
    if (level.speed > 150) return <Target className="w-4 h-4 text-green-500" />;
    if (level.speed > 100) return <Zap className="w-4 h-4 text-yellow-500" />;
    if (level.speed > 80) return <Shield className="w-4 h-4 text-orange-500" />;
    return <Shield className="w-4 h-4 text-red-500" />;
  };

  const getDifficultyText = (level: Level) => {
    if (level.speed > 150) return "Easy";
    if (level.speed > 100) return "Medium";
    if (level.speed > 80) return "Hard";
    return "Insane";
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        nokiaMode
          ? "bg-gradient-to-br from-green-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-white to-cyan-50"
      }`}
    >
      <Card
        className={`w-full max-w-4xl shadow-2xl border-0 ${
          nokiaMode
            ? "bg-green-800/90 backdrop-blur-sm text-green-100"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <CardHeader className="text-center pb-6">
          <CardTitle
            className={`text-4xl font-bold flex items-center justify-center gap-3 ${
              nokiaMode
                ? "text-green-300"
                : "bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent"
            }`}
          >
            <Gamepad2
              className={`w-10 h-10 ${nokiaMode ? "text-green-300" : "text-indigo-600"}`}
            />
            {nokiaMode ? "Nokia Snake" : "Snake Puzzle"}
          </CardTitle>
          <p
            className={`text-lg ${nokiaMode ? "text-green-200" : "text-slate-600"}`}
          >
            {nokiaMode
              ? "Classic mobile gaming experience"
              : "Master the art of strategic navigation"}
          </p>
          <div className="flex justify-center mt-4">
            <Button
              onClick={onToggleNokiaMode}
              variant={nokiaMode ? "secondary" : "outline"}
              className={
                nokiaMode
                  ? "bg-green-700 text-green-100 hover:bg-green-600"
                  : ""
              }
            >
              {nokiaMode ? "Modern Mode" : "Nokia Mode"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3
              className={`font-semibold text-xl mb-4 ${nokiaMode ? "text-green-200" : "text-slate-700"}`}
            >
              Choose Any Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {levels.map((level, index) => {
                const isCompleted = completedLevels.includes(index);

                return (
                  <Button
                    key={level.id}
                    onClick={() => onSelectLevel(index)}
                    variant="outline"
                    className={`p-4 h-auto transition-all duration-200 hover:scale-[1.02] ${
                      nokiaMode
                        ? isCompleted
                          ? "bg-green-700/50 border-green-400 text-green-100 hover:bg-green-600/50"
                          : "bg-green-800/30 border-green-600 text-green-200 hover:bg-green-700/30"
                        : isCompleted
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300"
                          : "hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {getDifficultyIcon(level)}
                        <div className="text-left">
                          <p
                            className={`font-semibold ${nokiaMode ? "text-green-100" : "text-slate-800"}`}
                          >
                            {level.id}. {level.name}
                          </p>
                          <p
                            className={`text-sm ${nokiaMode ? "text-green-300" : "text-slate-500"}`}
                          >
                            {level.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="secondary"
                          className={
                            nokiaMode
                              ? "bg-green-700 text-green-100"
                              : "bg-slate-100"
                          }
                        >
                          {level.foodTarget} food
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${nokiaMode ? "border-green-500 text-green-200" : ""}`}
                        >
                          {getDifficultyText(level)}
                        </Badge>
                        {level.allowWallWrap && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${nokiaMode ? "border-green-400 text-green-300" : "border-blue-300 text-blue-600"}`}
                          >
                            Wall Wrap
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge
                            className={
                              nokiaMode
                                ? "bg-green-600 text-green-100"
                                : "bg-green-100 text-green-700 border-green-200"
                            }
                          >
                            ✓ Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          <div
            className={`text-center space-y-2 pt-4 border-t ${nokiaMode ? "border-green-700" : "border-slate-200"}`}
          >
            <p
              className={`text-sm font-medium ${nokiaMode ? "text-green-200" : "text-slate-500"}`}
            >
              Game Controls
            </p>
            <div
              className={`flex justify-center gap-6 text-xs ${nokiaMode ? "text-green-300" : "text-slate-400"}`}
            >
              <span>↑↓←→ Move</span>
              <span>SPACE Pause</span>
              <span>ESC Menu</span>
            </div>
            {nokiaMode && (
              <p
                className={`text-xs ${nokiaMode ? "text-green-400" : "text-slate-400"}`}
              >
                🎮 Wall Wrap: Snake passes through screen edges like classic
                Nokia!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
