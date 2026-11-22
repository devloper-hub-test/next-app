// lib/ludo-rules.ts
// Pure Ludo rules shared by the solo game (in the browser) and online rooms (on the server).
// Every function returns a new game instead of changing the one it's given.
import { BOARD_COLORS, type BoardSize, type BotLevel, type LudoColor, type LudoGame } from "../types/ludo";

export const BASE = -1;

// Every arm adds 13 squares to the shared loop: up one side, across the tip, and back down
const SQUARES_PER_ARM = 13;

export const trackLength = (arms: BoardSize): number => arms * SQUARES_PER_ARM;
/** Progress on the last shared-track square, just before a token turns into its home column */
export const lastTrack = (arms: BoardSize): number => trackLength(arms) - 2;
/** Progress of a token that has reached home: five home-column squares after the last track square */
export const homeOf = (arms: BoardSize): number => lastTrack(arms) + 6;

/** Where a colour joins the shared track, as an index into the loop */
export const startSquare = (arms: BoardSize, color: LudoColor): number =>
  SQUARES_PER_ARM * BOARD_COLORS[arms].indexOf(color);

// Start squares and the star squares eight steps after them: nobody can be captured here
export const isSafeSquare = (square: number): boolean =>
  square % SQUARES_PER_ARM === 0 || square % SQUARES_PER_ARM === 8;

/** Index on the shared loop for a token on the track, or null in the base, home column or home */
export const trackSquare = (arms: BoardSize, color: LudoColor, progress: number): number | null =>
  progress >= 0 && progress <= lastTrack(arms) ? (startSquare(arms, color) + progress) % trackLength(arms) : null;

/** Where a token ends up after rolling `value`, or null if it can't move */
export const targetOf = (arms: BoardSize, progress: number, value: number): number | null => {
  if (progress === BASE) return value === 6 ? 0 : null;
  const target = progress + value;
  return target <= homeOf(arms) ? target : null; // finishing needs an exact roll
};

const inBase = (): number[] => [BASE, BASE, BASE, BASE];

export const newLudoGame = (players: LudoColor[], firstTurn?: LudoColor, arms: BoardSize = 4): LudoGame => {
  const ordered = BOARD_COLORS[arms].filter((color) => players.includes(color));
  if (ordered.length !== players.length) throw new Error("Those colours aren't all on this board");
  if (ordered.length < 2) throw new Error("Ludo needs at least two players");
  return {
    arms,
    players: ordered,
    tokens: {
      red: inBase(),
      green: inBase(),
      yellow: inBase(),
      blue: inBase(),
      orange: inBase(),
      purple: inBase(),
    },
    turn: firstTurn && ordered.includes(firstTurn) ? firstTurn : ordered[0],
    phase: "roll",
    roll: null,
    rolls: 0,
    sixes: 0,
    lastMove: null,
    note: null,
    status: "playing",
    winner: null,
  };
};

const nextPlayer = (game: LudoGame, after: LudoColor = game.turn): LudoColor => {
  // `after` may have just left the game, so walk the full colour circle
  const circle = BOARD_COLORS[game.arms];
  const start = circle.indexOf(after);
  for (let step = 1; step <= circle.length; step++) {
    const color = circle[(start + step) % circle.length];
    if (game.players.includes(color)) return color;
  }
  return game.players[0];
};

const passTurn = (game: LudoGame): LudoGame => ({ ...game, turn: nextPlayer(game), phase: "roll", sixes: 0 });

/** Tokens the current player may move with the current roll */
export const legalTokens = (game: LudoGame): number[] => {
  if (game.status !== "playing" || game.phase !== "move" || !game.roll) return [];
  const value = game.roll.value;
  return game.tokens[game.turn].flatMap((progress, index) =>
    targetOf(game.arms, progress, value) === null ? [] : [index]
  );
};

/** Records a die roll for the current player. Passes the turn if no token can move. */
export const applyRoll = (game: LudoGame, value: number): LudoGame => {
  if (game.status !== "playing" || game.phase !== "roll") throw new Error("Not time to roll");
  if (!Number.isInteger(value) || value < 1 || value > 6) throw new Error("A die shows 1 to 6");

  const color = game.turn;
  const rolled: LudoGame = {
    ...game,
    roll: { color, value },
    rolls: game.rolls + 1,
    sixes: value === 6 ? game.sixes + 1 : game.sixes,
    phase: "move",
    note: null,
  };
  if (rolled.sixes === 3) return { ...passTurn(rolled), note: { kind: "three-sixes", color } };
  if (legalTokens(rolled).length === 0) return { ...passTurn(rolled), note: { kind: "no-move", color, value } };
  return rolled;
};

