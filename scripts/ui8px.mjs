#!/usr/bin/env node
/**
 * Run the ui8px CLI: the devDependency `ui8px` from npm (`^0.3.0`, published with provenance from ui8kit/ui8px-cli).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "node_modules", "ui8px", "dist", "index.js");

if (!fs.existsSync(entry)) {
  console.error("ui8px is not installed. Run `bun install --frozen-lockfile` (devDependency ui8px in package.json).");
  process.exit(2);
}
const result = spawnSync(process.execPath, [entry, ...process.argv.slice(2)], { cwd: root, stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
