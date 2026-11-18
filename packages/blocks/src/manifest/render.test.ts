/**
 * One composition, two modes, real values. Every block × every variant gets the SAME content object; the DOM must show each
 * filled value in its place (page), nothing for cleared optional values, and only geometry in the wireframe.
 */
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import BlockView from "../builder/BlockView.svelte";
import { CATALOG } from "../catalog";
import type { Mode, TitleLevel } from "./types";
import { heroFilled, heroMinimal, teamFilled, teamMinimal } from "../fixtures/samples";
import { getAt, resolvePointer } from "../model/pointer";
import { leafPaths, type ImageValue } from "../model/types";
import { BLOCKS, BLOCK_BY_ID } from "./registry";

const hero = BLOCK_BY_ID["hero-split"]!;
const team = BLOCK_BY_ID["features-team"]!;
const FILLED: Record<string, Record<string, unknown>> = { "hero-split": heroFilled, "features-team": teamFilled };

type MountProps = { variant?: string; mode?: Mode; content?: Record<string, unknown>; headingLevel?: TitleLevel };

/** With a mode: through the builder's BlockView (a saved instance). Without: the organism alone, as the feed renders it. */
function mount(item: string, { variant, mode, content, headingLevel }: MountProps): HTMLElement {
  const block = BLOCK_BY_ID[item]!;
  const instance = {
    id: "t",
    item,
    variant: variant ?? block.variants.find((v) => v.default)!.id,
    options: headingLevel ? { headingLevel } : undefined,
    props: content ?? {},
  };
  const { container } = mode
    ? render(BlockView, { props: { instance, mode } })
    : render(CATALOG[item]!, { props: { variant, content, headingLevel } });
  return container.querySelector("section") as HTMLElement;
}
const text = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
const all = (root: Element, sel: string) => [...root.querySelectorAll(sel)];
const byField = (root: Element, pointer: string) => all(root, `[data-field~="${pointer}"]`);

/** Every element must hold something: text, an image, or a descendant that does. No empty figure / stack / grid. */
function emptyElements(root: Element): string[] {
  return all(root, "*")
    .filter((el) => el.tagName !== "IMG" && !el.querySelector("img") && text(el) === "")
    .map((el) => el.outerHTML.slice(0, 120));
}

