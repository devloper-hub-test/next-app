# Rahul Verma — Portfolio Website

The `web` app of this monorepo: a personal portfolio built with **Next.js 14 (App Router)**, **React 18**, **TypeScript** and **Tailwind CSS**. Besides the portfolio itself, it has a blog powered by Notion, a few browser games, and a typing trainer.

## What's inside

| Page | What it is |
| --- | --- |
| `/` | Portfolio home: intro, about me, work, mobile apps, projects, plus a chatbot and a "tell me a joke" button |
| `/blog` | Blog posts and tags, loaded from Notion |
| `/projects` | Projects page (coming soon) |
| `/games` | Games hub |
| `/games/chess` | Chess against four bot levels (Stockfish) or a friend online |
| `/games/snake` | Snake with 20 levels, obstacles, swipe controls and a retro Nokia look |
| `/games/tic-tac-toe` | Live two-player Tic-Tac-Toe with a shareable game code |
| `/learn` | Skills hub |
| `/learn/typing` | KeyQuest: a typing game with scores, combos, speed (WPM) and weak-key practice |

## Getting started

### 1. Requirements

- **Node.js 18+** (developed on Node 22)
- **Yarn 1** (the repo uses `yarn@1.22.22`)

### 2. Install

From the **repository root**:

```bash
yarn install
```

### 3. Environment variables

Copy the example file and fill in the values:

```bash
cp apps/web/.env.example apps/web/.env.local
```

| Variable | Used for | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_PUSHER_KEY` | Online games (browser) | Pusher dashboard → your app → App Keys |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Online games (browser) | Same place, e.g. `ap2` |
| `PUSHER_APP_ID` | Online games (server) | Same place |
| `PUSHER_SECRET` | Online games (server) | Same place. **Keep it secret** |
| `NOTION_TOKEN` | Blog (server) | Notion → Settings → Connections → your integration |
| `NOTION_POSTS_DB_ID` | Blog (server) | The ID in your posts database URL |
| `NOTION_TAGS_DB_ID` | Blog (server) | The ID in your tags database URL |

Notes:

- Only variables starting with `NEXT_PUBLIC_` are sent to the browser. Never put a secret in one.
- `.env.local` is git-ignored. Never commit real keys; if a key leaks, regenerate it in the provider's dashboard.
- Without Pusher keys the site still works, but online Chess and Tic-Tac-Toe won't connect. Without Notion keys the blog won't load.

### 4. Run it

```bash
# from the repo root (runs every app through Turborepo)
yarn dev

# or just this app
cd apps/web && yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

Run inside `apps/web`:

| Command | What it does |
| --- | --- |
| `yarn dev` | Starts the dev server |
| `yarn build` | Production build |
| `yarn start` | Runs the production build |
| `yarn lint` | ESLint |
| `yarn type-check` | TypeScript check without building |

