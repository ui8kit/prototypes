/**
 * The generated organisms through the builder: one composition, two modes, real values. Every block × every variant gets
 * the SAME content object; the page shows each filled value in its place (data-place / data-field from the contract),
 * cleared optional values leave no element, and the wireframe (catalog, the default) is geometry only.
 */
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import BlockView from "../builder/BlockView.svelte";
import { CATALOG } from "../catalog";
import { heroFilled, heroMinimal, teamFilled, teamMinimal, teamSwapped } from "../fixtures/samples";
import { BLOCKS, BLOCK_BY_ID } from "./registry";
import { bind, wireframeProps, type BlockOptions, type Mode } from "./types";

const FILLED: Record<string, Record<string, unknown>> = { "hero-simple": heroFilled, "team-simple": teamFilled };
const MINIMAL: Record<string, Record<string, unknown>> = { "hero-simple": heroMinimal, "team-simple": teamMinimal };

function page(item: string, variant: string, props: Record<string, unknown>, options?: BlockOptions, mode: Mode = "page"): HTMLElement {
  const { container } = render(BlockView, { props: { instance: { id: "t", item, variant, options, props }, mode } });
  return container.querySelector("section") as HTMLElement;
}
function wireframe(item: string, variant: string): HTMLElement {
  const { container } = render(CATALOG[item]!, { props: wireframeProps(BLOCK_BY_ID[item]!, variant) });
  return container.querySelector("section") as HTMLElement;
}
const text = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
const all = (root: Element, sel: string) => [...root.querySelectorAll(sel)];
const byField = (root: Element, pointer: string) => all(root, `[data-field~="${pointer}"]`);

describe("catalog", () => {
  it("CATALOG and the registry name the same items", () => {
    expect(Object.keys(CATALOG).sort()).toEqual(BLOCKS.map((b) => b.id).sort());
  });
});

describe.each(BLOCKS.flatMap((b) => b.variants.map((v) => [b.id, v.id] as const)))("%s / %s", (item, variant) => {
  const block = BLOCK_BY_ID[item]!;

  it("page: the filled object renders every place, bound by data-place / data-field", () => {
    const section = page(item, variant, FILLED[item]!);
    expect(all(section, "[data-shape]"), "no wireframe shapes on a page").toHaveLength(0);
    const n = item === "team-simple" ? teamFilled.members.length : 1;
    for (const p of block.places) {
      for (let i = 0; i < n; i++) {
        const { field } = bind(block, p.place, i);
        const first = field.split(" ")[0]!;
        expect(byField(section, first).length, `${p.place} ${field}`).toBeGreaterThan(0);
        if (!p.list) break;
      }
    }
    expect(section.getAttribute("aria-labelledby")).toBe("t-title");
    expect(section.querySelector("#t-title")).not.toBeNull();
  });

  it("page: values are drawn as text, links and images", () => {
    const section = page(item, variant, FILLED[item]!);
    if (item === "hero-simple") {
      expect(text(byField(section, "/title")[0])).toBe(heroFilled.title);
      expect(text(byField(section, "/badge")[0])).toBe(heroFilled.badge);
      expect(text(byField(section, "/description")[0])).toBe(heroFilled.description);
      const a = section.querySelector("a");
      expect(a?.getAttribute("href")).toBe(heroFilled.actionHref);
      expect(text(a)).toBe(heroFilled.actionLabel);
      const srcs = all(section, "img").map((img) => img.getAttribute("src"));
      expect(srcs).toContain(heroFilled.image);
      expect(srcs).toContain(heroFilled.imageDark);
      expect(all(section, "img").every((img) => img.getAttribute("alt") === heroFilled.imageAlt)).toBe(true);
    } else {
      expect(text(byField(section, "/title")[0])).toBe(teamFilled.title);
      const items = all(section, "ul > li");
      expect(items).toHaveLength(teamFilled.members.length);
      teamFilled.members.forEach((m, i) => {
        expect(text(items[i])).toContain(m.title);
        expect(text(items[i])).toContain(m.description!);
        expect(items[i]!.querySelector("img")?.getAttribute("src")).toBe(m.avatar);
      });
    }
  });

  it("page: cleared optional values leave no element", () => {
    const section = page(item, variant, MINIMAL[item]!);
    for (const f of ["/badge", "/description", "/actionLabel", "/members/0/description"]) expect(byField(section, f), f).toHaveLength(0);
    expect(section.querySelector("a")).toBeNull();
  });

  it("wireframe (catalog): geometry only — no words, no links, no content images, no labelled landmark", () => {
    const section = wireframe(item, variant);
    expect(text(section)).toBe("");
    expect(section.querySelector("a")).toBeNull();
    // only the decorative placeholder picture (inline SVG, empty alt), never a content image
    for (const img of all(section, "img")) {
      expect(img.getAttribute("src")).toMatch(/^data:image\/svg\+xml/);
      expect(img.getAttribute("alt")).toBe("");
    }
    expect(section.hasAttribute("aria-labelledby")).toBe(false);
    expect(all(section, "[data-shape]").length).toBeGreaterThan(0);
    if (item === "team-simple") expect(all(section, "ul > li")).toHaveLength(block.wireframe.items);
  });

  it("BlockView without a mode is the wireframe, even with content", () => {
    const { container } = render(BlockView, { props: { instance: { id: "t", item, variant, props: FILLED[item]! } } });
    expect(text(container)).toBe("");
  });
});

describe("builder edits", () => {
  it("level sets the heading element; members one level below", () => {
    const hero = page("hero-simple", "mediaEnd", heroFilled, { level: 1 });
    expect(hero.querySelector("h1")?.id).toBe("t-title");
    const team = page("team-simple", "cols3", teamFilled, { level: 3 });
    expect(team.querySelector("h3")?.id).toBe("t-title");
    expect(all(team, "ul h4")).toHaveLength(teamFilled.members.length);
  });

  it("landmarkLabel replaces aria-labelledby", () => {
    const section = page("team-simple", "cols3", teamFilled, { landmarkLabel: "Our people" });
    expect(section.getAttribute("aria-label")).toBe("Our people");
    expect(section.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("swapping two members is one data edit: the list order follows, no re-fill", () => {
    const names = (s: HTMLElement) => all(s, "ul > li").map((li) => text(li.querySelector("[data-field$='/title']")));
    expect(names(page("team-simple", "cols3", teamSwapped))).toEqual(teamSwapped.members.map((m) => m.title));
  });

  it("switching the variant keeps every value", () => {
    const values = (v: string) => text(page("hero-simple", v, heroFilled));
    expect(values("mediaStart")).toBe(values("mediaEnd"));
    expect(values("mediaTop")).toBe(values("mediaEnd"));
  });
});
