"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { cn } from "../../../lib/utils";
import { colorName } from "../../../lib/chess-rules";
import type { ChessResult, Color } from "../../../types/chess";

const REASON_DETAIL: Record<ChessResult["reason"], string> = {
  checkmate: "Checkmate!",
  resignation: "Won by resignation.",
  abandoned: "Your opponent left the game.",
  stalemate: "Stalemate: no legal moves, but the king isn't in check.",
  threefold: "The same position appeared three times.",
  insufficient: "Neither side has enough pieces left to checkmate.",
  "fifty-move": "50 moves passed with no capture or pawn move.",
};

interface GameOverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ChessResult;
  myColor: Color;
  moveCount: number;
  opponentName: string; // e.g. "the computer (Hard)" or "your opponent"
  children: ReactNode; // action buttons
}

/** Pop-up shown when a game ends: win, loss or draw, and why */
export function GameOverDialog({
  open,
  onOpenChange,
  result,
  myColor,
  moveCount,
  opponentName,
  children,
}: GameOverDialogProps) {
  const outcome = !result.winner ? "draw" : result.winner === myColor ? "win" : "loss";
  const fullMoves = Math.ceil(moveCount / 2);

  const title = { win: "You win! 🎉", loss: "You lost", draw: "It's a draw" }[outcome];
  const icon = { win: "🏆", loss: "😔", draw: "🤝" }[outcome];
  let detail = REASON_DETAIL[result.reason];
  if (result.reason === "resignation") {
    detail = outcome === "win" ? `${opponentName} resigned.` : "You resigned.";
  } else if (result.reason === "checkmate" && result.winner) {
    detail = `Checkmate! ${colorName(result.winner)} wins against ${outcome === "win" ? opponentName : "you"}.`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center sm:max-w-sm">
        <DialogHeader className="items-center space-y-3 sm:text-center">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full text-5xl",
              outcome === "win" && "animate-bounce bg-yellow-100 dark:bg-yellow-900/40",
              outcome === "loss" && "bg-red-100 dark:bg-red-900/40",
              outcome === "draw" && "bg-sky-100 dark:bg-sky-900/40"
            )}
            aria-hidden
          >
            {icon}
          </div>
          <DialogTitle
            className={cn(
              "text-3xl font-bold",
              outcome === "win" && "text-emerald-600 dark:text-emerald-400",
              outcome === "loss" && "text-red-600 dark:text-red-400"
            )}
          >
            {title}
          </DialogTitle>
          <DialogDescription className="text-base">{detail}</DialogDescription>
          <p className="text-sm text-muted-foreground">
            You played {myColor === "w" ? "White" : "Black"} · {fullMoves} move{fullMoves === 1 ? "" : "s"}
          </p>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">{children}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
