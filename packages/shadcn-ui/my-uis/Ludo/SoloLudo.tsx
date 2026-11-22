"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  applyMove,
  applyRoll,
  chooseBotToken,
  distinctChoices,
  legalTokens,
  newLudoGame,
  rollDie,
} from "../../lib/ludo-rules";
import { LUDO_COLOR_NAMES, type BoardSize, type BotLevel, type LudoColor, type LudoGame } from "../../types/ludo";
import { BOARD_COLUMN_STYLE, LudoBoard } from "./components/ludo-board";
import { DIE_SETTLE_MS, Die, PlayerList, TurnBanner, describeNote } from "./components/ludo-hud";
import { GameOverDialog } from "./components/game-over-dialog";

export interface SoloRecord {
  wins: number;
  games: number;
}

interface SoloLudoProps {
  you: LudoColor;
  opponents: LudoColor[];
  arms: BoardSize;
  level: BotLevel;
  onExit: () => void;
  onGameOver: (level: BotLevel, won: boolean) => void;
}

const BOT_ROLL_MS = 1300; // lets the last roll land and the last token finish walking
const AUTO_MOVE_MS = 350; // pause before playing your only possible move

export default function SoloLudo({ you, opponents, arms, level, onExit, onGameOver }: SoloLudoProps) {
  const colors = [you, ...opponents];
  const newGame = () => newLudoGame(colors, you, arms);
  const [game, setGame] = useState<LudoGame>(newGame);
  const [showResult, setShowResult] = useState(false);
  const reported = useRef(false);

  const name = (color: LudoColor) => (color === you ? "You" : `${LUDO_COLOR_NAMES[color]} bot`);
  const myTurn = game.status === "playing" && game.turn === you;
  const movable = myTurn ? legalTokens(game) : [];

  // Computer players roll, wait for the die to settle, then move
  useEffect(() => {
    if (game.status !== "playing" || game.turn === you) return;
    const timer = setTimeout(
      () => setGame((g) => (g.phase === "roll" ? applyRoll(g, rollDie()) : applyMove(g, chooseBotToken(g, level)))),
      game.phase === "roll" ? BOT_ROLL_MS : DIE_SETTLE_MS + 250
    );
    return () => clearTimeout(timer);
  }, [game, you, level]);

  // Play your move for you when there's only one real choice
  useEffect(() => {
    if (!myTurn || game.phase !== "move") return;
    const choices = distinctChoices(game);
    if (choices.length !== 1) return;
    const timer = setTimeout(() => setGame((g) => applyMove(g, choices[0])), DIE_SETTLE_MS + AUTO_MOVE_MS);
    return () => clearTimeout(timer);
  }, [game, myTurn]);

  // Report the result once, then pop it up after the last token has walked home
  useEffect(() => {
    if (game.status !== "finished" || reported.current) return;
    reported.current = true;
    onGameOver(level, game.winner === you);
    const timer = setTimeout(() => setShowResult(true), 900);
    return () => clearTimeout(timer);
  }, [game.status, game.winner, level, you, onGameOver]);

  const roll = () => {
    if (myTurn && game.phase === "roll") setGame((g) => applyRoll(g, rollDie()));
  };

  // Space bar rolls the die too
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      roll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const restart = () => {
    reported.current = false;
    setShowResult(false);
    setGame(newGame());
  };

  const status =
    game.status === "finished" && game.winner
      ? game.winner === you
        ? "You win! 🎉"
        : `${name(game.winner)} wins`
      : `${name(game.turn)} is playing…`;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
      <div className="mx-auto w-full" style={BOARD_COLUMN_STYLE}>
        <LudoBoard
          game={game}
          movable={game.phase === "move" ? movable : []}
          onTokenClick={(token) =>
            setGame((g) => (g.turn === you && legalTokens(g).includes(token) ? applyMove(g, token) : g))
          }
          perspective={you}
          label={name}
          center={
            <Die
              value={game.roll?.value ?? null}
              rollId={game.rolls}
              color={game.turn}
              rolledBy={game.roll?.color ?? null}
              canRoll={myTurn && game.phase === "roll"}
              onRoll={roll}
            />
          }
        />
      </div>

      <aside className="flex flex-col gap-3">
        <TurnBanner
          color={game.status === "finished" && game.winner ? game.winner : game.turn}
          mine={myTurn}
          title={myTurn ? "Your turn" : status}
          subtitle={
            myTurn
              ? game.phase === "roll"
                ? "Tap the die to roll"
                : `You rolled a ${game.roll?.value}. Tap a glowing token.`
              : describeNote(game.note, name)
          }
        />

        <div className="rounded-xl border bg-card p-2 text-card-foreground">
          <PlayerList game={game} colors={game.players} name={name} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (game.status === "finished" || window.confirm("Start a new game? This one will be lost.")) restart();
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> New game
          </Button>
          <Button variant="outline" onClick={onExit}>
            Quit
          </Button>
        </div>
      </aside>

      {game.winner && (
        <GameOverDialog
          open={showResult}
          onOpenChange={setShowResult}
          won={game.winner === you}
          winnerName={name(game.winner)}
        >
          <Button className="w-full" onClick={restart}>
            <RotateCcw className="mr-2 h-4 w-4" /> Play again
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setShowResult(false)}>
            Look at the board
          </Button>
          <Button variant="ghost" className="w-full" onClick={onExit}>
            Back to menu
          </Button>
        </GameOverDialog>
      )}
    </div>
  );
}
