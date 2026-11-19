#!/usr/bin/env node
/**
 * The ui8px gate (`bun run px`): ui8px lint, validate grid, patterns and aria over what the blocks really draw.
 *
 * - lint: the rendered wireframes (`packages/blocks/catalog/wireframes.snap.html`: every block × variant × padding preset,
 *   checked against the live render by vitest) and the class strings of `classes.ts` (`.ui8px/extract/classes.html`,
 *   written by scripts/px-extract.ts from the imported module);
 * - validate grid: the compiled catalog stylesheet (`packages/blocks/catalog/dist/catalog.css`: Tailwind output plus
 *   tokens.css) and the density steps (`.ui8px/extract/density.css`): 8px in layout scope, 4px in the controls scope
 *   (`.ui8px/policy/scopes.json`: the badge);
 * - blocking rules and the ratchet: `.ui8px/gate.json` (max 0).
 *
 * `UI8PX_NO_BUILD=1` skips the catalog build (scripts/verify runs it as its own step first).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gate = JSON.parse(fs.readFileSync(path.join(root, ".ui8px", "gate.json"), "utf8"));
const reports = path.join(root, ".ui8px", "reports");
const runner = path.join(root, "scripts", "ui8px.mjs");
const SNAPSHOT = "packages/blocks/catalog/wireframes.snap.html";
const CATALOG_CSS = "packages/blocks/catalog/dist/catalog.css";
const LINT_INPUTS = [SNAPSHOT, ".ui8px/extract"];
const GRID_INPUTS = [CATALOG_CSS, ".ui8px/extract/density.css"];

function run(command, args, quiet = false) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  if (!quiet && result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return { status: result.status ?? 1, stdout: result.stdout ?? "" };
}
function fail(message) {
  console.error(`ui8px gate: ${message}`);
  process.exit(1);
}
const ui8px = (args, quiet) => run(process.execPath, [runner, ...args], quiet);

if (run(process.execPath, ["--experimental-strip-types", "--import", "./scripts/ts-ext-register.mjs", "scripts/px-extract.ts"]).status !== 0) fail("px:extract failed");
if (process.env.UI8PX_NO_BUILD !== "1" || !fs.existsSync(path.join(root, CATALOG_CSS))) {
  if (run("node", ["scripts/catalog-size.mjs"]).status !== 0) fail("catalog build failed");
}
fs.mkdirSync(reports, { recursive: true });

const max = Number(process.env.UI8PX_MAX ?? gate.max ?? 0);
const blocking = new Set(gate.blocking);

const lint = ui8px(["lint", ...LINT_INPUTS, "--json"], true);
let diagnostics;
try {
  diagnostics = JSON.parse(lint.stdout.trim() || "{}").diagnostics ?? [];
} catch {
  fail(`ui8px lint did not return JSON\n${lint.stdout}`);
}
fs.writeFileSync(path.join(reports, "lint.json"), `${JSON.stringify({ diagnostics }, null, 2)}\n`);
ui8px(["lint", ...LINT_INPUTS]);
const blocked = diagnostics.filter((d) => blocking.has(d.rule));
console.log(`ui8px lint: ${diagnostics.length} diagnostics, ${blocked.length} blocking`);
if (blocked.length > max) fail(`lint over max ${max}: ${blocked.length} blocking findings`);

for (const input of GRID_INPUTS) {
  const out = path.join(".ui8px", "reports", `grid.${path.basename(input)}.json`);
  const grid = ui8px(["validate", "grid", "--input", input, "--output", out, "--verbose"]);
  if (grid.status !== 0 && blocking.has("GRID")) fail(`validate grid failed on ${input} (${out})`);
}

const patterns = ui8px(["validate", "patterns", ...LINT_INPUTS, "--min-count", "2", "--output", ".ui8px/reports/patterns.json"], true);
console.log(`ui8px validate patterns exit ${patterns.status} (report only)`);

if (ui8px(["validate", "aria", ...LINT_INPUTS, "--package", "package.json"]).status !== 0) fail("validate aria failed");
console.log("ui8px gate: ok");
