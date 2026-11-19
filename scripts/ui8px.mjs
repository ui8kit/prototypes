#!/usr/bin/env node
/**
 * Run the ui8px CLI. It is a git-pinned devDependency (`github:ui8kit/ui8px-cli#<commit>`, not published to npm yet):
 * a git install carries the TypeScript sources only, so the first run builds `node_modules/ui8px/dist` with this repo's
 * TypeScript. Do not vendor its sources.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = path.join(root, "node_modules", "ui8px");
const entry = path.join(pkg, "dist", "index.js");

if (!fs.existsSync(pkg)) {
  console.error("ui8px is not installed. Run `bun install` (devDependency ui8px, git-pinned in package.json).");
  process.exit(2);
}
if (!fs.existsSync(entry)) {
  const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
  const built = spawnSync(process.execPath, [tsc, "-p", path.join(pkg, "tsconfig.build.json")], { cwd: root, stdio: "inherit" });
  if (built.status !== 0 || !fs.existsSync(entry)) {
    console.error("ui8px: building node_modules/ui8px/dist failed");
    process.exit(2);
  }
}
const result = spawnSync(process.execPath, [entry, ...process.argv.slice(2)], { cwd: root, stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
