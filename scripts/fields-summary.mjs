#!/usr/bin/env node
/**
 * Aggregate block content contracts into docs/fields.json and docs/fields.md.
 * Scoreboard for later unification: which content fields and record types repeat.
 * Variants are layout-only and listed per block; they never fork the schema.
 *
 *   node --experimental-strip-types --import ./scripts/ts-ext-register.mjs scripts/fields-summary.mjs
 *   node … scripts/fields-summary.mjs --check   # fail if docs are stale
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BLOCKS,
  CONTENT_KINDS,
  SHAPE_KINDS,
  defaultVariantId,
  fieldPaths,
  formatCount,
  recordTypes,
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

const kinds = Object.fromEntries([...CONTENT_KINDS, "record"].map((kind) => [kind, { blocks: [], totalDefault: 0 }]));
const paths = {};
const records = {};

for (const block of BLOCKS) {
  for (const field of fieldPaths(block.content)) {
    const n = resolveCount(field.count);
    const row = paths[field.path] ?? { kind: field.kind, record: field.record, blocks: [], counts: [] };
    if (row.kind !== field.kind) {
      throw new Error(`path ${field.path} kind mismatch: ${row.kind} vs ${field.kind}`);
    }
    row.blocks.push(block.id);
    row.counts.push({ id: block.id, count: field.count, default: n });
    paths[field.path] = row;
    recordKind(kinds, field.kind, block.id);
    kinds[field.kind].totalDefault += n;
  }
  for (const rec of recordTypes(block.content)) {
    const row = records[rec.name] ?? { blocks: [], path: rec.path, fields: rec.fields };
    if (!row.blocks.includes(block.id)) row.blocks.push(block.id);
    row.path = rec.path;
    row.fields = rec.fields;
    records[rec.name] = row;
  }
}

for (const kind of Object.keys(kinds)) kinds[kind].blocks.sort();

const repeatedKinds = [...CONTENT_KINDS, "record"].filter((kind) => kinds[kind].blocks.length >= 2);
const repeatedPaths = Object.keys(paths)
  .filter((path) => paths[path].blocks.length >= 2)
  .sort();
const repeatedRecords = Object.keys(records)
  .filter((name) => records[name].blocks.length >= 2)
  .sort();

const categories = {};
for (const block of BLOCKS) {
  (categories[block.category] ??= []).push(block.id);
}

const summary = {
  principle: "simple content, interchangeable variants, full rendering of the contract",
  blocks: BLOCKS.map((block) => ({
    id: block.id,
    category: block.category,
    label: block.label,
    content: block.content,
    variants: block.variants,
    defaultVariant: defaultVariantId(block),
    shapeCounts: shapeCounts(block.content),
  })),
  categories,
  kinds,
  paths,
  records,
  repeatedKinds,
  repeatedPaths,
  repeatedRecords,
};

function mdTable(headers, rows) {
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map(line)].join("\n");
}

const kindRows = [...CONTENT_KINDS, "record"]
  .filter((kind) => kinds[kind].blocks.length > 0)
  .map((kind) => [
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
    const extra = row.record ? ` (${row.record})` : "";
    return [path, `${row.kind}${extra}`, String(row.blocks.length), row.blocks.join(", "), cardinality];
  });

const recordRows = Object.keys(records)
  .sort()
  .map((name) => {
    const row = records[name];
    const fields = row.fields.map((f) => f.id).join(", ");
    return [name, String(row.blocks.length), row.blocks.join(", "), row.path, fields];
  });

const markdown = `# Field summary

Generated from \`*.block.ts\` content contracts by \`scripts/fields-summary.mjs\`.
Scoreboard for later unification: which **content** fields and record types repeat.
Variants are layout-only (same schema, full rendering in every variant). See
\`docs/content-contract.md\`.

Blocks: **${BLOCKS.length}**. Content kinds in two or more blocks: ${
    repeatedKinds.length ? repeatedKinds.map((k) => `\`${k}\``).join(", ") : "_none yet_"
  }.
Shared field paths: ${
    repeatedPaths.length ? repeatedPaths.map((p) => `\`${p}\``).join(", ") : "_none yet_"
  }.
Shared record types: ${
    repeatedRecords.length ? repeatedRecords.map((p) => `\`${p}\``).join(", ") : "_none yet_"
  }.

## Content kinds

Named fields of the contract (not layout). \`totalDefault\` is the sum of default
counts across the library.

${mdTable(["Kind", "Blocks", "Ids", "totalDefault"], kindRows)}

## Field paths

Dot-paths as declared on each manifest (\`members.avatar\` is a field of the
\`teamMember\` record). Different entities (later: price vs duration) stay on
separate record types, not a universal item.

${mdTable(["Path", "Kind", "Blocks", "Ids", "Cardinality"], pathRows)}

${
  recordRows.length
    ? `## Record types

${mdTable(["Type", "Blocks", "Ids", "Path", "Fields"], recordRows)}

`
    : ""
}## Per block

${BLOCKS.map((block) => {
  const counts = shapeCounts(block.content);
  const shapes = SHAPE_KINDS.filter((kind) => counts[kind] > 0)
    .map((kind) => `${kind} × ${counts[kind]}`)
    .join(", ");
  const fields = fieldPaths(block.content)
    .map((field) => {
      const rec = field.record ? `, record ${field.record}` : "";
      return `- \`${field.path}\` (${field.kind}${rec}, ${formatCount(field.count)})`;
    })
    .join("\n");
  const variants = block.variants.map((v) => `\`${v.id}\`${v.default ? " (default)" : ""}`).join(", ");
  const layout = block.variants
    .map((v) => Object.entries(v.layout).map(([k, val]) => `${k}=${val}`).join(", "))
    .join("; ");
  return `### \`${block.id}\`

- Category: \`${block.category}\`
- Label: ${block.label}
- Variants (layout only): ${variants}
- Layout axes: ${layout}
- Flattened shapes: ${shapes || "—"}

${fields}`;
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
