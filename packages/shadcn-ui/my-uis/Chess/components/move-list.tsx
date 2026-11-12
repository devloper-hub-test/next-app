"use client";

import { useEffect, useRef } from "react";
import type { Chess, PieceSymbol } from "chess.js";
import type { Color } from "../../../types/chess";

/** Numbered move list, e.g. "1. e4 e5  2. Nf3 Nc6" */
export function MoveList({ moves }: { moves: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [moves.length]);

  const rows = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({ number: i / 2 + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground">
      <p className="border-b px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">Moves</p>
      <div className="max-h-56 overflow-y-auto px-4 py-2 font-mono text-sm">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">No moves yet</p>
        ) : (
          rows.map((row) => (
            <div key={row.number} className="grid grid-cols-[2.5rem_1fr_1fr] py-0.5">
              <span className="text-muted-foreground">{row.number}.</span>
              <span>{row.white}</span>
              <span>{row.black ?? ""}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

const START_COUNT: Record<Exclude<PieceSymbol, "k">, number> = { q: 1, r: 2, b: 2, n: 2, p: 8 };
const VALUE: Record<Exclude<PieceSymbol, "k">, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
const GLYPH: Record<Color, Record<Exclude<PieceSymbol, "k">, string>> = {
  w: { q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

/** Pieces this side has captured, plus their material lead */
export function CapturedPieces({ chess, color }: { chess: Chess; color: Color }) {
  const opponent: Color = color === "w" ? "b" : "w";
  const onBoard = (side: Color) => {
    const count = { q: 0, r: 0, b: 0, n: 0, p: 0 };
    chess.board().flat().forEach((square) => {
      if (square && square.color === side && square.type !== "k") count[square.type] += 1;
    });
    return count;
  };
  const mine = onBoard(color);
  const theirs = onBoard(opponent);
  const material = (count: typeof mine) =>
    (Object.keys(VALUE) as (keyof typeof VALUE)[]).reduce((sum, p) => sum + count[p] * VALUE[p], 0);
  const lead = material(mine) - material(theirs);

  const captured = (Object.keys(START_COUNT) as (keyof typeof START_COUNT)[]).flatMap((piece) =>
    Array.from({ length: Math.max(0, START_COUNT[piece] - theirs[piece]) }, () => GLYPH[opponent][piece])
  );

  return (
    <span className="flex items-center gap-1 text-lg leading-none text-muted-foreground">
      {captured.join("")}
      {lead > 0 && <span className="ml-1 text-xs font-semibold">+{lead}</span>}
    </span>
  );
}
