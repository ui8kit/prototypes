#!/usr/bin/env node
/**
 * Run ui8px from node_modules, else the vendored TypeScript sources.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const localBin = path.join(root, "node_modules", ".bin", "ui8px");
const vendorEntry = path.join(root, "tools", "ui8px", "src", "index.ts");

function run(command, commandArgs, extraEnv = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (result.error && result.error.code === "ENOENT") {
    return null;
  }
  return result.status ?? 1;
}

if (fs.existsSync(vendorEntry)) {
  const status = run(process.execPath, [
    "--experimental-strip-types",
    "--disable-warning=ExperimentalWarning",
    vendorEntry,
    ...args,
  ]);
  process.exit(status ?? 1);
}

if (fs.existsSync(localBin)) {
  process.exit(run(localBin, args) ?? 1);
}

const npxStatus = run("npx", ["--yes", "ui8px@0.2.5", ...args]);
if (npxStatus !== null) {
  process.exit(npxStatus);
}

console.error("ui8px is not installed and tools/ui8px is missing.");
process.exit(2);
