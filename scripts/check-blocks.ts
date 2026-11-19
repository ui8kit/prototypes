/**
 * Structural discipline for the hand-written part of packages/blocks (`bun run check:blocks`).
 *
 * Fails when a hand-written `.svelte` file leaks raw utility classes (budget 0: utilities live in `classes.ts`), an inline
 * style, a forbidden radius / shadow / gradient / palette class, an interactive kit widget, or media outside
 * `shapes/Media.svelte`. A hand-written organism directory (none today: the organisms are generated) needs one `Block`
 * root, no Block in `{#each}`, no bare HTML, no literal copy, no builder marker and one sibling `<dir>.block.ts`;
 * `package.json` `ui8kit.blockRoot` lists exactly those directories plus `src/generated/svelte/blocks`.
 *
 * `packages/blocks/src/generated` is a verbatim copy of codegen-x/ui8kit packages/prototypes/out, checked byte for byte
 * by `scripts/sync-codegen.ts --check` (its rules run in codegen-x); it is not scanned here.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BLOCKS = path.join(ROOT, "packages", "blocks", "src");
const GENERATED = path.join(BLOCKS, "generated");
const GENERATED_ROOTS = ["generated/svelte/blocks"];
const MAX_RAW_UTILITIES = 0;
const SKIP_TOP = new Set(["layout", "shapes", "content", "manifest", "fixtures", "builder", "generated"]);
const MEDIA_FILES = new Set(["Media.svelte"]);

const UTILITY_TOKEN = new RegExp(
  "^(?:[a-z0-9-]+:)*(?:flex|inline-flex|grid|block|hidden|contents|sr-only|items-|justify-|content-|self-|gap-|p[trblxyse]?-|" +
    "m[trblxyse]?-|space-|size-|w-|h-|min-w-|min-h-|max-w-|max-h-|text-|font-|leading-|tracking-|bg-|border|rounded|shadow|" +
    "object-|aspect-|overflow-|relative|absolute|fixed|sticky|static|inset-|col-span-|row-span-|order-|basis-|grow|shrink|" +
    "container|mx-auto)",
);
const CLASS_LITERAL = /class\s*=\s*(?:"([^"]*)"|'([^']*)'|{\s*"([^"]*)"\s*}|{\s*'([^']*)'\s*})/g;
const CN_CALL = /\bcn\s*\(([\s\S]*?)\)/g;
const QUOTED = /["'`]([^"'`]+)["'`]/g;
const LOWER_TAG = /<([a-z][a-z0-9]*)\b/g;
const STYLE_ATTR = /\bstyle\s*=/;
const FORBIDDEN_CLASS =
  /\b(?:rounded-(?:sm|md|lg|xl|2xl|3xl)|shadow(?:-sm|-md|-lg|-xl)?|bg-gradient-|from-|via-|to-(?:r|l|t|b|tr|tl|br|bl)\b|bg-(?:red|blue|green|yellow|purple|pink|orange|zinc|slate|gray|neutral|stone)-\d+|text-(?:red|blue|green|yellow|purple|pink|orange)-\d+)\b/g;
const LITERAL_TEXT = />([^<{]*[A-Za-z][^<{]*)</g;
const LITERAL_ATTR = /\b(?:aria-label|alt|title|placeholder|label)\s*=\s*["']([^"']*[A-Za-z][^"']*)["']/g;
const ORGANISM_FORBIDDEN = /data-place|data-field|data-shape|data-ratio|data-mode|aria-hidden|\bmode\b|useMode|provideMode/g;
const KIT_INTERACTIVE = new Set([
  "Accordion", "Button", "Carousel", "Checkbox", "Dialog", "Disclosure", "Summary", "Form", "Icon", "Input", "Label", "Link",
  "Meter", "Progress", "Radio", "Select", "SelectOption", "SelectOptGroup", "Switch", "Tabs", "Text", "Textarea",
]);
const KIT_MEDIA = new Set(["Image", "Picture", "Source"]);
const KIT_IMPORT = /import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s+from\s+["']@ui8kit\/kit(?:\/[^"']+)?["']/g;

const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join("/");
const markupOf = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/g, " ");

function svelteFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".svelte"))
    .map((e) => path.join(e.parentPath, e.name))
    .filter((f) => !f.startsWith(GENERATED + path.sep))
    .sort();
}

function organismDirs(): Set<string> {
  return new Set(
    readdirSync(BLOCKS, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !SKIP_TOP.has(e.name))
      .filter((e) => readdirSync(path.join(BLOCKS, e.name)).some((f) => f.endsWith(".svelte")))
      .map((e) => e.name),
  );
}

function kitNames(source: string): string[] {
  return [...source.matchAll(KIT_IMPORT)].flatMap((m) =>
    (m[1] ?? m[2] ?? "").split(",").map((t) => t.trim().replace(/^type\s+/, "").split(" as ")[0]!.trim()).filter(Boolean),
  );
}

function rawUtilities(source: string): string[] {
  const tokens = (v: string) => v.split(/\s+/).filter((t) => UTILITY_TOKEN.test(t));
  const found: string[] = [];
  for (const m of source.matchAll(CLASS_LITERAL)) found.push(...tokens(m.slice(1).find((g) => g !== undefined) ?? ""));
  for (const m of source.matchAll(CN_CALL)) for (const q of m[1]!.matchAll(QUOTED)) found.push(...tokens(q[1]!));
  return found;
}

export function checkFile(file: string, organisms: Set<string>): string[] {
  const errors: string[] = [];
  const source = readFileSync(file, "utf8");
  const markup = markupOf(source);
  const r = rel(file);
  const organism = organisms.has(path.relative(BLOCKS, file).split(path.sep)[0]!);

  const raw = rawUtilities(source);
  if (raw.length > MAX_RAW_UTILITIES)
    errors.push(`${r}: ${raw.length} raw utility classes [${raw.join(", ")}]; budget is ${MAX_RAW_UTILITIES}. Move them to packages/blocks/src/classes.ts.`);
  if (STYLE_ATTR.test(markup)) errors.push(`${r}: inline style is not allowed`);
  const forbidden = source.match(FORBIDDEN_CLASS);
  if (forbidden) errors.push(`${r}: forbidden classes [${forbidden.join(", ")}]`);

  if (organism) {
    const opens = source.match(/<Block\b/g)?.length ?? 0;
    if (opens !== 1) errors.push(`${r}: expected exactly one Block root, found ${opens}`);
    if (/\{#each\b[\s\S]*?<Block\b/.test(source)) errors.push(`${r}: Block inside {#each} is not allowed`);
    const code = source.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    for (const marker of [...new Set(code.match(ORGANISM_FORBIDDEN) ?? [])].sort()) errors.push(`${r}: builder-only marker '${marker}' in an organism`);
    for (const m of markup.matchAll(LOWER_TAG)) if (!["script", "style"].includes(m[1]!)) errors.push(`${r}: bare HTML <${m[1]}>`);
    for (const m of markup.matchAll(LITERAL_TEXT)) if (m[1]!.trim()) errors.push(`${r}: literal text '${m[1]!.trim()}'`);
    for (const m of source.matchAll(LITERAL_ATTR)) errors.push(`${r}: literal naming text '${m[1]}'`);
  }

  const names = kitNames(source);
  if (organism && names.length) errors.push(`${r}: organisms must not import @ui8kit/kit; use layout shells and shapes`);
  const interactive = names.filter((n) => KIT_INTERACTIVE.has(n));
  if (interactive.length) errors.push(`${r}: interactive kit [${interactive.join(", ")}]; draw widgets as stacks / groups of rectangles`);
  const media = MEDIA_FILES.has(path.basename(file));
  if (names.some((n) => KIT_MEDIA.has(n)) && !media) errors.push(`${r}: Image / Picture / Source belong only in shapes/Media.svelte`);
  for (const name of [...KIT_INTERACTIVE, ...KIT_MEDIA].sort()) {
    if (!new RegExp(`<${name}\\b`).test(markup)) continue;
    if (KIT_INTERACTIVE.has(name)) errors.push(`${r}: interactive markup <${name}>`);
    else if (!media) errors.push(`${r}: media markup <${name}> outside shapes/Media.svelte`);
  }
  return errors;
}

export function checkManifests(organisms: Set<string>): string[] {
  const errors: string[] = [];
  if (!existsSync(path.join(GENERATED, "manifest.json"))) errors.push("packages/blocks/src/generated/manifest.json missing: run scripts/sync-codegen.ts");
  for (const name of [...organisms].sort()) {
    const dir = path.join(BLOCKS, name);
    const manifests = readdirSync(dir).filter((f) => f.endsWith(".block.ts"));
    if (manifests.length !== 1) errors.push(`${rel(dir)}: expected exactly one *.block.ts, found ${manifests.join(", ") || "none"}`);
    else if (manifests[0] !== `${name}.block.ts`) errors.push(`${rel(dir)}: manifest file should be ${name}.block.ts, found ${manifests[0]}`);
  }
  const pkg = JSON.parse(readFileSync(path.join(ROOT, "packages", "blocks", "package.json"), "utf8")) as { ui8kit?: { blockRoot?: string[] } };
  const listed = new Set((pkg.ui8kit?.blockRoot ?? []).map((x) => x.replace(/^src\//, "")));
  const expected = new Set([...organisms, ...GENERATED_ROOTS]);
  if (listed.size !== expected.size || [...listed].some((x) => !expected.has(x)))
    errors.push(`packages/blocks/package.json ui8kit.blockRoot [${[...listed].sort()}] does not match organism dirs [${[...expected].sort()}]`);
  return errors;
}

if (import.meta.main ?? process.argv[1] === import.meta.filename) {
  const files = svelteFiles(BLOCKS);
  if (!files.length || !statSync(BLOCKS).isDirectory()) {
    console.error("check-blocks: no block svelte files");
    process.exit(1);
  }
  const organisms = organismDirs();
  const errors = [...checkManifests(organisms), ...files.flatMap((f) => checkFile(f, organisms))];
  console.log(`check-blocks: ${files.length} hand-written files, organism dirs: ${[...organisms].join(", ") || "(none)"}, raw utility budget ${MAX_RAW_UTILITIES}`);
  if (errors.length) {
    console.error(`check-blocks failed:\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  console.log("check-blocks: ok");
}
