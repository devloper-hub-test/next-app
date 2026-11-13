// Pure typing-session logic: score, streaks, accuracy and speed. No React here.

export interface TypingSession {
  text: string;
  index: number; // next character to type
  missedAt: number[]; // positions where a wrong key was pressed
  correct: number;
  errors: number;
  streak: number;
  bestStreak: number;
  score: number;
  startedAt: number | null;
  finishedAt: number | null;
  missedKeys: Record<string, number>; // expected character -> times missed
  errorPulse: number; // bumps on every mistake, to trigger a shake animation
}

export type TypingAction =
  | { type: "RESET"; text: string }
  | { type: "KEY"; key: string; at: number }
  | { type: "FINISH"; at: number };

export const newSession = (text: string): TypingSession => ({
  text,
  index: 0,
  missedAt: [],
  correct: 0,
  errors: 0,
  streak: 0,
  bestStreak: 0,
  score: 0,
  startedAt: null,
  finishedAt: null,
  missedKeys: {},
  errorPulse: 0,
});

// Every 10 correct keys in a row raises the multiplier, up to x5
export const multiplier = (streak: number) => Math.min(5, 1 + Math.floor(streak / 10));

export const POINTS_PER_KEY = 10;

export function typingReducer(state: TypingSession, action: TypingAction): TypingSession {
  switch (action.type) {
    case "RESET":
      return newSession(action.text);

    case "FINISH":
      return state.finishedAt || !state.startedAt ? state : { ...state, finishedAt: action.at };

    case "KEY": {
      if (state.finishedAt) return state;
      const startedAt = state.startedAt ?? action.at;
      const expected = state.text[state.index];

      if (action.key === expected) {
        const streak = state.streak + 1;
        const index = state.index + 1;
        return {
          ...state,
          startedAt,
          index,
          correct: state.correct + 1,
          streak,
          bestStreak: Math.max(state.bestStreak, streak),
          score: state.score + POINTS_PER_KEY * multiplier(streak),
          finishedAt: index >= state.text.length ? action.at : null,
        };
      }

      // Wrong key: the cursor stays put until the right key is pressed
      return {
        ...state,
        startedAt,
        errors: state.errors + 1,
        streak: 0,
        missedAt: state.missedAt.includes(state.index)
          ? state.missedAt
          : [...state.missedAt, state.index],
        missedKeys: { ...state.missedKeys, [expected]: (state.missedKeys[expected] ?? 0) + 1 },
        errorPulse: state.errorPulse + 1,
      };
    }
  }
}

const elapsedMinutes = (s: TypingSession, now: number) =>
  s.startedAt ? Math.max(((s.finishedAt ?? now) - s.startedAt) / 60000, 1 / 60) : 0;

// Words per minute, using the standard "5 characters = 1 word"
export const wordsPerMinute = (s: TypingSession, now: number) => {
  const minutes = elapsedMinutes(s, now);
  return minutes ? Math.round(s.index / 5 / minutes) : 0;
};

export const accuracy = (s: TypingSession) =>
  s.correct + s.errors === 0 ? 100 : Math.round((s.correct / (s.correct + s.errors)) * 100);

// 1 star for finishing, more for speed and accuracy
export const starsFor = (wpm: number, acc: number) =>
  acc >= 97 && wpm >= 40 ? 3 : acc >= 92 && wpm >= 25 ? 2 : 1;
