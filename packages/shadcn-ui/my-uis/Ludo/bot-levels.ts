import type { BotLevel } from "../../types/ludo";

export const BOT_LEVELS: Record<BotLevel, { name: string; emoji: string; description: string }> = {
  easy: {
    name: "Lucky Dip",
    emoji: "🐣",
    description: "Moves whatever token it grabs first.",
  },
  medium: {
    name: "Weekend Player",
    emoji: "🎲",
    description: "Plays sensibly, but slips up now and then.",
  },
  hard: {
    name: "Board Shark",
    emoji: "🦈",
    description: "Hunts your tokens and never misses a capture.",
  },
};
