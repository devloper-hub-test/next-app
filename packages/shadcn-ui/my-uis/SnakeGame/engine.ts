// Pure Snake game logic: no React, no timers, so it's easy to reason about and test.
import type {
  Direction,
  Level,
  Position,
  SnakeState,
} from "../../types/snake-game";
import { LEVELS } from "./levels";

export type SnakeAction =
  | { type: "START_LEVEL"; levelIndex: number }
  | { type: "TURN"; direction: Direction }
  | { type: "TICK" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "MENU" };

const OPPOSITE: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

const DELTA: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const MAX_QUEUED_TURNS = 3;
const START_LENGTH = 3;

export const cellKey = ({ x, y }: Position) => `${x},${y}`;

const samePosition = (a: Position, b: Position) => a.x === b.x && a.y === b.y;

const obstacleKeys = (level: Level) => new Set(level.obstacles.map(cellKey));

// Next cell in a direction; null means the snake hit a solid wall
const step = (pos: Position, direction: Direction, level: Level): Position | null => {
  const next = { x: pos.x + DELTA[direction].x, y: pos.y + DELTA[direction].y };
  const n = level.gridSize;
  if (level.allowWallWrap) {
    return { x: (next.x + n) % n, y: (next.y + n) % n };
  }
  return next.x < 0 || next.y < 0 || next.x >= n || next.y >= n ? null : next;
};

// Picks a start spot nearest the centre where the snake fits and has room to move right
const startingSnake = (level: Level): Position[] => {
  const blocked = obstacleKeys(level);
  const n = level.gridSize;
  const centre = Math.floor(n / 2);
  const cells: Position[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) cells.push({ x, y });
  }
  cells.sort(
    (a, b) =>
      Math.abs(a.x - centre) + Math.abs(a.y - centre) -
      (Math.abs(b.x - centre) + Math.abs(b.y - centre))
  );

  const runway = 4; // free cells ahead of the head
  const fits = ({ x, y }: Position) => {
    for (let dx = -(START_LENGTH - 1); dx <= runway; dx++) {
      const cx = x + dx;
      if (cx < 0 || cx >= n || blocked.has(cellKey({ x: cx, y }))) return false;
    }
    return true;
  };

  const head = cells.find(fits) ?? { x: centre, y: centre };
  return Array.from({ length: START_LENGTH }, (_, i) => ({ x: head.x - i, y: head.y }));
};

// Random free cell the snake can actually reach (never sealed off behind walls)
export const placeFood = (level: Level, snake: Position[]): Position | null => {
  const blocked = obstacleKeys(level);
  const occupied = new Set(snake.map(cellKey));
  const seen = new Set([cellKey(snake[0])]);
  const queue = [snake[0]];
  const free: Position[] = [];

  while (queue.length) {
    const cell = queue.shift()!;
    if (!occupied.has(cellKey(cell))) free.push(cell);
    for (const direction of Object.keys(DELTA) as Direction[]) {
      const next = step(cell, direction, level);
      if (!next) continue;
      const key = cellKey(next);
      if (seen.has(key) || blocked.has(key)) continue;
      seen.add(key);
      queue.push(next);
    }
  }

  return free.length ? free[Math.floor(Math.random() * free.length)] : null;
};

export const pointsForFood = (level: Level) =>
  10 + level.id * 2 + Math.max(0, Math.floor((200 - level.speed) / 10));

export const initialSnakeState = (levelIndex = 0): SnakeState => ({
  status: "MENU",
  levelIndex,
  snake: [],
  direction: "RIGHT",
  queuedTurns: [],
  food: null,
  score: 0,
  foodEaten: 0,
  moves: 0,
  crash: null,
});

const levelStart = (levelIndex: number): SnakeState => {
  const level = LEVELS[levelIndex];
  const snake = startingSnake(level);
  return {
    ...initialSnakeState(levelIndex),
    status: "READY",
    snake,
    food: placeFood(level, snake),
  };
};

const tick = (state: SnakeState): SnakeState => {
  const level = LEVELS[state.levelIndex];
  const [direction = state.direction, ...queuedTurns] = state.queuedTurns;
  const head = step(state.snake[0], direction, level);

  if (!head) {
    return { ...state, direction, queuedTurns: [], status: "GAME_OVER", crash: state.snake[0] };
  }

  const eating = state.food !== null && samePosition(head, state.food);
  // The tail moves out of the way this turn unless the snake is growing
  const body = eating ? state.snake : state.snake.slice(0, -1);
  if (
    body.some((segment) => samePosition(segment, head)) ||
    level.obstacles.some((obstacle) => samePosition(obstacle, head))
  ) {
    return { ...state, direction, queuedTurns: [], status: "GAME_OVER", crash: head };
  }

  const snake = [head, ...body];
  const moved = { ...state, snake, direction, queuedTurns, moves: state.moves + 1 };
  if (!eating) return moved;

  const foodEaten = state.foodEaten + 1;
  const food = foodEaten >= level.foodTarget ? null : placeFood(level, snake);
  return {
    ...moved,
    foodEaten,
    food,
    score: state.score + pointsForFood(level),
    status: food ? "PLAYING" : "LEVEL_COMPLETE",
  };
};

const turn = (state: SnakeState, direction: Direction): SnakeState => {
  if (state.status !== "READY" && state.status !== "PLAYING") return state;
  // Compare against the last queued turn, so quick double-taps can't reverse the snake
  const last = state.queuedTurns.at(-1) ?? state.direction;
  if (
    direction === last ||
    direction === OPPOSITE[last] ||
    state.queuedTurns.length >= MAX_QUEUED_TURNS
  ) {
    // The first key press still starts the game
    return state.status === "READY" ? { ...state, status: "PLAYING" } : state;
  }
  return { ...state, status: "PLAYING", queuedTurns: [...state.queuedTurns, direction] };
};

export const snakeReducer = (state: SnakeState, action: SnakeAction): SnakeState => {
  switch (action.type) {
    case "START_LEVEL":
      return levelStart(action.levelIndex);
    case "TURN":
      return turn(state, action.direction);
    case "TICK":
      return state.status === "PLAYING" ? tick(state) : state;
    case "PAUSE":
      return state.status === "PLAYING" ? { ...state, status: "PAUSED" } : state;
    case "RESUME":
      return state.status === "PAUSED" ? { ...state, status: "PLAYING" } : state;
    case "MENU":
      return initialSnakeState(state.levelIndex);
  }
};
