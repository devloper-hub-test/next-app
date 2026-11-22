"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Play, RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { getPusherClient } from "../../lib/pusher-client";
import { distinctChoices, legalTokens } from "../../lib/ludo-rules";
import {
  BOARD_COLORS,
  LUDO_COLOR_NAMES,
  ludoChannel,
  type BoardSize,
  type LudoColor,
  type OnlineLudoState,
} from "../../types/ludo";
import { BOARD_COLUMN_STYLE, ColorDot, LudoBoard } from "./components/ludo-board";
import { DIE_SETTLE_MS, Die, PlayerList, TurnBanner, describeNote } from "./components/ludo-hud";
import { GameOverDialog } from "./components/game-over-dialog";

// POSTs JSON to a Ludo API route; throws with the server's error message on failure
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

type JoinResponse = { gameId: string; color: LudoColor; game: OnlineLudoState };

export default function OnlineLudo({ onExit }: { onExit: () => void }) {
  const [socketId, setSocketId] = useState<string | null>(null);
  const [gameId, setGameId] = useState("");
  const [myColor, setMyColor] = useState<LudoColor | null>(null);
  const [room, setRoomState] = useState<OnlineLudoState | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [arms, setArms] = useState<BoardSize>(4);

  // Broadcasts and our own responses can arrive in either order; keep the newest
  const setRoom = (next: OnlineLudoState | null) =>
    setRoomState((current) => (next && current && next.version < current.version ? current : next));

  // Pop up the result the moment a game ends; close it when the next one starts
  const previousStatus = useRef<OnlineLudoState["status"] | null>(null);
  useEffect(() => {
    const status = room?.status ?? null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (status === "finished" && previousStatus.current === "playing")
      timer = setTimeout(() => setShowResult(true), 900);
    if (status !== "finished") setShowResult(false);
    previousStatus.current = status;
    return () => clearTimeout(timer);
  }, [room?.status]);

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

  // Live updates for the current room
  useEffect(() => {
    if (!gameId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(ludoChannel(gameId));
    channel.bind("game-state-update", (state: OnlineLudoState) => setRoom(state));
    channel.bind("player-left", ({ color }: { color: LudoColor }) =>
      setNotice(`${LUDO_COLOR_NAMES[color]} left the game.`)
    );
    channel.bind("pusher:subscription_succeeded", async () => {
      const response = await fetch(`/api/ludo/state?gameId=${gameId}`);
      if (response.ok) setRoom((await response.json()).game);
    });
    channel.bind("pusher:subscription_error", () =>
      setNotice("Couldn't connect to the game. Try leaving and rejoining.")
    );
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(ludoChannel(gameId));
    };
  }, [gameId]);

  // Free our seat if the tab is closed
  useEffect(() => {
    if (!gameId || !socketId) return;
    const leave = () => navigator.sendBeacon("/api/ludo/leave", JSON.stringify({ gameId, socketId }));
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

  const send = (path: string, extra: object = {}) =>
    run(async () =>
      setRoom(
        (
          await postJson<{ game: OnlineLudoState }>(path, {
            gameId,
            socketId,
            ...extra,
          })
        ).game
      )
    );

  const game = room?.game ?? null;
  const myTurn = Boolean(game && room?.status === "playing" && myColor && game.turn === myColor);

  // Play your move for you when there's only one real choice
  const autoMoved = useRef(-1);
  useEffect(() => {
    if (!game || !myTurn || game.phase !== "move" || autoMoved.current === game.rolls) return;
    const choices = distinctChoices(game);
    if (choices.length !== 1) return;
    const rollId = game.rolls;
    const timer = setTimeout(() => {
      autoMoved.current = rollId;
      send("/api/ludo/move", { token: choices[0] });
    }, DIE_SETTLE_MS + 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the game changes
  }, [game, myTurn]);

  const enter = (data: JoinResponse) => {
    setGameId(data.gameId);
    setMyColor(data.color);
    setRoomState(data.game);
  };

  const leave = () => {
    postJson("/api/ludo/leave", { gameId, socketId }).catch(() => {});
    setGameId("");
    setMyColor(null);
    setRoomState(null);
    setNotice(null);
    setShowResult(false);
  };

  if (!room || !myColor) {
    return (
      <div className="mx-auto w-full max-w-md space-y-5 px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Play with friends</h1>
          <p className="mt-1 text-muted-foreground">
            Open a table for up to six players and share the code, or punch in a friend&apos;s code to join.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground">
          <p className="font-semibold">Open a table</p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Table size">
            {(
              [
                [4, "Up to 4 players"],
                [6, "Up to 6 players"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                role="radio"
                aria-checked={arms === value}
                variant={arms === value ? "default" : "outline"}
                onClick={() => setArms(value)}
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
                enter(
                  await postJson<JoinResponse>("/api/ludo/create", {
                    socketId,
                    arms,
                  })
                )
              )
            }
          >
            Create game
          </Button>
        </div>

        <form
          className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const code = inputCode.trim().toUpperCase();
              if (!code) throw new Error("Enter a game code to join.");
              enter(
                await postJson<JoinResponse>("/api/ludo/join", {
                  gameId: code,
                  socketId,
                })
              );
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
          {socketId ? "Ready when you are." : "Setting up the table…"}
        </p>
        {notice && (
          <p className="text-center text-sm text-red-500" role="alert">
            {notice}
          </p>
        )}
        <Button variant="ghost" className="w-full" onClick={onExit}>
          ← Back to Ludo modes
        </Button>
      </div>
    );
  }

  const tableColors = BOARD_COLORS[room.arms];
  const seated = tableColors.filter((color) => room.seats[color]);
  const name = (color: LudoColor) => (color === myColor ? "You" : LUDO_COLOR_NAMES[color]);
  const canStart = room.status !== "playing" && seated.length >= 2;
  const movable = myTurn && game?.phase === "move" ? legalTokens(game) : [];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; the code is still visible
    }
  };

  let status: string;
  if (room.status === "waiting") {
    status = seated.length < 2 ? `Waiting for friends… send them the code ${gameId}` : "Everyone in? Start the game!";
  } else if (room.status === "finished" && game?.winner) {
    status = game.winner === myColor ? "You win! 🎉" : `${name(game.winner)} wins`;
  } else if (!game?.players.includes(myColor)) {
    status = "Watching: you'll join the next game.";
  } else {
    status = `${name(game.turn)} is playing…`;
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
      <div className="mx-auto w-full" style={BOARD_COLUMN_STYLE}>
        {game ? (
          <LudoBoard
            game={game}
            movable={movable}
            onTokenClick={(token) => {
              if (!pending) send("/api/ludo/move", { token });
            }}
            perspective={myColor}
            label={name}
            center={
              <Die
                value={game.roll?.value ?? null}
                rollId={game.rolls}
                color={game.turn}
                rolledBy={game.roll?.color ?? null}
                canRoll={myTurn && game.phase === "roll" && !pending}
                onRoll={() => send("/api/ludo/roll")}
              />
            }
          />
        ) : (
          <div className="grid aspect-square w-full place-items-center rounded-xl border bg-card p-6 text-center">
            <div className="space-y-4">
              <p className="text-5xl" aria-hidden>
                🎲
              </p>
              <p className="text-lg font-semibold">
                {seated.length} of {room.arms} players at the table
              </p>
              <ul className="flex justify-center gap-3">
                {tableColors.map((color) => (
                  <li key={color} className={room.seats[color] ? "" : "opacity-25"}>
                    <ColorDot color={color} className="block h-8 w-8 rounded-full border-2 border-black/20" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-3">
        <TurnBanner
          color={game ? (room.status === "finished" && game.winner ? game.winner : game.turn) : myColor}
          mine={myTurn}
          title={myTurn ? "Your turn" : status}
          subtitle={
            myTurn && game
              ? game.phase === "roll"
                ? "Tap the die to roll"
                : `You rolled a ${game.roll?.value}. Tap a glowing token.`
              : game && describeNote(game.note, name)
          }
        />
        <div className="rounded-xl border bg-card px-4 py-2 text-card-foreground">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              Code <span className="font-mono font-semibold tracking-widest">{gameId}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={copyCode}>
              <Copy className="mr-1 h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {notice && (
            <p className="mt-2 text-sm text-red-500" role="alert">
              {notice}
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-2 text-card-foreground">
          {game ? (
            <PlayerList
              game={game}
              colors={tableColors.filter((color) => room.seats[color] || game.players.includes(color))}
              name={name}
              extra={(color) => `${room.score[color]} won`}
            />
          ) : (
            <ul className="space-y-1.5">
              {seated.map((color) => (
                <li key={color} className="flex items-center gap-2 px-3 py-2 text-sm font-medium">
                  <ColorDot color={color} /> {name(color)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {room.status !== "playing" && (
          <Button disabled={!canStart || pending} onClick={() => send("/api/ludo/start")}>
            {room.status === "waiting" ? (
              <>
                <Play className="mr-2 h-4 w-4" /> Start game
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" /> Play again
              </>
            )}
          </Button>
        )}

        <Button variant="outline" onClick={leave}>
          Leave game
        </Button>
      </aside>

      {game?.winner && (
        <GameOverDialog
          open={showResult}
          onOpenChange={setShowResult}
          won={game.winner === myColor}
          winnerName={name(game.winner)}
        >
          {canStart ? (
            <Button className="w-full" disabled={pending} onClick={() => send("/api/ludo/start")}>
              <RotateCcw className="mr-2 h-4 w-4" /> Play again
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Everyone else has left. Share the code {gameId} to play someone new.
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
