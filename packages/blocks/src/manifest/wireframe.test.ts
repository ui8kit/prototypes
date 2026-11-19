/**
 * The generated wireframes of the catalog: rectangles only. Every block × variant draws every place of its contract as a
 * shape with data-place / data-field (the inspector), no words, no image, no link; the padding setting and the list width.
 */
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { CATALOG } from "../catalog";
import { BLOCKS, BLOCK_BY_ID } from "./registry";
import { bind, variantSettings, wireframeProps, type BlockSettings } from "./types";

function wireframe(item: string, variant: string, settings?: BlockSettings): HTMLElement {
  const { container } = render(CATALOG[item]!, { props: wireframeProps(BLOCK_BY_ID[item]!, variant, settings) });
  return container.querySelector("section") as HTMLElement;
}
const all = (root: Element, sel: string) => [...root.querySelectorAll(sel)];

describe("catalog", () => {
  it("CATALOG and the registry name the same items", () => {
    expect(Object.keys(CATALOG).sort()).toEqual(BLOCKS.map((b) => b.id).sort());
  });
});

describe.each(BLOCKS.flatMap((b) => b.variants.map((v) => [b.id, v.id] as const)))("%s / %s", (item, variant) => {
  const block = BLOCK_BY_ID[item]!;

  it("every place of the contract is a shape bound by data-place / data-field", () => {
    const s = wireframe(item, variant);
    const items = block.wireframe.items;
    for (const p of block.places)
      for (let i = 0; i < (p.list ? items : 1); i++) {
        const { place, field } = bind(block, p.place, i);
        const el = all(s, `[data-place="${place}"]`).find((e) => e.getAttribute("data-field") === field);
        expect(el, `${place} ${field}`).toBeTruthy();
        expect(el!.hasAttribute("data-shape")).toBe(true);
        expect(el!.getAttribute("aria-hidden")).toBe("true");
      }
    expect(new Set(all(s, "[data-place]").map((e) => e.getAttribute("data-place")))).toEqual(new Set(block.places.map((p) => p.place)));
  });

  it("rectangles only: no words, images, links or buttons", () => {
    const s = wireframe(item, variant);
    expect((s.textContent ?? "").trim()).toBe("");
    expect(all(s, "img, a, button, h1, h2, h3, p")).toHaveLength(0);
    // a list place is drawn once per wireframe item (block.wireframe.items), in a list
    for (const p of block.places.filter((x) => x.list)) expect(all(s, `li [data-place="${p.place}"], li[data-place="${p.place}"]`), p.place).toHaveLength(block.wireframe.items);
    if (block.places.some((x) => x.list)) expect(all(s, "ul > li")).toHaveLength(block.wireframe.items);
  });
});

describe("section padding (theme → padding setting)", () => {
  const PRESETS = { compact: ["py-8", "lg:py-16"], standard: ["py-16", "lg:py-32"], spacious: ["py-24", "lg:py-40"] } as const;
  it.each(BLOCKS.flatMap((b) => b.variants.map((v) => [b.id, v.id] as const)))("%s / %s: every preset", (item, variant) => {
    for (const [padding, cls] of Object.entries(PRESETS)) {
      const s = wireframe(item, variant, { padding: padding as never });
      for (const c of cls) expect(s.classList.contains(c), `${padding} ${c}`).toBe(true);
    }
    for (const c of PRESETS.standard) expect(wireframe(item, variant).classList.contains(c)).toBe(true);
  });
});

// every block with a list place: the list is a full-width grid in a stretching column
const LISTS = BLOCKS.filter((b) => b.places.some((p) => p.list)).flatMap((b) => b.variants.map((v) => [b.id, v.id] as const));
describe.runIf(LISTS.length > 0)("list width", () => {
  it.each(LISTS)("%s / %s: the list is a full-width grid in a stretching column", (item, variant) => {
    const ul = wireframe(item, variant).querySelector("ul")!;
    expect(ul.classList.contains("w-full")).toBe(true);
    expect(ul.classList.contains("grid")).toBe(true);
    expect(ul.parentElement!.classList.contains("items-stretch")).toBe(true);
  });
});

describe("align setting (start | center | end, logical: docs/adr/0002-align-as-setting.md)", () => {
  const ITEMS = { start: "items-start", center: "items-center", end: "items-end" } as const;
  it.each(BLOCKS.flatMap((b) => b.variants.flatMap((v) => (["start", "center", "end"] as const).map((a) => [b.id, v.id, a] as const))))("%s / %s / %s", (item, variant, align) => {
    const s = wireframe(item, variant, { align });
    const title = s.querySelector('[data-place="title"]')!;
    expect(title.parentElement!.classList.contains(ITEMS[align]), title.parentElement!.className).toBe(true);
    for (const text of all(s, '[data-shape="text"]')) expect(text.classList.contains(ITEMS[align]), text.className).toBe(true);
    // logical classes only: nothing pins a physical side
    const tokens = all(s, "[class]").flatMap((e) => [...e.classList]);
    expect(tokens.filter((t) => /^(?:[a-z0-9-]+:)*(?:text-(?:left|right)|-?(?:ml|mr|pl|pr|left|right)-\S+|float-(?:left|right))$/.test(t))).toEqual([]);
  });

  // the variant default (contract variants[].settings.align, e.g. a centred composition) is drawn when no align is saved,
  // the contract default (start) otherwise; every saved align overrides it
  it.each(BLOCKS.flatMap((b) => b.variants.map((v) => [b.id, v.id] as const)))("%s / %s: the variant default, then the prop", (item, variant) => {
    const b = BLOCK_BY_ID[item]!;
    const want = variantSettings(b, variant).align ?? "start";
    expect(want).toBe(b.variants.find((v) => v.id === variant)!.settings?.align ?? b.settings.align!.default);
    const title = wireframe(item, variant).querySelector('[data-place="title"]')!;
    expect(title.parentElement!.classList.contains(ITEMS[want as keyof typeof ITEMS]), title.parentElement!.className).toBe(true);
    for (const a of ["start", "center", "end"] as const) {
      const t = wireframe(item, variant, { align: a }).querySelector('[data-place="title"]')!;
      expect(t.parentElement!.classList.contains(ITEMS[a]), `${a}`).toBe(true);
    }
  });

  it("dir=rtl: the same DOM (start / end are resolved by the browser, not by the block)", () => {
    for (const b of BLOCKS) for (const align of ["start", "end"] as const) {
      const ltr = wireframe(b.id, b.defaultVariant, { align }).outerHTML;
      document.documentElement.setAttribute("dir", "rtl");
      try {
        expect(wireframe(b.id, b.defaultVariant, { align }).outerHTML).toBe(ltr);
      } finally {
        document.documentElement.removeAttribute("dir");
      }
    }
  });
});
