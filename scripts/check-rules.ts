/**
 * The UI8Kit rules (`.cursor/rules/*`, `.cursor/skills/*`) are a verbatim copy of ui8kit/contract (AGENTS.md: "copy as-is").
 * `rules.lock.json` pins the contract commit and the sha256 of every copied file; `bun run check:rules` fails on an edit,
 * a missing file or an unlisted file in a copied directory. Local rules (not from the contract) are listed under `local`.
 *
 *   node --experimental-strip-types scripts/check-rules.ts                       check
 *   node --experimental-strip-types scripts/check-rules.ts --update <contract>   copy from a ui8kit/contract checkout, re-pin
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOCK = path.join(ROOT, "rules.lock.json");
const DIRS = [".cursor/rules", ".cursor/skills"];
type Lock = { repo: string; commit: string; files: Record<string, string>; local: string[] };

const sha = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");
const walk = (base: string, dir: string): string[] =>
  existsSync(path.join(base, dir))
    ? readdirSync(path.join(base, dir), { recursive: true, withFileTypes: true })
        .filter((e) => e.isFile())
        .map((e) => path.relative(base, path.join(e.parentPath, e.name)).split(path.sep).join("/"))
        .sort()
    : [];

function update(from: string): void {
  const lock: Lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, "utf8")) : { repo: "https://github.com/ui8kit/contract.git", commit: "", files: {}, local: [] };
  const commit = execFileSync("git", ["-C", from, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const files: Record<string, string> = {};
  for (const rel of DIRS.flatMap((d) => walk(from, d))) {
    mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true });
    copyFileSync(path.join(from, rel), path.join(ROOT, rel));
    files[rel] = sha(path.join(ROOT, rel));
  }
  writeFileSync(LOCK, JSON.stringify({ ...lock, commit, files }, null, 2) + "\n");
  console.log(`check-rules: ${Object.keys(files).length} files pinned at ui8kit/contract ${commit.slice(0, 12)}`);
}

function check(): number {
  const lock: Lock = JSON.parse(readFileSync(LOCK, "utf8"));
  const errors: string[] = [];
  for (const [rel, want] of Object.entries(lock.files)) {
    const file = path.join(ROOT, rel);
    if (!existsSync(file)) errors.push(`${rel}: missing (pinned from ui8kit/contract ${lock.commit.slice(0, 12)})`);
    else if (sha(file) !== want) errors.push(`${rel}: edited; the rules are a verbatim copy of ui8kit/contract: change them there, then --update`);
  }
  const known = new Set([...Object.keys(lock.files), ...lock.local]);
  for (const rel of DIRS.flatMap((d) => walk(ROOT, d))) if (!known.has(rel)) errors.push(`${rel}: not in rules.lock.json (contract copy or local?)`);
  if (errors.length) {
    console.error(`check-rules failed:\n  ${errors.join("\n  ")}`);
    return 1;
  }
  console.log(`check-rules: ${Object.keys(lock.files).length} files = ui8kit/contract ${lock.commit.slice(0, 12)}, ${lock.local.length} local`);
  return 0;
}

const i = process.argv.indexOf("--update");
if (i >= 0) update(path.resolve(process.argv[i + 1] ?? "."));
else process.exitCode = check();
