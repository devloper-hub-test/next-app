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

interface GameOverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  won: boolean;
  winnerName: string;
  children: ReactNode; // action buttons
}

/** Pop-up shown when someone gets all four tokens home */
export function GameOverDialog({ open, onOpenChange, won, winnerName, children }: GameOverDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center sm:max-w-sm">
        <DialogHeader className="items-center space-y-3 sm:text-center">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full text-5xl",
              won ? "animate-bounce bg-yellow-100 dark:bg-yellow-900/40" : "bg-muted"
            )}
            aria-hidden
          >
            {won ? "🏆" : "🎲"}
          </div>
          <DialogTitle className={cn("text-3xl font-bold", won && "text-emerald-600 dark:text-emerald-400")}>
            {won ? "You win! 🎉" : `${winnerName} wins`}
          </DialogTitle>
          <DialogDescription className="text-base">
            {won ? "All four of your tokens made it home first." : `${winnerName} got all four tokens home first.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">{children}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
