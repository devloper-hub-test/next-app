"use client";
import React, { useEffect, useState } from "react";
import { gameChannel, type GameState, type Mark } from "../types/game";
import { getPusherClient } from "../lib/pusher-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

// POSTs JSON to a game API route; throws with the server's error message on failure
async function postJson<T>(url: string, body: object): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

function statusText(game: GameState, mark: Mark, gameId: string): string {
  switch (game.status) {
    case "waiting":
      return `Waiting for an opponent. Share the code ${gameId}.`;
    case "playing":
      return game.currentPlayer === mark ? "Your turn" : "Opponent's turn…";
    case "finished":
      if (game.winner === "Draw") return "It's a draw!";
      return game.winner === mark ? "You win! 🎉" : "You lose. Better luck next round!";
  }
}

export default function TicTacToe() {
  const [socketId, setSocketId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string>("");
  const [mark, setMark] = useState<Mark | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [inputGameId, setInputGameId] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  // Track the Pusher connection; its socket id identifies this player to the server
  useEffect(() => {
    const pusher = getPusherClient();
    const update = () => setSocketId(pusher.connection.socket_id ?? null);
    update();
    pusher.connection.bind("state_change", update);
    return () => {
      pusher.connection.unbind("state_change", update);
    };
  }, []);

  // Listen to the current game's private channel
  useEffect(() => {
    if (!gameId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(gameChannel(gameId));

    channel.bind("game-state-update", (state: GameState) => {
      setGame(state);
      if (state.status === "playing") setNotice(null);
    });
    channel.bind("opponent-left", () => {
      setNotice("Your opponent left the game.");
    });
    // Catch up on anything that happened before the subscription was ready
    channel.bind("pusher:subscription_succeeded", async () => {
      const response = await fetch(`/api/game/state?gameId=${gameId}`);
      if (response.ok) setGame((await response.json()).game);
    });
    channel.bind("pusher:subscription_error", () => {
      setNotice("Couldn't connect to the game. Try leaving and rejoining.");
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(gameChannel(gameId));
    };
  }, [gameId]);

  // Free our seat if the tab is closed mid-game
  useEffect(() => {
    if (!gameId || !socketId) return;
    const leave = () =>
      navigator.sendBeacon(
        "/api/game/leave",
        JSON.stringify({ gameId, socketId })
      );
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, [gameId, socketId]);

  // Runs an API action, showing errors and blocking double submits
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

  type JoinResponse = { gameId: string; playerSymbol: Mark; game: GameState };

  const enterGame = (data: JoinResponse) => {
    setGameId(data.gameId);
    setMark(data.playerSymbol);
    setGame(data.game);
  };

  const createGame = () =>
    run(async () => {
      enterGame(await postJson<JoinResponse>("/api/game/create", { socketId }));
    });

  const joinGame = () =>
    run(async () => {
      const code = inputGameId.trim().toUpperCase();
      if (!code) throw new Error("Enter a game code to join.");
      enterGame(
        await postJson<JoinResponse>("/api/game/join", { gameId: code, socketId })
      );
    });

  const play = (index: number) =>
    run(async () => {
      const data = await postJson<{ game: GameState }>("/api/game/move", {
        gameId,
        socketId,
        index,
      });
      setGame(data.game);
    });

  const playAgain = () =>
    run(async () => {
      const data = await postJson<{ game: GameState }>("/api/game/reset", {
        gameId,
        socketId,
      });
      setGame(data.game);
    });

  const leaveGame = () => {
    postJson("/api/game/leave", { gameId, socketId }).catch(() => {});
    setGameId("");
    setMark(null);
    setGame(null);
    setNotice(null);
    setInputGameId("");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context); the code is still visible
    }
  };

  const inGame = Boolean(gameId && mark && game);
  const myTurn =
    game?.status === "playing" && game.currentPlayer === mark && !pending;

  return (
    <div className="flex flex-col items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Online Tic-Tac-Toe</CardTitle>
          <CardDescription>Play with a friend from anywhere.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {!inGame || !game || !mark ? (
            <>
              <Button
                onClick={createGame}
                disabled={!socketId || pending}
                className="w-full"
              >
                Create new game
              </Button>
              <div className="flex w-full items-center gap-2 text-xs uppercase text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or join one
                <span className="h-px flex-1 bg-border" />
              </div>
              <form
                className="flex w-full gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  joinGame();
                }}
              >
                <Input
                  placeholder="Game code"
                  value={inputGameId}
                  onChange={(e) => setInputGameId(e.target.value)}
                  className="flex-grow uppercase tracking-widest"
                  maxLength={10}
                  autoCapitalize="characters"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!socketId || pending}
                >
                  Join
                </Button>
              </form>
              <p className="text-sm text-muted-foreground">
                {socketId ? "Connected." : "Connecting to game server…"}
              </p>
            </>
          ) : (
            <>
              <div className="flex w-full items-center justify-between text-sm">
                <span>
                  Code{" "}
                  <span className="font-mono font-semibold tracking-widest">
                    {gameId}
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={copyCode}
                    className="h-auto px-2"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </span>
                <span>
                  You are{" "}
                  <span
                    className={cn(
                      "font-bold",
                      mark === "X" ? "text-red-500" : "text-blue-500"
                    )}
                  >
                    {mark}
                  </span>
                </span>
              </div>

              <div className="grid w-full grid-cols-3 text-center text-sm">
                <div>
                  <div className="text-red-500 font-semibold">
                    X{mark === "X" && " (you)"}
                  </div>
                  <div className="text-2xl font-bold">{game.scores.X}</div>
                </div>
                <div>
                  <div className="text-muted-foreground font-semibold">Draws</div>
                  <div className="text-2xl font-bold">{game.scores.draws}</div>
                </div>
                <div>
                  <div className="text-blue-500 font-semibold">
                    O{mark === "O" && " (you)"}
                  </div>
                  <div className="text-2xl font-bold">{game.scores.O}</div>
                </div>
              </div>

              <div
                className="grid w-full max-w-xs grid-cols-3 gap-2"
                role="grid"
                aria-label="Tic-tac-toe board"
              >
                {game.board.map((cell, idx) => {
                  const playable = myTurn && cell === null;
                  const winning = game.winningLine?.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => play(idx)}
                      disabled={!playable}
                      aria-label={`Cell ${idx + 1}${cell ? `, ${cell}` : ""}`}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-md border text-5xl font-bold transition-colors",
                        playable && "cursor-pointer hover:bg-muted",
                        !playable && "cursor-default",
                        winning && "bg-green-100 dark:bg-green-900/40",
                        cell === "X" && "text-red-500",
                        cell === "O" && "text-blue-500"
                      )}
                    >
                      {cell}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-lg font-semibold" aria-live="polite">
                {statusText(game, mark, gameId)}
              </p>
            </>
          )}

          {notice && (
            <p className="text-center text-sm text-red-500" role="alert">
              {notice}
            </p>
          )}
        </CardContent>

        {inGame && (
          <CardFooter className="flex gap-2">
            {game?.status === "finished" && (
              <Button onClick={playAgain} disabled={pending} className="flex-1">
                Play again
              </Button>
            )}
            <Button variant="outline" onClick={leaveGame} className="flex-1">
              Leave game
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
