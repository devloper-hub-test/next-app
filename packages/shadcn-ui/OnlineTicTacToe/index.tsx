"use client";
import React, { useCallback, useEffect, useState } from "react";
import type { GameState, Player } from "../types/game";
import { pusherClient } from "../lib/pusher";
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
import { cn } from "@/lib/utils";

const initialGameState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  winner: null,
  players: { X: null, O: null },
  status: "waiting",
};
export default function TicTacToe() {
  const [gameId, setGameId] = useState<string>("");
  const [inputGameId, setInputGameId] = useState<string>("");
  const [playerSymbol, setPlayerSymbol] = useState<Player>(null);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [message, setMessage] = useState<string>(
    "Enter a Game ID or create a new game."
  );
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const handleConnected = () => {
      setSocketId(pusherClient.connection.socket_id);
    };

    const handleGameCreated = (data: {
      gameId: string;
      playerSymbol: Player;
    }) => {
      setGameId(data.gameId);
      setPlayerSymbol(data.playerSymbol);
      setMessage(
        `Game created! Share this ID: ${data.gameId}. Waiting for opponent...`
      );
      subscribeToGameChannel(data.gameId);
    };

    const handleGameJoined = (data: {
      gameId: string;
      playerSymbol: Player;
    }) => {
      setGameId(data.gameId);
      setPlayerSymbol(data.playerSymbol);
      setMessage(`Joined game ${data.gameId} as Player ${data.playerSymbol}.`);
      subscribeToGameChannel(data.gameId);
    };

    const handleOpponentJoined = (data: { game: GameState }) => {
      setGameState(data.game);
      setMessage("Opponent joined! Game started.");
    };

    // Bind connection and global events
    pusherClient.connection.bind("connected", handleConnected);
    pusherClient.bind("game-created", handleGameCreated);
    pusherClient.bind("game-joined", handleGameJoined);
    pusherClient.bind("opponent-joined", handleOpponentJoined);

    return () => {
      // Unbind all global events
      pusherClient.connection.unbind("connected", handleConnected);
      pusherClient.unbind("game-created", handleGameCreated);
      pusherClient.unbind("game-joined", handleGameJoined);
      pusherClient.unbind("opponent-joined", handleOpponentJoined);

      // Unsubscribe only from current game channel
      if (gameId) {
        pusherClient.unsubscribe(`private-${gameId}`);
      }
    };
  }, [gameId]);

  const subscribeToGameChannel = useCallback((id: string) => {
    const channel = pusherClient.subscribe(`private-${id}`);
    channel.bind("game-state-update", (data: GameState) => {
      setGameState(data);
      if (data.winner) {
        setMessage(
          data.winner === "Draw"
            ? "It's a Draw!"
            : `Player ${data.winner} Wins!`
        );
      } else if (data.status === "playing") {
        setMessage(`Current Player: ${data.currentPlayer}`);
      }
    });
  }, []);

  const createGame = async () => {
    if (!socketId) {
      setMessage("Pusher not connected yet. Please wait.");
      return;
    }
    setMessage("Creating game...");
    try {
      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socketId }),
      });
      const data = await response.json();
      console.log("data: ", data);
      if (response.ok) {
        // Game creation handled by pusherClient.bind('game-created')
        setGameId(data.gameId);
        setPlayerSymbol(data.playerSymbol);
        subscribeToGameChannel(data.gameId);
        setMessage(`Game created. ID: ${data.gameId}. Waiting for opponent...`);
      } else {
        setMessage(`Error creating game: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to create game:", error);
      setMessage("Failed to create game. Check console.");
    }
  };

  const joinGame = async () => {
    if (!socketId) {
      setMessage("Pusher not connected yet. Please wait.");
      return;
    }
    if (!inputGameId) {
      setMessage("Please enter a Game ID to join.");
      return;
    }
    setMessage(`Joining game ${inputGameId}...`);
    try {
      const response = await fetch("/api/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: inputGameId, socketId }),
      });
      const data = await response.json();
      if (response.ok) {
        // Game joined handled by pusherClient.bind('game-joined')
      } else {
        setMessage(`Error joining game: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to join game:", error);
      setMessage("Failed to join game. Check console.");
    }
  };

  const handleCellClick = async (index: number) => {
    if (
      !gameId ||
      !playerSymbol ||
      gameState.winner ||
      gameState.board[index] !== null ||
      gameState.currentPlayer !== playerSymbol
    ) {
      return;
    }

    setMessage("Making move...");
    try {
      const response = await fetch("/api/game/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, index, playerSymbol }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
      }
      // Game state update handled by pusherClient.bind('game-state-update')
    } catch (error) {
      console.error("Failed to make move:", error);
      setMessage("Failed to make move. Check console.");
    }
  };

  const resetGame = async () => {
    if (!gameId) return;
    setMessage("Resetting game...");
    try {
      const response = await fetch("/api/game/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(`Error resetting game: ${data.error}`);
      }
      // Game state update handled by pusherClient.bind('game-state-update')
    } catch (error) {
      console.error("Failed to reset game:", error);
      setMessage("Failed to reset game. Check console.");
    }
  };
  console.log("message======", message);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Online Tic-Tac-Toe
          </CardTitle>
          <CardDescription>Play with friends from anywhere!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {!gameId ? (
            <>
              <div className="flex gap-2 w-full">
                <Input
                  placeholder="Enter Game ID"
                  value={inputGameId}
                  onChange={(e) => setInputGameId(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={joinGame}>Join</Button>
              </div>
              <Button onClick={createGame} className="w-full">
                Create New Game
              </Button>
            </>
          ) : (
            <>
              <p>
                Game ID: {gameId} | You: {playerSymbol}
              </p>
              <div className="grid grid-cols-3 gap-2 w-full max-w-xs aspect-square">
                {gameState.board.map((cell, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={
                      !!gameState.winner ||
                      gameState.board[idx] !== null ||
                      gameState.currentPlayer !== playerSymbol
                    }
                    className={cn(
                      "w-full h-full text-3xl",
                      cell === "X" && "text-red-500",
                      cell === "O" && "text-blue-500"
                    )}
                  >
                    {cell}
                  </Button>
                ))}
              </div>
              <div className="text-center font-semibold">{message}</div>
            </>
          )}
          <div className="mt-4 text-lg font-semibold text-center">
            {message}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {gameId && (
            <Button
              // onClick={resetGame}
              className="w-full"
              disabled={gameState.status !== "playing" && !gameState.winner}
            >
              Reset Game
            </Button>
          )}
        </CardFooter>
      </Card>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
        **Important:** This example uses an **in-memory game store** on the
        server. This means game states will be lost if the serverless function
        goes idle or restarts. For a production application, you **MUST** use a
        persistent database (e.g., Supabase, Redis, PostgreSQL) to store game
        states.
      </p>
    </div>
  );
}
