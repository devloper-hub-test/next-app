"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Home,
  Volume2,
  VolumeX,
  Grid3X3,
} from "lucide-react";
import type {
  Position,
  Direction,
  GameState,
  GameStats,
  GameSettings,
} from "../../types/snake-game";

import { LEVELS } from "./levels";
import { useGameTimer } from "./hooks/use-game-timer";
import { GameBoard } from "./components/game-board";
import { GameStatsPanel } from "./components/game-stats";
import { LevelSelector } from "./components/level-selector";

export default function SnakeGame() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    foodEaten: 0,
    moves: 0,
    timeElapsed: 0,
  });
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    nokiaMode: false,
    soundEnabled: true,
    showGrid: false,
  });
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const level = LEVELS[currentLevel];
  const { timeElapsed, resetTimer, formatTime } = useGameTimer(
    gameState === "PLAYING"
  );

  // Update game stats with timer
  useEffect(() => {
    setGameStats((prev) => ({ ...prev, timeElapsed }));
  }, [timeElapsed]);

  const wrapPosition = (pos: Position): Position => {
    if (!level.allowWallWrap) return pos;

    return {
      x: pos.x < 0 ? level.gridSize - 1 : pos.x >= level.gridSize ? 0 : pos.x,
      y: pos.y < 0 ? level.gridSize - 1 : pos.y >= level.gridSize ? 0 : pos.y,
    };
  };

  const generateFood = useCallback(() => {
    let newFood: Position;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      newFood = {
        x: Math.floor(Math.random() * level.gridSize),
        y: Math.floor(Math.random() * level.gridSize),
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      (snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      ) ||
        level.obstacles.some(
          (obstacle) => obstacle.x === newFood.x && obstacle.y === newFood.y
        ))
    );

    return newFood;
  }, [snake, level]);

  const resetGame = useCallback(() => {
    const centerX = Math.floor(level.gridSize / 2);
    const centerY = Math.floor(level.gridSize / 2);

    setSnake([{ x: centerX, y: centerY }]);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setGameStats({
      score: 0,
      foodEaten: 0,
      moves: 0,
      timeElapsed: 0,
    });
    resetTimer();

    // Generate initial food position
    const initialFood = {
      x: Math.floor(Math.random() * level.gridSize),
      y: Math.floor(Math.random() * level.gridSize),
    };
    setFood(initialFood);
  }, [level, resetTimer]);

  const startLevel = useCallback(
    (levelIndex: number) => {
      setCurrentLevel(levelIndex);
      setGameState("LOADING");

      // Simulate loading for smooth transition
      setTimeout(() => {
        resetGame();
        setGameState("PLAYING");
      }, 300);
    },
    [resetGame]
  );

  const nextLevel = useCallback(() => {
    // Mark current level as completed
    setCompletedLevels((prev) => [...new Set([...prev, currentLevel])]);

    if (currentLevel < LEVELS.length - 1) {
      startLevel(currentLevel + 1);
    } else {
      setGameState("MENU");
    }
  }, [currentLevel, startLevel]);

  const moveSnake = useCallback(() => {
    if (gameState !== "PLAYING") return;

    setDirection(nextDirection);

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      // Apply movement
      switch (nextDirection) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Handle wall wrapping or collision
      if (level.allowWallWrap) {
        head.x =
          head.x < 0
            ? level.gridSize - 1
            : head.x >= level.gridSize
              ? 0
              : head.x;
        head.y =
          head.y < 0
            ? level.gridSize - 1
            : head.y >= level.gridSize
              ? 0
              : head.y;
      } else {
        // Check wall collision for non-wrapping levels
        if (
          head.x < 0 ||
          head.x >= level.gridSize ||
          head.y < 0 ||
          head.y >= level.gridSize
        ) {
          setGameState("GAME_OVER");
          return currentSnake;
        }
      }

      // Check self collision
      if (
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameState("GAME_OVER");
        return currentSnake;
      }

      // Check obstacle collision
      if (
        level.obstacles.some(
          (obstacle) => obstacle.x === head.x && obstacle.y === head.y
        )
      ) {
        setGameState("GAME_OVER");
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        const baseScore = 10;
        const levelBonus = level.id * 2;
        const speedBonus = Math.max(0, Math.floor((200 - level.speed) / 10));
        const newScore = gameStats.score + baseScore + levelBonus + speedBonus;
        const newFoodEaten = gameStats.foodEaten + 1;

        setGameStats((prev) => ({
          ...prev,
          score: newScore,
          foodEaten: newFoodEaten,
        }));

        if (newFoodEaten >= level.foodTarget) {
          setGameState("LEVEL_COMPLETE");
        } else {
          setFood(generateFood());
        }
      } else {
        newSnake.pop();
      }

      // Increment moves counter
      setGameStats((prev) => ({ ...prev, moves: prev.moves + 1 }));

      return newSnake;
    });
  }, [nextDirection, food, gameState, level, gameStats, generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();

      if (gameState === "PLAYING") {
        switch (e.key) {
          case "ArrowUp":
          case "w":
          case "W":
            setNextDirection((prev) => (prev !== "DOWN" ? "UP" : prev));
            break;
          case "ArrowDown":
          case "s":
          case "S":
            setNextDirection((prev) => (prev !== "UP" ? "DOWN" : prev));
            break;
          case "ArrowLeft":
          case "a":
          case "A":
            setNextDirection((prev) => (prev !== "RIGHT" ? "LEFT" : prev));
            break;
          case "ArrowRight":
          case "d":
          case "D":
            setNextDirection((prev) => (prev !== "LEFT" ? "RIGHT" : prev));
            break;
          case " ":
            setGameState("PAUSED");
            break;
          case "Escape":
            setGameState("MENU");
            break;
        }
      } else if (gameState === "PAUSED") {
        if (e.key === " ") {
          setGameState("PLAYING");
        } else if (e.key === "Escape") {
          setGameState("MENU");
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState === "PLAYING") {
      gameLoopRef.current = setInterval(moveSnake, level.speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveSnake, gameState, level.speed]);

  // Initialize food when level changes
  useEffect(() => {
    if (gameState === "PLAYING") {
      setFood(generateFood());
    }
  }, [currentLevel, gameState]);

  if (gameState === "MENU") {
    return (
      <LevelSelector
        levels={LEVELS}
        onSelectLevel={startLevel}
        completedLevels={completedLevels}
        nokiaMode={settings.nokiaMode}
        onToggleNokiaMode={() =>
          setSettings((prev) => ({ ...prev, nokiaMode: !prev.nokiaMode }))
        }
      />
    );
  }

  if (gameState === "LOADING") {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          settings.nokiaMode
            ? "bg-gradient-to-br from-green-900 to-black"
            : "bg-gradient-to-br from-slate-50 to-slate-100"
        }`}
      >
        <Card
          className={
            settings.nokiaMode
              ? "bg-green-800 text-green-100"
              : "w-full max-w-md"
          }
        >
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 ${
                settings.nokiaMode ? "border-green-400" : "border-indigo-600"
              }`}
            ></div>
            <p
              className={`text-lg font-semibold ${settings.nokiaMode ? "text-green-200" : "text-slate-700"}`}
            >
              Loading {level.name}...
            </p>
            <p
              className={`text-sm mt-2 ${settings.nokiaMode ? "text-green-300" : "text-slate-500"}`}
            >
              {level.description}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 ${
        settings.nokiaMode
          ? "bg-gradient-to-br from-green-900 to-black"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className={`text-lg px-4 py-2 shadow-sm ${
                settings.nokiaMode
                  ? "bg-green-800 text-green-100 border-green-600"
                  : "bg-white"
              }`}
            >
              Level {level.id}
            </Badge>
            <div>
              <h1
                className={`text-2xl md:text-3xl font-bold ${settings.nokiaMode ? "text-green-200" : "text-slate-800"}`}
              >
                {level.name}
              </h1>
              <p
                className={
                  settings.nokiaMode ? "text-green-300" : "text-slate-600"
                }
              >
                {level.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  soundEnabled: !prev.soundEnabled,
                }))
              }
              variant="outline"
              size="sm"
              className={
                settings.nokiaMode
                  ? "bg-green-800 text-green-100 border-green-600 hover:bg-green-700"
                  : "bg-white shadow-sm"
              }
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={() =>
                setSettings((prev) => ({ ...prev, showGrid: !prev.showGrid }))
              }
              variant="outline"
              size="sm"
              className={
                settings.nokiaMode
                  ? "bg-green-800 text-green-100 border-green-600 hover:bg-green-700"
                  : "bg-white shadow-sm"
              }
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setGameState("MENU")}
              variant="outline"
              size="sm"
              className={
                settings.nokiaMode
                  ? "bg-green-800 text-green-100 border-green-600 hover:bg-green-700"
                  : "bg-white shadow-sm"
              }
            >
              <Home className="w-4 h-4 mr-2" />
              Menu
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="mb-6">
          <GameStatsPanel
            stats={gameStats}
            level={level}
            formatTime={formatTime}
          />
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <GameBoard
            level={level}
            snake={snake}
            food={food}
            gameState={gameState}
            settings={settings}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {gameState === "PLAYING" && (
            <Button
              onClick={() => setGameState("PAUSED")}
              className={`flex items-center gap-2 shadow-lg ${
                settings.nokiaMode
                  ? "bg-green-600 hover:bg-green-500 text-green-100"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          {gameState === "PAUSED" && (
            <Button
              onClick={() => setGameState("PLAYING")}
              className={`flex items-center gap-2 shadow-lg ${
                settings.nokiaMode
                  ? "bg-green-600 hover:bg-green-500 text-green-100"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              }`}
            >
              <Play className="w-4 h-4" />
              Resume
            </Button>
          )}
          <Button
            onClick={() => {
              resetGame();
              setGameState("PLAYING");
            }}
            variant="outline"
            className={`flex items-center gap-2 shadow-lg ${
              settings.nokiaMode
                ? "bg-green-800 text-green-100 border-green-600 hover:bg-green-700"
                : "bg-white hover:bg-slate-50"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        </div>

        {/* Game Over Modal */}
        {gameState === "GAME_OVER" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card
              className={`w-full max-w-md transform animate-in zoom-in-95 duration-200 ${
                settings.nokiaMode
                  ? "bg-green-800 text-green-100 border-green-600"
                  : ""
              }`}
            >
              <CardHeader className="text-center">
                <CardTitle
                  className={`text-3xl mb-2 ${settings.nokiaMode ? "text-red-400" : "text-red-600"}`}
                >
                  Game Over!
                </CardTitle>
                <div className="space-y-2">
                  <p
                    className={`text-xl font-semibold ${settings.nokiaMode ? "text-green-200" : "text-slate-700"}`}
                  >
                    Final Score: {gameStats.score}
                  </p>
                  <p
                    className={
                      settings.nokiaMode ? "text-green-300" : "text-slate-600"
                    }
                  >
                    Time: {formatTime(gameStats.timeElapsed)}
                  </p>
                  <p
                    className={
                      settings.nokiaMode ? "text-green-300" : "text-slate-600"
                    }
                  >
                    Moves: {gameStats.moves}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button
                  onClick={() => {
                    resetGame();
                    setGameState("PLAYING");
                  }}
                  className={`flex-1 ${
                    settings.nokiaMode
                      ? "bg-green-600 hover:bg-green-500 text-green-100"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => setGameState("MENU")}
                  variant="outline"
                  className={`flex-1 ${settings.nokiaMode ? "border-green-600 text-green-200 hover:bg-green-700" : ""}`}
                >
                  Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Level Complete Modal */}
        {gameState === "LEVEL_COMPLETE" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card
              className={`w-full max-w-md transform animate-in zoom-in-95 duration-200 ${
                settings.nokiaMode
                  ? "bg-green-800 text-green-100 border-green-600"
                  : ""
              }`}
            >
              <CardHeader className="text-center">
                <CardTitle
                  className={`text-3xl flex items-center justify-center gap-2 mb-2 ${
                    settings.nokiaMode ? "text-yellow-400" : "text-green-600"
                  }`}
                >
                  <Trophy className="w-8 h-8" />
                  Level Complete!
                </CardTitle>
                <div className="space-y-2">
                  <p
                    className={`text-xl font-semibold ${settings.nokiaMode ? "text-green-200" : "text-slate-700"}`}
                  >
                    Score: {gameStats.score}
                  </p>
                  <p
                    className={
                      settings.nokiaMode ? "text-green-300" : "text-slate-600"
                    }
                  >
                    Time: {formatTime(gameStats.timeElapsed)}
                  </p>
                  <p
                    className={
                      settings.nokiaMode ? "text-green-300" : "text-slate-600"
                    }
                  >
                    Moves: {gameStats.moves}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex gap-3">
                {currentLevel < LEVELS.length - 1 ? (
                  <Button
                    onClick={nextLevel}
                    className={`flex-1 ${
                      settings.nokiaMode
                        ? "bg-green-600 hover:bg-green-500 text-green-100"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    }`}
                  >
                    Next Level
                  </Button>
                ) : (
                  <Button
                    onClick={() => setGameState("MENU")}
                    className={`flex-1 ${
                      settings.nokiaMode
                        ? "bg-purple-600 hover:bg-purple-500 text-purple-100"
                        : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    }`}
                  >
                    🎉 Game Complete!
                  </Button>
                )}
                <Button
                  onClick={() => setGameState("MENU")}
                  variant="outline"
                  className={`flex-1 ${settings.nokiaMode ? "border-green-600 text-green-200 hover:bg-green-700" : ""}`}
                >
                  Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