/** Moves one of the current player's tokens by the current roll */
export const applyMove = (game: LudoGame, token: number): LudoGame => {
  if (!legalTokens(game).includes(token) || !game.roll) throw new Error("That token can't move");

  const color = game.turn;
  const from = game.tokens[color][token];
  const to = targetOf(game.arms, from, game.roll.value) as number;
  const tokens = { ...game.tokens, [color]: game.tokens[color].map((p, i) => (i === token ? to : p)) };

  // Landing on opponents sends them back to their base, except on safe squares
  const victims: LudoColor[] = [];
  const square = trackSquare(game.arms, color, to);
  if (square !== null && !isSafeSquare(square)) {
    for (const other of game.players) {
      if (other === color) continue;
      tokens[other] = tokens[other].map((progress) => {
        if (trackSquare(game.arms, other, progress) !== square) return progress;
        victims.push(other);
        return BASE;
      });
    }
  }

  const moved: LudoGame = { ...game, tokens, lastMove: { color, token, from, to }, note: null };
  if (tokens[color].every((progress) => progress === homeOf(game.arms))) {
    return { ...moved, status: "finished", winner: color, note: { kind: "home", color } };
  }

  let note: LudoGame["note"] = null;
  if (victims.length) note = { kind: "capture", color, victims: victims.filter((v, i) => victims.indexOf(v) === i) };
  else if (to === homeOf(game.arms)) note = { kind: "home", color };

  // A six, a capture or getting a token home earns another roll
  if (game.roll.value === 6 || note) return { ...moved, phase: "roll", note };
  return { ...passTurn(moved), note };
};

/** Takes a player out of the game (they left). The last one standing wins. */
export const removePlayer = (game: LudoGame, color: LudoColor): LudoGame => {
  if (!game.players.includes(color) || game.status !== "playing") return game;
  const players = game.players.filter((p) => p !== color);
  const left: LudoGame = { ...game, players };
  if (players.length === 1) return { ...left, status: "finished", winner: players[0] };
  return game.turn === color ? { ...left, turn: nextPlayer(left, color), phase: "roll", sixes: 0 } : left;
};

/** Legal tokens that would actually lead somewhere different (four tokens in the base are one choice) */
export const distinctChoices = (game: LudoGame): number[] => {
  const seen = new Set<number>();
  return legalTokens(game).filter((token) => {
    const progress = game.tokens[game.turn][token];
    if (seen.has(progress)) return false;
    seen.add(progress);
    return true;
  });
};

// How many opponent tokens sit 1–6 squares behind `square`, able to land on it next roll
const threatsTo = (game: LudoGame, color: LudoColor, square: number): number => {
  let threats = 0;
  for (const other of game.players) {
    if (other === color) continue;
    for (const progress of game.tokens[other]) {
      const from = trackSquare(game.arms, other, progress);
      if (from === null) continue;
      const distance = (square - from + trackLength(game.arms)) % trackLength(game.arms);
      if (distance >= 1 && distance <= 6 && progress + distance <= lastTrack(game.arms)) threats++;
    }
  }
  return threats;
};

const scoreMove = (game: LudoGame, token: number): number => {
  const color = game.turn;
  const from = game.tokens[color][token];
  const { arms } = game;
  const to = targetOf(arms, from, game.roll?.value ?? 0) as number;
  const fromSquare = trackSquare(arms, color, from);
  const toSquare = trackSquare(arms, color, to);
  let score = to * 0.2; // all else equal, push the leading token

  if (to === homeOf(arms)) score += 100;
  if (from === BASE) score += 40;
  if (from <= lastTrack(arms) && to > lastTrack(arms)) score += 30; // into the home column, safe for good
  if (toSquare !== null) {
    if (isSafeSquare(toSquare)) {
      score += 15;
    } else {
      for (const other of game.players) {
        if (other === color) continue;
        for (const progress of game.tokens[other]) {
          if (trackSquare(arms, other, progress) === toSquare) score += 50 + progress; // capture, the further along the better
        }
      }
      score -= 25 * threatsTo(game, color, toSquare);
    }
  }
  if (fromSquare !== null && !isSafeSquare(fromSquare)) score += 20 * threatsTo(game, color, fromSquare); // escape
  return score;
};

const MISTAKE_CHANCE: Record<BotLevel, number> = { easy: 1, medium: 0.35, hard: 0 };

/** Picks a token for a computer player. Easy moves at random; hard always takes the best-looking move. */
export const chooseBotToken = (game: LudoGame, level: BotLevel, random: () => number = Math.random): number => {
  const options = legalTokens(game);
  if (options.length === 0) throw new Error("No legal moves");
  if (random() < MISTAKE_CHANCE[level]) return options[Math.floor(random() * options.length)];
  return options.reduce((best, token) => (scoreMove(game, token) > scoreMove(game, best) ? token : best));
};

export const rollDie = (random: () => number = Math.random): number => Math.floor(random() * 6) + 1;
