"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Color } from "../../../types/chess";

type Arrow = [Square, Square, string?];

// Keeps the board column within one screen below the fixed site header:
// as wide as the page allows, but never taller than the viewport leaves room for
export const BOARD_COLUMN_STYLE: React.CSSProperties = {
  maxWidth: "max(17rem, min(100%, calc(100dvh - 13.5rem)))",
};

interface ChessBoardProps {
  id: string;
  fen: string;
  orientation: Color;
  myColor: Color; // the pieces this player may move
  canMove: boolean;
  onMove: (from: Square, to: Square, promotion?: string) => boolean;
  lastMove?: { from: string; to: string } | null;
  arrows?: Arrow[];
}

const LAST_MOVE = { background: "rgba(250, 204, 21, 0.4)" };
const SELECTED = { background: "rgba(16, 185, 129, 0.5)" };
const TARGET = { background: "radial-gradient(circle, rgba(0,0,0,0.22) 24%, transparent 26%)" };
const CAPTURE = { background: "radial-gradient(circle, transparent 58%, rgba(0,0,0,0.22) 60%)" };
const CHECK = { background: "radial-gradient(circle, rgba(239,68,68,0.85) 25%, rgba(239,68,68,0) 75%)" };

/** react-chessboard with drag-and-drop, click-to-move, legal-move dots and promotion */
export function ChessBoard({ id, fen, orientation, myColor, canMove, onMove, lastMove, arrows }: ChessBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Size the board to its container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Drop any selection when the position changes
  useEffect(() => {
    setSelected(null);
    setPromotion(null);
  }, [fen]);

  const chess = useMemo(() => new Chess(fen), [fen]);
  const targets = useMemo(
    () => (selected ? chess.moves({ square: selected, verbose: true }) : []),
    [chess, selected]
  );

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = LAST_MOVE;
    squareStyles[lastMove.to] = LAST_MOVE;
  }
  if (chess.inCheck()) {
    const king = chess.findPiece({ type: "k", color: chess.turn() })[0];
    if (king) squareStyles[king] = CHECK;
  }
  if (selected) squareStyles[selected] = SELECTED;
  targets.forEach((move) => {
    squareStyles[move.to] = chess.get(move.to) ? CAPTURE : TARGET;
  });

  const isPromotion = (from: Square, to: Square) =>
    chess.moves({ square: from, verbose: true }).some((m) => m.to === to && m.promotion);

  const onSquareClick = (square: Square) => {
    if (!canMove) return;
    if (selected && targets.some((m) => m.to === square)) {
      if (isPromotion(selected, square)) {
        setPromotion({ from: selected, to: square });
        return;
      }
      onMove(selected, square);
      setSelected(null);
      return;
    }
    const piece = chess.get(square);
    setSelected(piece && piece.color === myColor && square !== selected ? square : null);
  };

  return (
    <div ref={containerRef} className="w-full">
      {width > 0 && (
        <Chessboard
          id={id}
          boardWidth={width}
          position={fen}
          boardOrientation={orientation === "w" ? "white" : "black"}
          arePiecesDraggable={canMove}
          isDraggablePiece={({ piece }) => canMove && piece[0] === myColor}
          onPieceDrop={(from, to) => {
            setSelected(null);
            return canMove && onMove(from, to);
          }}
          onPieceDragBegin={(_, square) => setSelected(square)}
          onSquareClick={onSquareClick}
          onPromotionPieceSelect={(piece, from, to) => {
            const source = from ?? promotion?.from;
            const target = to ?? promotion?.to;
            setPromotion(null);
            setSelected(null);
            if (!piece || !source || !target) return false;
            return onMove(source, target, piece[1].toLowerCase());
          }}
          showPromotionDialog={!!promotion}
          promotionToSquare={promotion?.to ?? null}
          customSquareStyles={squareStyles}
          customArrows={arrows}
          customDarkSquareStyle={{ backgroundColor: "#769656" }}
          customLightSquareStyle={{ backgroundColor: "#eeeed2" }}
          customBoardStyle={{ borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}
          animationDuration={200}
        />
      )}
    </div>
  );
}
