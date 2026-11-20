/**
 * The generated wireframes of the catalog: rectangles only. Every block × variant draws every place of its contract as a
 * shape with data-place / data-field (the inspector), no words, no image, no link; the padding setting and the list width.
 */
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { CATALOG } from "../catalog";
import { BLOCKS, BLOCK_BY_ID } from "./registry";
import { bind, variantSettings, wireItems, wireframeProps, type BlockSettings } from "./types";

function wireframe(item: string, variant: string, settings?: BlockSettings): HTMLElement {
  const { container } = render(CATALOG[item]!, { props: wireframeProps(BLOCK_BY_ID[item]!, variant, settings) });
  // the root landmark of the block: a section, or the header / footer of the page frame (header-simple, footer-simple)
  return container.querySelector("section, header, footer") as HTMLElement;
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
    const items = wireItems(block, variant);
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
    // a list place is drawn once per column of the variant (wireItems: the count axis, else wireframe.items), in a list
    const items = wireItems(block, variant);
    for (const p of block.places.filter((x) => x.list)) expect(all(s, `li [data-place="${p.place}"], li[data-place="${p.place}"]`), p.place).toHaveLength(items);
    if (block.places.some((x) => x.list)) expect(all(s, "ul > li, ol > li")).toHaveLength(items);
  });
});

describe("wireframe items", () => {
  it("the default variant draws wireframe.items; a block without a column axis draws wireframe.items in every variant", () => {
    for (const b of BLOCKS) {
      expect(wireItems(b, b.defaultVariant), b.id).toBe(b.wireframe.items);
      if (!Object.values(b.axes).some((vs) => vs.length > 0 && vs.every((v) => /^[1-9][0-9]?$/.test(v))))
        for (const v of b.variants) expect(wireItems(b, v.id), `${b.id} ${v.id}`).toBe(b.wireframe.items);
    }
  });
});

describe("section padding (theme → padding setting)", () => {
  const PRESETS = { compact: ["py-8", "lg:py-16"], standard: ["py-16", "lg:py-32"], spacious: ["py-24", "lg:py-40"] } as const;
  // the preset sits on the section, or (a frame whose picture runs to the edge of the screen: split) on the one column of the copy
  const padded = (s: Element, cls: readonly string[]) => [s, ...all(s, "*")].filter((e) => cls.every((c) => e.classList.contains(c)));
  // the header has no padding setting (a fixed slim band); the footer sits compact by default
  it.each(BLOCKS.filter((b) => b.settings.padding).flatMap((b) => b.variants.map((v) => [b.id, v.id] as const)))("%s / %s: every preset", (item, variant) => {
    for (const [padding, cls] of Object.entries(PRESETS)) {
      const s = wireframe(item, variant, { padding: padding as never });
      const on = padded(s, cls);
      expect(on, `${padding} ${cls.join(" ")}`).toHaveLength(1);
      if (on[0] !== s) expect(s.getAttribute("class") ?? "", `${padding}: the section of a split frame has no padding of its own`).not.toMatch(/\bpy-/);
    }
    expect(padded(wireframe(item, variant), PRESETS[BLOCK_BY_ID[item]!.settings.padding!.default as keyof typeof PRESETS])).toHaveLength(1);
  });
});

// every block with a list place: the list fills its column (w-full) and lays its members out as a grid or a wrapping row
// (logos-simple plain: flex-wrap); a member grid in a column of its own also stretches that column (team-simple)
const LISTS = BLOCKS.filter((b) => b.places.some((p) => p.list)).flatMap((b) => b.variants.map((v) => [b.id, v.id] as const));
describe.runIf(LISTS.length > 0)("list width", () => {
  it.each(LISTS)("%s / %s: the list is a full-width grid (or a wrapping row) in its column", (item, variant) => {
    const list = wireframe(item, variant).querySelector("ul, ol")!;
    expect(list.classList.contains("w-full")).toBe(true);
    // or a column of rows that are grids themselves (compare-simple: one row per property, a column per product)
    const rows = list.classList.contains("flex-col") && [...list.children].every((li) => li.classList.contains("grid"));
    expect(list.classList.contains("grid") || list.classList.contains("flex-wrap") || rows).toBe(true);
  });
});

describe("align setting (start | center | end, logical: docs/adr/0002-align-as-setting.md)", () => {
  const ITEMS = { start: "items-start", center: "items-center", end: "items-end" } as const;
  // the blocks with the align setting; split-simple has none: its copy is fixed at the start, a saved align changes nothing
  const ALIGNED = BLOCKS.filter((b) => b.settings.align);
  // the fixed compositions (split, header, footer, figure, pull quote, rating, purchase): a saved align changes nothing;
  // the split keeps its copy at the start
  it.each(BLOCKS.filter((b) => !b.settings.align).flatMap((b) => b.variants.map((v) => [b.id, v.id] as const)))("%s / %s: no align setting, the copy at the start", (item, variant) => {
    const base = wireframe(item, variant).outerHTML;
    for (const a of ["center", "end"] as const) expect(wireframe(item, variant, { align: a } as never).outerHTML, a).toBe(base);
    if (item === "split-simple") expect(wireframe(item, variant).querySelector('[data-place="title"]')!.parentElement!.classList.contains("items-start")).toBe(true);
  });
  it.each(ALIGNED.flatMap((b) => b.variants.flatMap((v) => (["start", "center", "end"] as const).map((a) => [b.id, v.id, a] as const))))("%s / %s / %s", (item, variant, align) => {
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
  it.each(ALIGNED.flatMap((b) => b.variants.map((v) => [b.id, v.id] as const)))("%s / %s: the variant default, then the prop", (item, variant) => {
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
    for (const b of ALIGNED) for (const align of ["start", "end"] as const) {
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
