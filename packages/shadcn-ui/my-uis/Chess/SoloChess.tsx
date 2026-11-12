"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { FlipVertical2, Flag, Lightbulb, Loader2, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { describeResult, gameResult } from "../../lib/chess-rules";
import { otherColor, type ChessResult, type Color } from "../../types/chess";
import { BOARD_COLUMN_STYLE, ChessBoard } from "./components/chess-board";
import { MoveList, CapturedPieces } from "./components/move-list";
import { GameOverDialog } from "./components/game-over-dialog";
import { DIFFICULTIES, useStockfish, type Difficulty } from "./use-stockfish";

export interface SoloRecord {
  wins: number;
  losses: number;
  draws: number;
}

interface SoloChessProps {
  difficulty: Difficulty;
  playerColor: Color;
  onExit: () => void;
  onGameOver: (difficulty: Difficulty, outcome: keyof SoloRecord) => void;
}

const MIN_THINK_MS = 450; // so instant replies on easy levels don't feel jarring

const uciToMove = (uci: string) => ({
  from: uci.slice(0, 2) as Square,
  to: uci.slice(2, 4) as Square,
  promotion: uci[4],
});

export default function SoloChess({ difficulty, playerColor, onExit, onGameOver }: SoloChessProps) {
  const settings = DIFFICULTIES[difficulty];
  const engine = useStockfish();
  const chessRef = useRef(new Chess());
  const [version, setVersion] = useState(0); // bumps whenever the position changes
  const [orientation, setOrientation] = useState<Color>(playerColor);
  const [thinking, setThinking] = useState(false);
  const [resigned, setResigned] = useState(false);
  const [hint, setHint] = useState<[Square, Square] | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const searchId = useRef(0); // ignores engine replies for positions that no longer exist
  const reported = useRef(false);

  const chess = chessRef.current;
  const history = chess.history({ verbose: true });
  const lastMove = history.at(-1) ?? null;
  const result: ChessResult | null = resigned
    ? { winner: otherColor(playerColor), reason: "resignation" }
    : gameResult(chess);
  const myTurn = chess.turn() === playerColor && !result;

  const changed = () => {
    setHint(null);
    setVersion((v) => v + 1);
  };

  // Computer's turn
  useEffect(() => {
    if (result || chess.turn() === playerColor || !engine.ready) return;
    const id = ++searchId.current;
    setThinking(true);
    const started = Date.now();

    const pickMove = async (): Promise<string | null> => {
      if (Math.random() < settings.randomChance) {
        const moves = chess.moves({ verbose: true });
        const move = moves[Math.floor(Math.random() * moves.length)];
        return move ? move.lan : null;
      }
      return engine.bestMove(chess.fen(), settings.skill, settings.go);
    };

    pickMove().then(async (uci) => {
      const wait = MIN_THINK_MS - (Date.now() - started);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      if (id !== searchId.current) return;
      setThinking(false);
      if (!uci) return;
      try {
        chess.move(uciToMove(uci));
        changed();
      } catch {
        // engine reply for a different position; ignore
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, engine.ready]);

  // Report the result once per game
  useEffect(() => {
    if (!result || reported.current) return;
    reported.current = true;
    setShowResult(true);
    onGameOver(difficulty, !result.winner ? "draws" : result.winner === playerColor ? "wins" : "losses");
  }, [result, difficulty, playerColor, onGameOver]);

  const stopThinking = () => {
    searchId.current += 1;
    engine.cancel();
    setThinking(false);
  };

  const onMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      if (!myTurn || thinking) return false;
      try {
        chess.move({ from, to, promotion });
      } catch {
        return false;
      }
      changed();
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myTurn, thinking]
  );

  // Take back your last move (and the computer's reply)
  const undo = () => {
    stopThinking();
    if (chess.turn() !== playerColor) chess.undo();
    else {
      chess.undo();
      chess.undo();
    }
    setResigned(false);
    setShowResult(false);
    reported.current = false;
    changed();
  };

  const newGame = () => {
    stopThinking();
    chess.reset();
    setResigned(false);
    setShowResult(false);
    reported.current = false;
    changed();
  };

  const showHint = async () => {
    if (!myTurn || hintLoading) return;
    setHintLoading(true);
    const id = searchId.current;
    const uci = await engine.bestMove(chess.fen(), 20, "go movetime 800");
    setHintLoading(false);
    if (uci && id === searchId.current) {
      const { from, to } = uciToMove(uci);
      setHint([from, to]);
    }
  };

  const status = result
    ? describeResult(result, playerColor)
    : !engine.ready
      ? `${settings.name} is sitting down at the board…`
      : thinking
        ? `${settings.name} is thinking…`
        : chess.inCheck()
          ? "Check! Your move."
          : "Your move";

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="mx-auto flex w-full flex-col gap-2" style={BOARD_COLUMN_STYLE}>
        <PlayerBar
          label={`${settings.emoji} ${settings.name}`}
          color={otherColor(playerColor)}
          chess={chess}
          active={!result && !myTurn}
          thinking={thinking}
        />
        <ChessBoard
          id="solo-board"
          fen={chess.fen()}
          orientation={orientation}
          myColor={playerColor}
          canMove={myTurn && !thinking && engine.ready}
          onMove={onMove}
          lastMove={lastMove}
          arrows={hint ? [[hint[0], hint[1], "rgba(16,185,129,0.85)"]] : []}
        />
        <PlayerBar label="You" color={playerColor} chess={chess} active={myTurn} />
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-semibold" aria-live="polite">
            {status}
          </p>
          {engine.failed && (
            <p className="mt-2 text-sm text-red-500">
              {settings.name} couldn&apos;t make it to the board. Try refreshing the page.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={showHint} disabled={!myTurn || hintLoading || !engine.ready}>
            {hintLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
            Hint
          </Button>
          <Button variant="outline" onClick={undo} disabled={history.length === 0}>
            <Undo2 className="mr-2 h-4 w-4" /> Undo
          </Button>
          <Button variant="outline" onClick={() => setOrientation(otherColor)}>
            <FlipVertical2 className="mr-2 h-4 w-4" /> Flip
          </Button>
          {result ? (
            <Button onClick={newGame}>
              <RotateCcw className="mr-2 h-4 w-4" /> New game
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                stopThinking();
                setResigned(true);
              }}
              disabled={history.length === 0}
            >
              <Flag className="mr-2 h-4 w-4" /> Resign
            </Button>
          )}
        </div>

        <MoveList moves={history.map((m) => m.san)} />

        <Button variant="ghost" onClick={onExit}>
          ← Pick a different opponent
        </Button>
      </aside>

      {result && (
        <GameOverDialog
          open={showResult}
          onOpenChange={setShowResult}
          result={result}
          myColor={playerColor}
          moveCount={history.length}
          opponentName={settings.name}
        >
          <Button className="w-full" onClick={newGame}>
            <RotateCcw className="mr-2 h-4 w-4" /> Play again
          </Button>
          {result.winner !== playerColor && history.length > 1 && (
            <Button variant="outline" className="w-full" onClick={undo}>
              <Undo2 className="mr-2 h-4 w-4" /> Take back last move
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={() => setShowResult(false)}>
            Look at the board
          </Button>
          <Button variant="ghost" className="w-full" onClick={onExit}>
            Pick a different opponent
          </Button>
        </GameOverDialog>
      )}
    </div>
  );
}

function PlayerBar({
  label,
  color,
  chess,
  active,
  thinking,
}: {
  label: string;
  color: Color;
  chess: Chess;
  active: boolean;
  thinking?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`h-4 w-4 rounded-full border ${color === "w" ? "bg-white" : "bg-neutral-900"}`}
          aria-hidden
        />
        <span className="font-medium">{label}</span>
        {active && (
          <Badge variant="secondary" className="gap-1">
            {thinking && <Loader2 className="h-3 w-3 animate-spin" />}
            {thinking ? "thinking" : "to move"}
          </Badge>
        )}
      </div>
      <CapturedPieces chess={chess} color={color} />
    </div>
  );
}
