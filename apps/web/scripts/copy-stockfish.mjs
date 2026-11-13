// Copies the Stockfish chess engine (lite, single-threaded WASM build) into public/
// so the browser can load it as a Web Worker. Runs before `dev` and `build`.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const engineDir = join(dirname(require.resolve("stockfish/package.json")), "bin");
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "stockfish");

mkdirSync(outDir, { recursive: true });
for (const file of ["stockfish-19-lite-single.js", "stockfish-19-lite-single.wasm"]) {
  copyFileSync(join(engineDir, file), join(outDir, file));
}
// Stockfish is GPL-3.0: ship its licence alongside the engine
copyFileSync(join(engineDir, "..", "Copying.txt"), join(outDir, "COPYING.txt"));
console.log("Copied Stockfish engine to public/stockfish");
