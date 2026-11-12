// Practice text comes from free packages: random-words (common English words)
// and txtgen (random, often silly, English sentences).
import { generate } from "random-words";
import { sentence } from "txtgen";

export type ModeId = "words" | "sentences" | "timed" | "weak";

export interface Mode {
  id: ModeId;
  title: string;
  description: string;
  seconds?: number; // timed modes end when the clock runs out
}

export const MODES: Mode[] = [
  {
    id: "words",
    title: "Easy words",
    description: "20 short, common lowercase words. A good warm-up.",
  },
  {
    id: "sentences",
    title: "Sentences",
    description: "Three random sentences with capitals and punctuation.",
  },
  {
    id: "timed",
    title: "60-second sprint",
    description: "Type as many words as you can before the clock runs out.",
    seconds: 60,
  },
];

// Keep only characters that exist on a standard keyboard
const clean = (text: string) =>
  text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const words = (count: number, maxLength: number) =>
  (generate({ exactly: count, maxLength }) as string[]).join(" ");

// Practice mode built from the letters a player misses most
export const weakKeysMode = (keys: string[]): Mode => ({
  id: "weak",
  title: "Practise weak keys",
  description: `Words packed with the letters you miss most: ${keys.join(" ").toUpperCase()}`,
});

// Words containing at least one of the given letters, topped up with normal words if needed
const wordsWith = (letters: string[], count: number) => {
  const pool = generate({ exactly: 3000, maxLength: 7 }) as string[];
  const matching = pool.filter((word) => letters.some((letter) => word.includes(letter)));
  return [...matching, ...pool].slice(0, count).sort(() => Math.random() - 0.5).join(" ");
};

export function makeText(mode: ModeId, weakKeys: string[] = []): string {
  switch (mode) {
    case "weak":
      return clean(wordsWith(weakKeys, 25));
    case "words":
      return clean(words(20, 6));
    case "sentences":
      return clean(Array.from({ length: 3 }, () => sentence()).join(" "));
    case "timed":
      return clean(words(200, 8));
  }
}
