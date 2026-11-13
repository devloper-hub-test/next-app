// Decorative previews for the game cards (pure SVG, no images to load)

export function ChessArt(): JSX.Element {
  const squares = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 10; col++) {
      squares.push(
        <rect
          fill={(row + col) % 2 === 0 ? "#eeeed2" : "#769656"}
          height={24}
          key={`${row}-${col}`}
          width={24}
          x={col * 24}
          y={row * 24}
        />
      );
    }
  }
  return (
    <svg aria-hidden className="h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 240 144">
      {squares}
      <rect fill="url(#chess-fade)" height={144} width={240} />
      <defs>
        <linearGradient id="chess-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <g fontFamily="'Segoe UI Symbol','Noto Sans Symbols 2','Apple Symbols',serif" textAnchor="middle">
        <text fill="#1f2937" fontSize="78" opacity={0.25} x="83" y="118">♞</text>
        <text fill="#111827" fontSize="78" x="80" y="114">♞</text>
        <text fill="#fff" fontSize="62" stroke="#111827" strokeWidth={1.5} x="160" y="112">♛</text>
      </g>
    </svg>
  );
}

export function SnakeArt(): JSX.Element {
  const dots = [];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 12; x++) {
      dots.push(<circle cx={10 + x * 20} cy={10 + y * 20} fill="#fff" key={`${x}-${y}`} opacity={0.18} r={1.6} />);
    }
  }
  const body = "30,110 30,70 90,70 90,30 170,30 170,90";
  return (
    <svg aria-hidden className="h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 240 140">
      {dots}
      <polyline fill="none" points={body} stroke="#14532d" strokeLinecap="round" strokeLinejoin="round" strokeWidth={20} />
      <polyline fill="none" points={body} stroke="#86efac" strokeLinecap="round" strokeLinejoin="round" strokeWidth={14} />
      <circle cx={170} cy={92} fill="#14532d" r={13} />
      <circle cx={170} cy={92} fill="#4ade80" r={10} />
      <circle cx={165} cy={96} fill="#fff" r={3} />
      <circle cx={175} cy={96} fill="#fff" r={3} />
      <circle cx={165} cy={97} fill="#111" r={1.5} />
      <circle cx={175} cy={97} fill="#111" r={1.5} />
      <path d="M170 104 l0 7" stroke="#e11d48" strokeLinecap="round" strokeWidth={2} />
      <circle cx={170} cy={124} fill="#ef4444" r={8} />
      <ellipse cx={174} cy={114} fill="#22c55e" rx={4} ry={2} transform="rotate(-30 174 114)" />
    </svg>
  );
}

export function TicTacToeArt(): JSX.Element {
  const x = (cx: number, cy: number): JSX.Element => (
    <path
      d={`M${cx - 10} ${cy - 10} L${cx + 10} ${cy + 10} M${cx + 10} ${cy - 10} L${cx - 10} ${cy + 10}`}
      stroke="#fda4af"
      strokeLinecap="round"
      strokeWidth={6}
    />
  );
  const o = (cx: number, cy: number): JSX.Element => (
    <circle cx={cx} cy={cy} fill="none" r={10} stroke="#bae6fd" strokeWidth={6} />
  );
  // 3x3 board of 36px cells centred at (120, 70); X wins on the diagonal
  return (
    <svg aria-hidden className="h-full w-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 240 140">
      <g stroke="#fff" strokeLinecap="round" strokeOpacity={0.55} strokeWidth={3}>
        <path d="M102 18 V122 M138 18 V122 M68 52 H172 M68 88 H172" />
      </g>
      {x(84, 34)}
      {o(120, 34)}
      {x(156, 34)}
      {o(84, 70)}
      {x(120, 70)}
      {o(84, 106)}
      {x(156, 106)}
      <path d="M74 24 L166 116" stroke="#fff" strokeLinecap="round" strokeWidth={4} />
    </svg>
  );
}
