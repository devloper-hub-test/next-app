import type { Position, Level, GameSettings } from "../../../types/snake-game";

interface GameBoardProps {
  level: Level;
  snake: Position[];
  food: Position;
  gameState: string;
  settings: GameSettings;
}

export function GameBoard({
  level,
  snake,
  food,
  gameState,
  settings,
}: GameBoardProps) {
  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake
      .slice(1)
      .some((segment) => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;
    const isObstacle = level.obstacles.some(
      (obstacle) => obstacle.x === x && obstacle.y === y
    );

    if (settings.nokiaMode) {
      // Nokia-style rendering
      let cellClass = "relative w-4 h-4 border transition-all duration-100 ";

      if (isSnakeHead) {
        cellClass += "bg-green-400 border-green-500";
      } else if (isSnakeBody) {
        cellClass += "bg-green-500 border-green-600";
      } else if (isFood) {
        cellClass += "bg-yellow-400 border-yellow-500 animate-pulse";
      } else if (isObstacle) {
        cellClass += "bg-gray-800 border-gray-900";
      } else {
        cellClass += settings.showGrid
          ? "bg-green-900 border-green-800"
          : "bg-green-900 border-green-900";
      }

      return <div key={`${x}-${y}`} className={cellClass} />;
    } else {
      // Modern style rendering
      let cellClass =
        "relative w-5 h-5 transition-all duration-150 ease-in-out ";

      if (isSnakeHead) {
        cellClass += `bg-gradient-to-br from-${level.color}-400 to-${level.color}-600 rounded-lg shadow-lg transform scale-110 animate-pulse`;
      } else if (isSnakeBody) {
        cellClass += `bg-gradient-to-br from-${level.color}-300 to-${level.color}-500 rounded-md shadow-md`;
      } else if (isFood) {
        cellClass +=
          "bg-gradient-to-br from-rose-400 to-rose-600 rounded-full shadow-lg animate-bounce";
      } else if (isObstacle) {
        cellClass +=
          "bg-gradient-to-br from-slate-600 to-slate-800 rounded-md shadow-lg";
      } else {
        cellClass += settings.showGrid
          ? "bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-sm border border-slate-200"
          : "bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-sm";
      }

      return (
        <div key={`${x}-${y}`} className={cellClass}>
          {isFood && !settings.nokiaMode && (
            <div className="absolute inset-0 bg-rose-300 rounded-full animate-ping opacity-75" />
          )}
          {isSnakeHead && !settings.nokiaMode && (
            <div className="absolute inset-1 bg-white rounded-full opacity-30" />
          )}
        </div>
      );
    }
  };

  return (
    <div className="relative">
      <div
        className={`grid gap-0 mx-auto rounded-2xl p-4 shadow-2xl transition-all duration-300 ${
          settings.nokiaMode
            ? `bg-black border-4 border-green-600 ${gameState === "GAME_OVER" ? "animate-pulse border-red-500" : ""}`
            : `border-4 border-slate-200 bg-gradient-to-br from-white to-slate-50 ${gameState === "GAME_OVER" ? "animate-pulse border-red-300" : ""}`
        }`}
        style={{
          gridTemplateColumns: `repeat(${level.gridSize}, minmax(0, 1fr))`,
          width: "fit-content",
        }}
      >
        {Array.from({ length: level.gridSize }, (_, y) =>
          Array.from({ length: level.gridSize }, (_, x) => renderCell(x, y))
        )}
      </div>

      {level.allowWallWrap && (
        <div
          className={`text-center mt-2 text-sm ${settings.nokiaMode ? "text-green-400" : "text-slate-500"}`}
        >
          🔄 Wall Wrap Enabled
        </div>
      )}
    </div>
  );
}
