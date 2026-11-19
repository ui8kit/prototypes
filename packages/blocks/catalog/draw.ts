// Every wireframe (block × variant × padding preset) as HTML, one section per line: the DOM snapshot that the kit cn
// (packages/blocks/src/manifest/wireframe-dom.test.ts) and the catalog cn (catalog/cn.test.ts) must both produce.
import { render } from "@testing-library/svelte";
import { CATALOG } from "../src/catalog";
import { BLOCKS, wireframeProps } from "../src/manifest";

const PADDINGS = [undefined, "compact", "standard", "spacious"] as const;
export const SNAPSHOT = "./wireframes.snap.html"; // relative to catalog/cn.test.ts

export function drawAll(): string {
  const lines: string[] = [];
  for (const b of BLOCKS)
    for (const v of b.variants)
      for (const padding of PADDINGS) {
        const { container, unmount } = render(CATALOG[b.id]!, { props: wireframeProps(b, v.id, padding ? { padding } : undefined) });
        lines.push(`<!-- ${b.id}/${v.id}/${padding ?? "unset"} -->`, container.innerHTML.replace(/<!---->/g, ""));
        unmount();
      }
  return lines.join("\n") + "\n";
}
