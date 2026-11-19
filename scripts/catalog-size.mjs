#!/usr/bin/env node
// Build the catalog bundle and report its size (raw and gzip, JS and CSS). Fails if the bundle pulls tailwind-merge or the
// kit's utils/cn.ts (the catalog's cn is kit-cn.ts, a dependency-free join) or anything of the app chrome. clsx stays: the
// Svelte 5 runtime itself uses it for class attributes (svelte/internal), not the kit.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const DIST = join(import.meta.dirname, "../packages/blocks/catalog/dist");
execFileSync("npx", ["vite", "build", "-c", "packages/blocks/catalog/vite.config.ts", "--logLevel", "warn"], { stdio: "inherit" });
const modules = JSON.parse(readFileSync(join(DIST, "modules.json"), "utf8"));
const bad = modules.filter((m) => /tailwind-merge|kit\/src\/utils\/cn\.ts$|apps\/blocks/.test(m));
if (bad.length) {
  console.error(`catalog: the bundle must not include:\n  ${bad.join("\n  ")}`);
  process.exit(1);
}
let js = [0, 0], css = [0, 0];
for (const f of readdirSync(DIST)) {
  if (!/\.(js|css)$/.test(f)) continue;
  const b = readFileSync(join(DIST, f));
  const t = f.endsWith(".css") ? css : js;
  t[0] += b.length; t[1] += gzipSync(b, { level: 9 }).length;
}
const kb = (n) => (n / 1024).toFixed(2);
console.log(`catalog: ${modules.length} modules; JS ${kb(js[0])} KiB (gzip ${kb(js[1])}), CSS ${kb(css[0])} KiB (gzip ${kb(css[1])}); no tailwind-merge`);
