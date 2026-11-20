// Every wireframe of a block (variant × padding preset, then × the align values other than the variant's own default) as
// HTML, one section per line: the DOM snapshot (catalog/snapshots/<item>.snap.html, one file per block) that the kit cn
// (packages/blocks/src/manifest/wireframe-dom.test.ts) and the catalog cn (catalog/cn.test.ts) must both produce.
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/svelte";
import { CATALOG } from "../src/catalog";
import { BLOCKS, variantSettings, wireframeProps, type BlockManifest } from "../src/manifest";

const PADDINGS = [undefined, "compact", "standard", "spacious"] as const;
// vitest runs from the repo root (as catalog/cn.test.ts assumes)
const SNAPSHOTS = resolve(process.cwd(), "packages/blocks/catalog/snapshots");
/** the snapshot file of a block (absolute path) */
export const snapshotOf = (item: string): string => resolve(SNAPSHOTS, `${item}.snap.html`);
/** the items that have a snapshot file on disk (a removed block leaves a stale file: the tests compare this with BLOCKS) */
export const snapshotItems = (): string[] => readdirSync(SNAPSHOTS).filter((f) => f.endsWith(".snap.html")).map((f) => f.slice(0, -".snap.html".length)).sort();

function draw(b: BlockManifest, variant: string, props: Record<string, unknown>, label: string, lines: string[]): void {
  const { container, unmount } = render(CATALOG[b.id]!, { props });
  lines.push(`<!-- ${b.id}/${variant}/${label} -->`, container.innerHTML.replace(/<!---->/g, ""));
  unmount();
}

export function drawBlock(b: BlockManifest): string {
  const lines: string[] = [];
  for (const v of b.variants)
    for (const padding of PADDINGS) draw(b, v.id, wireframeProps(b, v.id, padding ? { padding } : undefined), padding ?? "unset", lines);
  // the align values: only for a block with the align setting (split-simple has none)
  if (b.settings.align) for (const v of b.variants)
    for (const align of (["start", "center", "end"] as const).filter((a) => a !== (variantSettings(b, v.id).align ?? "start")))
      draw(b, v.id, wireframeProps(b, v.id, { align }), `align-${align}`, lines);
  return lines.join("\n") + "\n";
}

export { BLOCKS };
