#!/usr/bin/env node
/**
 * `bun run verify` (what CI runs): named steps in order, each timed; stops at the first failure and prints the table.
 * On GitHub Actions the table is also written to the job summary.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const node = process.execPath;
const TS = ["--experimental-strip-types", "--import", "./scripts/ts-ext-register.mjs"];
const bin = (name) => path.join(root, "node_modules", ".bin", name);

/** name, what it guards, command */
const STEPS = [
  ["check:codegen", "generated blocks = codegen-x pin, byte for byte", node, ["--experimental-strip-types", "scripts/sync-codegen.ts", "--check"]],
  ["check:rules", "UI8Kit rules = ui8kit/contract pin (sha256)", node, ["--experimental-strip-types", "scripts/check-rules.ts"]],
  ["check:blocks", "hand-written blocks: 0 raw utilities, primitives only", node, ["--experimental-strip-types", "scripts/check-blocks.ts"]],
  ["catalog:build", "catalog bundle, no tailwind-merge, size budget", node, ["scripts/catalog-size.mjs"]],
  ["px", "ui8px gate: lint DOM + classes, grid 8/4, aria", node, ["scripts/ui8px-gate.mjs"], { UI8PX_NO_BUILD: "1" }],
  ["test:node", "registry, page-spec v2, one source, theme", node, [...TS, "--test", "packages/theme/src/*.test.ts", "packages/blocks/src/manifest/*.node.test.ts"]],
  ["typecheck", "tsc --noEmit", bin("tsc"), ["--noEmit"]],
  ["test", "vitest: wireframes, DOM snapshot, shapes", bin("vitest"), ["run"]],
];

const results = [];
let failed = null;
for (const [name, what, cmd, args, env] of STEPS) {
  console.log(`\n▶ ${name}: ${what}`);
  const t0 = performance.now();
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });
  const ms = Math.round(performance.now() - t0);
  const ok = r.status === 0;
  results.push({ name, what, ms, ok });
  if (!ok) {
    failed = name;
    break;
  }
}

const sec = (ms) => `${(ms / 1000).toFixed(1)}s`;
const total = results.reduce((a, r) => a + r.ms, 0);
console.log("\nverify:");
for (const r of results) console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(14)} ${sec(r.ms).padStart(6)}  ${r.what}`);
for (const [name] of STEPS.slice(results.length)) console.log(`  skip ${name}`);
console.log(`  total ${sec(total)}${failed ? `, failed at ${failed}` : ""}`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = results.map((r) => `| ${r.ok ? "✅" : "❌"} | \`${r.name}\` | ${sec(r.ms)} | ${r.what} |`);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, ["| | step | time | guards |", "|---|---|---|---|", ...rows, "", `total ${sec(total)}`, ""].join("\n"));
}
process.exit(failed ? 1 : 0);
