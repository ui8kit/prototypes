#!/usr/bin/env node
/**
 * Aggregate block manifests into docs/fields.json and docs/fields.md.
 * Shows which slots/kinds repeat so later unification has a scoreboard.
 *
 *   node --experimental-strip-types --import ./scripts/ts-ext-register.mjs scripts/fields-summary.mjs
 *   node … scripts/fields-summary.mjs --check   # fail if docs are stale
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BLOCKS,
  SHAPE_KINDS,
  SLOT_KINDS,
  fieldPaths,
  formatCount,
  resolveCount,
  shapeCounts,
} from "../packages/blocks/src/manifest/index.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(ROOT, "docs", "fields.json");
const MD_PATH = join(ROOT, "docs", "fields.md");
const check = process.argv.includes("--check");

function recordKind(map, kind, id) {
  const row = map[kind] ?? { blocks: [], totalDefault: 0 };
  if (!row.blocks.includes(id)) row.blocks.push(id);
  map[kind] = row;
}

const kinds = Object.fromEntries(SLOT_KINDS.map((kind) => [kind, { blocks: [], totalDefault: 0 }]));
const paths = {};

for (const block of BLOCKS) {
  const counts = shapeCounts(block.slots);
  for (const kind of SHAPE_KINDS) {
    if (counts[kind] > 0) {
      recordKind(kinds, kind, block.id);
      kinds[kind].totalDefault += counts[kind];
    }
  }
  for (const field of fieldPaths(block.slots)) {
    const row = paths[field.path] ?? { kind: field.kind, blocks: [], counts: [] };
    if (row.kind !== field.kind) {
      throw new Error(`path ${field.path} kind mismatch: ${row.kind} vs ${field.kind}`);
    }
    row.blocks.push(block.id);
    row.counts.push({ id: block.id, count: field.count, default: resolveCount(field.count) });
    paths[field.path] = row;
    if (field.kind === "item") {
      recordKind(kinds, "item", block.id);
      kinds.item.totalDefault += resolveCount(field.count);
    }
  }
}

for (const kind of SLOT_KINDS) kinds[kind].blocks.sort();

const repeatedKinds = SLOT_KINDS.filter((kind) => kinds[kind].blocks.length >= 2);
const repeatedPaths = Object.keys(paths)
  .filter((path) => paths[path].blocks.length >= 2)
  .sort();

const categories = {};
for (const block of BLOCKS) {
  (categories[block.category] ??= []).push(block.id);
}

const summary = {
  blocks: BLOCKS.map((block) => ({
    id: block.id,
    category: block.category,
    label: block.label,
    slots: block.slots,
    variants: block.variants ?? [],
    shapeCounts: shapeCounts(block.slots),
  })),
  categories,
  kinds,
  paths,
  repeatedKinds,
  repeatedPaths,
};

function mdTable(headers, rows) {
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map(line)].join("\n");
}

const kindRows = SLOT_KINDS.filter((kind) => kinds[kind].blocks.length > 0).map((kind) => [
  kind,
  String(kinds[kind].blocks.length),
  kinds[kind].blocks.join(", "),
  String(kinds[kind].totalDefault),
]);

const pathRows = Object.keys(paths)
  .sort()
  .map((path) => {
    const row = paths[path];
    const cardinality = [...new Set(row.counts.map((c) => formatCount(c.count)))].join("; ");
    return [path, row.kind, String(row.blocks.length), row.blocks.join(", "), cardinality];
  });

const markdown = `# Field summary

Generated from \`*.block.ts\` manifests by \`scripts/fields-summary.mjs\`.
This is the scoreboard for later unification: which slots and kinds repeat
across the prototype library.

Blocks: **${BLOCKS.length}**. Kinds in two or more blocks: ${
    repeatedKinds.length ? repeatedKinds.map((k) => `\`${k}\``).join(", ") : "_none yet_"
  }.
Shared field paths: ${
    repeatedPaths.length ? repeatedPaths.map((p) => `\`${p}\``).join(", ") : "_none yet_"
  }.

## Kinds

How many blocks render each shape (flattened; item groups multiply nested fields).
\`totalDefault\` is the sum of default counts across the library.

${mdTable(["Kind", "Blocks", "Ids", "totalDefault"], kindRows)}

## Field paths

Dot-paths as declared on each manifest (\`items.avatar\` is a field inside the repeating group).

${mdTable(["Path", "Kind", "Blocks", "Ids", "Cardinality"], pathRows)}

## Per block

${BLOCKS.map((block) => {
  const counts = shapeCounts(block.slots);
  const shapes = SHAPE_KINDS.filter((kind) => counts[kind] > 0)
    .map((kind) => `${kind} × ${counts[kind]}`)
    .join(", ");
  const slots = fieldPaths(block.slots)
    .map((field) => `- \`${field.path}\` (${field.kind}, ${formatCount(field.count)})`)
    .join("\n");
  const variants = (block.variants ?? []).map((v) => v.id).join(", ") || "—";
  return `### \`${block.id}\`

- Category: \`${block.category}\`
- Label: ${block.label}
- Variants: ${variants}
- Flattened shapes: ${shapes || "—"}

${slots}`;
}).join("\n\n")}
`;

function same(path, next) {
  try {
    return readFileSync(path, "utf8") === next;
  } catch {
    return false;
  }
}

const jsonText = `${JSON.stringify(summary, null, 2)}\n`;

if (check) {
  const stale = [];
  if (!same(JSON_PATH, jsonText)) stale.push("docs/fields.json");
  if (!same(MD_PATH, markdown)) stale.push("docs/fields.md");
  if (stale.length) {
    console.error(`fields-summary: stale ${stale.join(", ")}. Run without --check and commit.`);
    process.exit(1);
  }
  console.log("fields-summary: docs up to date");
  process.exit(0);
}

writeFileSync(JSON_PATH, jsonText);
writeFileSync(MD_PATH, markdown);
console.log(`fields-summary: wrote docs/fields.json and docs/fields.md (${BLOCKS.length} blocks)`);
