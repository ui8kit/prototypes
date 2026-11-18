#!/usr/bin/env node
/**
 * Run the npm `ui8px` CLI. Prefer the workspace install, then bunx, then npx.
 * Do not vendor sources.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const localBin = path.join(root, "node_modules", ".bin", "ui8px");

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error && result.error.code === "ENOENT") {
    return null;
  }
  return result.status ?? 1;
}

if (fs.existsSync(localBin)) {
  process.exit(run(localBin, args) ?? 1);
}

const bunx = run("bunx", ["ui8px", ...args]);
if (bunx !== null) process.exit(bunx);

const npx = run("npx", ["--yes", "ui8px@^0.2.5", ...args]);
if (npx !== null) process.exit(npx);

console.error("ui8px is not installed. Run `bun install` (devDependency ui8px ^0.2.5).");
process.exit(2);