describe.each(BLOCKS.flatMap((b) => b.variants.map((v) => [b.id, v.id] as const)))("%s / %s", (item, variant) => {
  it("page: the filled object renders every value in its place", () => {
    const section = mount(item, { variant, mode: "page", content: FILLED[item] });
    expect(all(section, "[data-shape]"), "no wireframe shapes on a page").toHaveLength(0);
    expect(all(section, "[aria-hidden]")).toHaveLength(0);

    if (item === "hero-split") {
      const c = heroFilled;
      expect(text(section.querySelector("h2"))).toBe(c.title);
      expect(byField(section, "/title")[0]!.tagName).toBe("H2");
      expect(text(byField(section, "/badge")[0])).toBe(c.badge);
      expect(text(section.querySelector("p"))).toBe(c.description);
      const link = section.querySelector("a")!;
      expect(text(link)).toBe(c.actionLabel);
      expect(link.getAttribute("href")).toBe(c.actionHref);
      expect(link.getAttribute("data-field")).toBe("/actionLabel /actionHref");
      const imgs = all(byField(section, "/image")[0]!, "img");
      expect(imgs.map((i) => i.getAttribute("src"))).toEqual([c.image!.src, c.image!.srcDark]);
      expect(imgs.every((i) => i.getAttribute("alt") === c.image!.alt)).toBe(true);
      expect(byField(section, "/image")[0]!.tagName).toBe("FIGURE");
    } else {
      const c = teamFilled;
      expect(text(section.querySelector("h2"))).toBe(c.title);
      expect(text(byField(section, "/description")[0])).toBe(c.description);
      const members = c.members!;
      expect(all(section, '[data-place="member"]')).toHaveLength(members.length);
      expect(all(section, "h3").map(text)).toEqual(members.map((m) => m.title));
      members.forEach((m, i) => {
        const card = byField(section, `/members/${i}`)[0]!;
        expect(text(card.querySelector("h3"))).toBe(m.title);
        expect(text(card.querySelector("p"))).toBe(m.description);
        const img = card.querySelector("img")!;
        expect(img.getAttribute("src")).toBe(m.avatar!.src);
        expect(img.getAttribute("alt")).toBe(m.avatar!.alt);
      });
    }
  });

  it("page: every model leaf value is reachable through data-field and shows its value", () => {
    const content = FILLED[item]!;
    const section = mount(item, { variant, mode: "page", content });
    const block = BLOCK_BY_ID[item]!;
    const n = (getAt(content, "/members") as unknown[] | undefined)?.length ?? 0;
    for (const template of leafPaths(block.model.fields)) {
      const pointers = template.includes("*") ? Array.from({ length: n }, (_, i) => resolvePointer(template, i)) : [template];
      for (const pointer of pointers) {
        const nodes = byField(section, pointer);
        expect(nodes.length, pointer).toBeGreaterThan(0);
        const value = getAt(content, pointer);
        if (typeof value === "string" && !pointer.endsWith("Href")) expect(text(nodes[0]), pointer).toBe(value);
        if (value && typeof value === "object") expect(nodes[0]!.querySelector("img")?.getAttribute("src"), pointer).toBe((value as ImageValue).src);
      }
    }
  });

  it("page: cleared optional values leave no element and no empty wrapper", () => {
    const minimal = item === "hero-split" ? heroMinimal : teamMinimal;
    const section = mount(item, { variant, mode: "page", content: minimal });
    expect(emptyElements(section)).toEqual([]);
    expect(all(section, "img, figure, a, p")).toHaveLength(0);
    expect(text(section.querySelector("h2"))).toBe(minimal.title);
    if (item === "hero-split") {
      expect(byField(section, "/badge")).toHaveLength(0);
      expect(section.querySelector(".md\\:grid-cols-2"), "no media: the copy takes the whole row").toBeNull();
    } else {
      expect(all(section, "h3").map(text)).toEqual(teamMinimal.members!.map((m) => m.title));
    }
  });

  it.each([["no mode (default)", undefined], ["explicit wireframe", "wireframe"]] as const)("wireframe, %s: the same filled input draws only geometry", (_, mode) => {
    const section = mount(item, { variant, mode, content: FILLED[item] });
    expect(text(section)).toBe("");
    expect(all(section, "a, button, h1, h2, h3, p")).toHaveLength(0);
    const contentSrcs = JSON.stringify(FILLED[item]).match(/\/samples\/[^"]+/g)!;
    for (const img of all(section, "img")) {
      expect(contentSrcs).not.toContain(img.getAttribute("src"));
      expect(img.getAttribute("alt")).toBe("");
    }
    for (const el of all(section, "[data-place]")) {
      expect(el.closest('[aria-hidden="true"]') ?? el.querySelector('[aria-hidden="true"]'), el.outerHTML.slice(0, 80)).not.toBeNull();
    }
    const block = BLOCK_BY_ID[item]!;
    for (const place of block.places) {
      const expected = place.each ? (place.wireframe ?? block.places.find((p) => p.role === "item")!.wireframe!) : 1;
      expect(all(section, `[data-place="${place.id}"]`), place.id).toHaveLength(expected);
    }
  });
});

describe("hero-split page edges", () => {
  it("action: link only when label and href are both filled; label alone is plain text; href alone draws nothing", () => {
    const labelOnly = mount("hero-split", { mode: "page", content: { title: "T", actionLabel: "Go" } });
    expect(labelOnly.querySelector("a")).toBeNull();
    expect(byField(labelOnly, "/actionLabel")[0]!.tagName).toBe("SPAN");
    expect(text(byField(labelOnly, "/actionLabel")[0])).toBe("Go");
    const hrefOnly = mount("hero-split", { mode: "page", content: { title: "T", actionHref: "/x" } });
    expect(hrefOnly.querySelector("a")).toBeNull();
    expect(byField(hrefOnly, "/actionHref")).toHaveLength(0);
  });

  it("an empty badge renders no tag; an image without srcDark is one img; blank strings count as empty", () => {
    const s = mount("hero-split", { mode: "page", content: { title: "T", badge: "  ", image: { src: "/a.png", alt: "A" } } });
    expect(byField(s, "/badge")).toHaveLength(0);
    expect(all(s, "img")).toHaveLength(1);
    expect(all(s, "img")[0]!.className).not.toContain("dark:");
  });

  it("a hero with only media keeps the figure full width; with only copy keeps the copy full width", () => {
    for (const variant of hero.variants.map((v) => v.id)) {
      const media = mount("hero-split", { variant, mode: "page", content: { title: "", image: heroFilled.image } });
      expect(media.querySelector(".md\\:grid-cols-2"), variant).toBeNull();
      expect(all(media, "figure")).toHaveLength(1);
      expect(emptyElements(media)).toEqual([]);
      const copy = mount("hero-split", { variant, mode: "page", content: { ...heroFilled, image: undefined } });
      expect(copy.querySelector(".md\\:grid-cols-2"), variant).toBeNull();
      expect(all(copy, "figure")).toHaveLength(0);
    }
  });

  it("split variants order media and copy by layout, never by content", () => {
    const first = (variant: string) => mount("hero-split", { variant, mode: "page", content: heroFilled }).querySelector("[data-place]")!.getAttribute("data-place");
    expect(first("media-left")).toBe("media");
    expect(first("media-top")).toBe("media");
    expect(first("media-right")).toBe("badge");
  });
});

describe("features-team page edges", () => {
  it("the page draws one member per array item (wireframe draws 3), in array order", () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ title: `Person ${i + 1}` }));
    for (const variant of team.variants.map((v) => v.id)) {
      const s = mount("features-team", { variant, mode: "page", content: { title: "T", members: five } });
      expect(all(s, "h3").map(text), variant).toEqual(five.map((m) => m.title));
      expect(mount("features-team", { variant, mode: "wireframe", content: { title: "T", members: five } }).querySelectorAll('[data-place="member"]')).toHaveLength(3);
    }
  });

  it("no members: no grid; no header values: no header; cards wrap members in surfaces", () => {
    const none = mount("features-team", { mode: "page", content: { title: "T" } });
    expect(none.querySelector(".grid")).toBeNull();
    expect(emptyElements(none)).toEqual([]);
    const noHeader = mount("features-team", { mode: "page", content: { title: "", members: [{ title: "A" }] } });
    expect(noHeader.querySelector("h2")).toBeNull();
    expect(emptyElements(noHeader)).toEqual([]);
    const cards = mount("features-team", { variant: "cards-3", mode: "page", content: teamFilled });
    expect(all(cards, '[data-place="member"][data-role="surface"]')).toHaveLength(3);
  });

  it("a fully empty member is skipped, and the others keep their own index paths", () => {
    const s = mount("features-team", { mode: "page", content: { title: "T", members: [{ title: "A" }, { title: " " }, { title: "C" }] } });
    expect(all(s, "h3").map((h) => h.getAttribute("data-field"))).toEqual(["/members/0/title", "/members/2/title"]);
  });
});
