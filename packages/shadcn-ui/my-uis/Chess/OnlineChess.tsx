"use client";

import { useEffect, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Copy, Flag, FlipVertical2, RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { getPusherClient } from "../../lib/pusher-client";
import { describeResult } from "../../lib/chess-rules";
import {
  chessChannel,
  colorOfSeat,
  otherColor,
  type Color,
  type OnlineChessState,
  type Seat,
} from "../../types/chess";
import { BOARD_COLUMN_STYLE, ChessBoard } from "./components/chess-board";
import { CapturedPieces, MoveList } from "./components/move-list";
import { GameOverDialog } from "./components/game-over-dialog";

// POSTs JSON to a chess API route; throws with the server's error message on failure
async function postJson<T>(url: string, body: object): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

type JoinResponse = { gameId: string; seat: Seat; game: OnlineChessState };

export default function OnlineChess({ onExit }: { onExit: () => void }) {
  const [socketId, setSocketId] = useState<string | null>(null);
  const [gameId, setGameId] = useState("");
  const [seat, setSeat] = useState<Seat | null>(null);
  const [game, setGame] = useState<OnlineChessState | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [colorChoice, setColorChoice] = useState<Color | "random">("random");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Pop up the result the moment a game ends; close it when a rematch starts
  const previousStatus = useRef<OnlineChessState["status"] | null>(null);
  useEffect(() => {
    const status = game?.status ?? null;
    if (status === "finished" && previousStatus.current === "playing") setShowResult(true);
    if (status !== "finished") setShowResult(false);
    previousStatus.current = status;
  }, [game?.status]);

  // Pusher connection; the socket id identifies this player to the server
  useEffect(() => {
    const pusher = getPusherClient();
    const update = () => setSocketId(pusher.connection.socket_id ?? null);
    update();
    pusher.connection.bind("state_change", update);
    return () => {
      pusher.connection.unbind("state_change", update);
    };
  }, []);

  // Live updates for the current game
  useEffect(() => {
    if (!gameId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(chessChannel(gameId));
    channel.bind("game-state-update", (state: OnlineChessState) => {
      setGame(state);
      if (state.status === "playing") setNotice(null);
    });
    channel.bind("opponent-left", () => setNotice("Your opponent left the game."));
    channel.bind("pusher:subscription_succeeded", async () => {
      const response = await fetch(`/api/chess/state?gameId=${gameId}`);
      if (response.ok) setGame((await response.json()).game);
    });
    channel.bind("pusher:subscription_error", () =>
      setNotice("Couldn't connect to the game. Try leaving and rejoining.")
    );
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(chessChannel(gameId));
    };
  }, [gameId]);

  // Free our seat if the tab is closed
  useEffect(() => {
    if (!gameId || !socketId) return;
    const leave = () =>
      navigator.sendBeacon("/api/chess/leave", JSON.stringify({ gameId, socketId }));
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, [gameId, socketId]);

  const run = async (action: () => Promise<void>) => {
    if (pending) return;
    setPending(true);
    setNotice(null);
    try {
      await action();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error));
    } finally {
      setPending(false);
    }
  };

  const enter = (data: JoinResponse) => {
    setGameId(data.gameId);
    setSeat(data.seat);
    setGame(data.game);
  };

  const leave = () => {
    postJson("/api/chess/leave", { gameId, socketId }).catch(() => {});
    setGameId("");
    setSeat(null);
    setGame(null);
    setNotice(null);
    setShowResult(false);
  };

  if (!game || !seat) {
    return (
      <div className="mx-auto w-full max-w-md space-y-5 px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Challenge a friend</h1>
          <p className="mt-1 text-muted-foreground">Start a match and send the code, or punch in a friend&apos;s code to jump in.</p>
        </div>

        <div className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground">
          <p className="font-semibold">Start a match</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Your colour">
            {(
              [
                ["w", "White"],
                ["random", "Random"],
                ["b", "Black"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                role="radio"
                aria-checked={colorChoice === value}
                variant={colorChoice === value ? "default" : "outline"}
                onClick={() => setColorChoice(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          <Button
            className="w-full"
            disabled={!socketId || pending}
            onClick={() =>
              run(async () =>
                enter(await postJson<JoinResponse>("/api/chess/create", { socketId, color: colorChoice }))
              )
            }
          >
            Start match
          </Button>
        </div>

        <form
          className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const code = inputCode.trim().toUpperCase();
              if (!code) throw new Error("Enter a game code to join.");
              enter(await postJson<JoinResponse>("/api/chess/join", { gameId: code, socketId }));
            });
          }}
        >
          <p className="font-semibold">Got a code?</p>
          <div className="flex gap-2">
            <Input
              placeholder="Game code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="uppercase tracking-widest"
              maxLength={10}
              autoComplete="off"
            />
            <Button type="submit" variant="outline" disabled={!socketId || pending}>
              Join
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {socketId ? "Ready when you are." : "Getting the board ready…"}
        </p>
        {notice && (
          <p className="text-center text-sm text-red-500" role="alert">
            {notice}
          </p>
        )}
        <Button variant="ghost" className="w-full" onClick={onExit}>
          ← Back to chess modes
        </Button>
      </div>
    );
  }

  const myColor = colorOfSeat(seat, game.hostColor);
  const opponentSeat: Seat = seat === "host" ? "guest" : "host";
  const chess = new Chess(game.fen);
  const myTurn = game.status === "playing" && chess.turn() === myColor;

  const onMove = (from: Square, to: Square, promotion?: string) => {
    if (!myTurn || pending) return false;
    // Check legality locally and show the move straight away; the server has the final say
    const preview = new Chess(game.fen);
    try {
      preview.move({ from, to, promotion });
    } catch {
      return false;
    }
    const before = game;
    setGame({ ...game, fen: preview.fen(), lastMove: { from, to } });
    run(async () => {
      try {
        const data = await postJson<{ game: OnlineChessState }>("/api/chess/move", {
          gameId,
          socketId,
          from,
          to,
          promotion,
        });
        setGame(data.game);
      } catch (error) {
        setGame(before);
        throw error;
      }
    });
    return true;
  };

  const status =
    game.status === "waiting"
      ? `Waiting for your friend… send them the code ${gameId}`
      : game.status === "finished" && game.result
        ? describeResult(game.result, myColor)
        : myTurn
          ? chess.inCheck()
            ? "Check! Your move."
            : "Your move"
          : "Your friend is thinking…";

  const rematch = () =>
    run(async () => {
      const data = await postJson<{ game: OnlineChessState }>("/api/chess/rematch", { gameId, socketId });
      setGame(data.game);
    });

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; the code is still visible
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="mx-auto flex w-full flex-col gap-2" style={BOARD_COLUMN_STYLE}>
        <SideBar
          label={game.players[opponentSeat] ? "Your friend" : "Waiting for your friend…"}
          color={otherColor(myColor)}
          chess={chess}
          active={game.status === "playing" && !myTurn}
        />
        <ChessBoard
          id="online-board"
          fen={game.fen}
          orientation={flipped ? otherColor(myColor) : myColor}
          myColor={myColor}
          canMove={myTurn && !pending}
          onMove={onMove}
          lastMove={game.lastMove}
        />
        <SideBar label="You" color={myColor} chess={chess} active={myTurn} />
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              Code <span className="font-mono font-semibold tracking-widest">{gameId}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={copyCode}>
              <Copy className="mr-1 h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="mt-2 text-lg font-semibold" aria-live="polite">
            {status}
          </p>
          {notice && (
            <p className="mt-2 text-sm text-red-500" role="alert">
              {notice}
            </p>
          )}
          <div className="mt-3 grid grid-cols-3 text-center text-sm">
            <div>
              <p className="text-muted-foreground">You</p>
              <p className="text-xl font-bold">{game.score[seat]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Draws</p>
              <p className="text-xl font-bold">{game.score.draws}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Opponent</p>
              <p className="text-xl font-bold">{game.score[opponentSeat]}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setFlipped((f) => !f)}>
            <FlipVertical2 className="mr-2 h-4 w-4" /> Flip
          </Button>
          {game.status === "finished" ? (
            <Button disabled={pending || !game.players[opponentSeat]} onClick={rematch}>
              <RotateCcw className="mr-2 h-4 w-4" /> Rematch
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={pending || game.status !== "playing"}
              onClick={() => {
                if (!window.confirm("Resign this game?")) return;
                run(async () => {
                  const data = await postJson<{ game: OnlineChessState }>("/api/chess/resign", {
                    gameId,
                    socketId,
                  });
                  setGame(data.game);
                });
              }}
            >
              <Flag className="mr-2 h-4 w-4" /> Resign
            </Button>
          )}
        </div>
        {game.status === "finished" && (
          <p className="text-xs text-muted-foreground">Rematches swap colours.</p>
        )}

        <MoveList moves={game.moves} />

        <Button variant="outline" onClick={leave}>
          Leave game
        </Button>
      </aside>

      {game.result && (
        <GameOverDialog
          open={showResult}
          onOpenChange={setShowResult}
          result={game.result}
          myColor={myColor}
          moveCount={game.moves.length}
          opponentName="your opponent"
        >
          {game.players[opponentSeat] ? (
            <Button className="w-full" disabled={pending} onClick={rematch}>
              <RotateCcw className="mr-2 h-4 w-4" /> Rematch (swap colours)
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your opponent has left. Share the code {gameId} to play someone new.
            </p>
          )}
          <Button variant="outline" className="w-full" onClick={() => setShowResult(false)}>
            Look at the board
          </Button>
          <Button variant="ghost" className="w-full" onClick={leave}>
            Leave game
          </Button>
        </GameOverDialog>
      )}
    </div>
  );
}

function SideBar({ label, color, chess, active }: { label: string; color: Color; chess: Chess; active: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span
          className={cn("h-4 w-4 rounded-full border", color === "w" ? "bg-white" : "bg-neutral-900")}
          aria-hidden
        />
        <span className="font-medium">{label}</span>
        {active && <Badge variant="secondary">to move</Badge>}
      </div>
      <CapturedPieces chess={chess} color={color} />
    </div>
  );
}