`dev` and `build` first run `scripts/copy-stockfish.mjs` (see [Chess engine](#chess-engine)).

## Project structure

This app is part of a Turborepo. Most UI lives in the shared `shadcn-ui` package; this app holds the pages and API routes.

```text
apps/web/
├── src/app/                 Pages and API routes (Next.js App Router)
│   ├── page.tsx             Home page
│   ├── layout.tsx           Root layout (fonts, dark-mode script)
│   ├── blog/                Blog pages
│   ├── games/               Games hub, chess, snake, tic-tac-toe
│   ├── learn/               Learn hub, typing game
│   ├── api/                 Server endpoints (see below)
│   └── icon.svg, favicon.ico, apple-icon.png   Site icons
├── scripts/copy-stockfish.mjs
└── public/                  Static files (public/stockfish is generated)

packages/shadcn-ui/          Shared components used by this app
├── my-uis/                  Site sections (Home, Snake, KeyQuest, Chess…)
├── OnlineTicTacToe/         Tic-Tac-Toe UI
├── components/ui/           shadcn/ui building blocks
├── lib/                     Game stores, chess rules, Pusher clients, Notion helpers
└── types/                   Shared TypeScript types
```

Components are imported from the package, e.g. `import { Header, SnakeGame } from "shadcn-ui";`.

## How the main features work

### Dark mode

A tiny script in `layout.tsx` applies the saved theme before the page is drawn, so there's no flash of light mode. The toggle lives in the header.

### Theme colours

Colours come from CSS variables in `packages/shadcn-ui/app/globals.css` (shadcn/ui style). The site's teal accent is `--brand`, available in Tailwind as `brand` (e.g. `text-brand`, `bg-brand/10`). Prefer these over hard-coded hex values.

### Blog

Posts and tags are read from two Notion databases using `@notionhq/client` (`packages/shadcn-ui/lib/notion.ts`). The token and database IDs come from the environment variables above.

### Chatbot and jokes

- The chatbot sends questions to `/api/chat`, which forwards them to the free [Pollinations](https://pollinations.ai) text API from the server.
- The joke button calls the free [Official Joke API](https://official-joke-api.appspot.com) directly from the browser.

### Online games (Chess and Tic-Tac-Toe)

1. A player creates a game and gets a short code to share.
2. The server keeps the game state and checks **every move** (turn order, legal moves), so players can't cheat.
3. Each move is broadcast to both players through a private [Pusher](https://pusher.com) channel. `/api/pusher/auth` only lets the two players of a game subscribe.

Players are identified by their Pusher connection, so refreshing the page leaves the game.

### Chess engine

The chess bots are [Stockfish](https://stockfishchess.org) running **in the browser** as a Web Worker (the 1.8 MB "lite single-threaded" WebAssembly build from the `stockfish` npm package).

- `scripts/copy-stockfish.mjs` copies the engine files into `public/stockfish/` before `dev` and `build`. That folder is git-ignored.
- Difficulty levels combine Stockfish's skill setting with some random moves on the easier levels (`packages/shadcn-ui/my-uis/Chess/use-stockfish.ts`).
- Stockfish is GPL-3.0; its licence is copied alongside the engine.

### Saved progress

Snake levels, KeyQuest scores and chess records are saved in the visitor's browser (`localStorage`). There are no accounts.

## API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/chat` | POST | Chatbot answers (proxied to Pollinations) |
| `/api/pusher/auth` | POST | Authorises a player for a private game channel |
| `/api/game/create` · `join` · `move` · `reset` · `leave` | POST | Tic-Tac-Toe actions |
| `/api/game/state?gameId=` | GET | Current Tic-Tac-Toe state |
| `/api/chess/create` · `join` · `move` · `resign` · `rematch` · `leave` | POST | Chess actions |
| `/api/chess/state?gameId=` | GET | Current chess state |

Request bodies are read with `readBody()` (`packages/shadcn-ui/lib/request-body.ts`) and every field is type-checked before use.

## Deployment



1. Set the environment variables from the table above in your hosting dashboard.
2. Build with `yarn build`. This also copies the chess engine into `public/`.

**Important for online games:** game rooms are kept **in server memory**. That works for `next dev` or a single always-on Node server, but on serverless hosting (like Vercel) requests can hit different instances and games can disappear. For production, move the stores in `lib/game-store.ts` and `lib/chess-store.ts` to a shared store such as Redis (for example Upstash's free tier).

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router) and [React 18](https://react.dev)
- [TypeScript](https://www.typescriptlang.org) and [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) components, [Framer Motion](https://www.framer.com/motion), [Lottie](https://lottiefiles.com) animations
- [Pusher](https://pusher.com) for real-time games
- [Notion API](https://developers.notion.com) for the blog
- [chess.js](https://github.com/jhlywa/chess.js), [react-chessboard](https://github.com/Clariity/react-chessboard) and [Stockfish](https://stockfishchess.org) for chess
- [random-words](https://www.npmjs.com/package/random-words), [txtgen](https://www.npmjs.com/package/txtgen) and [react-simple-keyboard](https://hodgef.com/simple-keyboard) for KeyQuest
- [zod](https://zod.dev) for validation
