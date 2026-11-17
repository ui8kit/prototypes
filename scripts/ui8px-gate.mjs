#!/usr/bin/env node
/**
 * Extract Svelte/TS class maps, then run ui8px lint + validate grid/patterns/aria.
 * Blocking rules follow .ui8px/gate.json (max 0).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gatePath = path.join(root, ".ui8px", "gate.json");
const lintJsonPath = path.join(root, ".ui8px", "reports", "lint.json");
const runner = path.join(root, "scripts", "ui8px.mjs");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return { status: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

const extract = run("python3", [path.join(root, "scripts", "ui8px-extract.py")]);
if (extract.status !== 0) fail("ui8px extract failed");

const gate = JSON.parse(fs.readFileSync(gatePath, "utf8"));
const max = Number(process.env.UI8PX_MAX ?? gate.max ?? 0);
const blocking = new Set(gate.blocking ?? ["UI8PX001", "UI8PX003", "UI8PX005", "GRID"]);

fs.mkdirSync(path.dirname(lintJsonPath), { recursive: true });

const lintJson = run(process.execPath, [runner, "lint", ".ui8px/extract", "--json"]);
let lintResult = { diagnostics: [] };
try {
  lintResult = JSON.parse(lintJson.stdout.trim() || "{}");
} catch {
  fail(`ui8px lint did not return JSON\n${lintJson.stdout}\n${lintJson.stderr}`, 2);
}
fs.writeFileSync(lintJsonPath, `${JSON.stringify(lintResult, null, 2)}\n`);
console.log("--- ui8px lint ---");
run(process.execPath, [runner, "lint", ".ui8px/extract"]);

const blockedLint = (lintResult.diagnostics ?? []).filter((item) => blocking.has(item.rule));
console.log(`ui8px lint: ${lintResult.diagnostics?.length ?? 0} diagnostics, ${blockedLint.length} blocking`);
if (blockedLint.length > max) {
  fail(`ui8px lint over max ${max}: ${blockedLint.length} blocking findings`);
}

const grid = run(process.execPath, [
  runner,
  "validate",
  "grid",
  "--input",
  ".ui8px/class-map.json",
  "--output",
  ".ui8px/reports/class-map.backlog.json",
]);
if (grid.status !== 0 && blocking.has("GRID")) {
  fail("ui8px validate grid failed");
}

const patterns = run(process.execPath, [
  runner,
  "validate",
  "patterns",
  ".ui8px/extract",
  "--min-count",
  "2",
  "--output",
  ".ui8px/reports/patterns.json",
]);
console.log(`ui8px validate patterns exit ${patterns.status}`);

const aria = run(process.execPath, [
  runner,
  "validate",
  "aria",
  ".ui8px/extract",
  "--package",
  "package.json",
]);
if (aria.status !== 0) fail("ui8px validate aria failed");

console.log("ui8px gate: ok");
