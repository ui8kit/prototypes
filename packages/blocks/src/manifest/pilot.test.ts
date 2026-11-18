/**
 * "Pilot done": the builder edits a saved block `{ id, item, variant, props }` by JSON pointer and switches variants without
 * re-filling. The inspector path is read from the clicked element's data-field.
 */
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import BlockView from "../builder/BlockView.svelte";
import { samplePage } from "../fixtures/samples";
import { getAt, setAt, swapAt } from "../model/pointer";
import type { BlockInstance } from "./types";
import { validateInstance } from "./registry";

const text = (el: Element | null | undefined) => (el?.textContent ?? "").trim();

/** Render a saved block the way a builder does: item → organism, variant, props → content. */
function show(instance: BlockInstance, mode: "page" | "wireframe" = "page") {
  expect(validateInstance(instance).ok).toBe(true);
  const r = render(BlockView, { props: { instance, mode } });
  return { ...r, section: r.container.querySelector("section")! };
}

/** The inspector: from a clicked element to the pointer of the value it shows. */
function pointerAt(el: Element, template: RegExp): string {
  const owner = el.closest("[data-field]")!;
  const pointer = owner.getAttribute("data-field")!.split(" ").find((p) => template.test(p));
  expect(pointer).toBeDefined();
  return pointer!;
}

const heroBlock = samplePage.find((b) => b.item === "hero-split")!;
const teamBlock = samplePage.find((b) => b.item === "features-team")!;

describe("pilot: one data edit, then a variant switch without re-filling", () => {
  it("changes the hero title and replaces the photo, and both survive every variant switch", () => {
    let block = { ...heroBlock, props: setAt(heroBlock.props, "/title", "Ship a landing page today") };
    block = { ...block, props: setAt(block.props, "/image/src", "/samples/hero-alt.png") };
    const { section, rerender } = show(block);
    for (const variant of ["media-left", "media-top", "media-right"]) {
      block = { ...block, variant };
      rerender({ instance: block, mode: "page" });
      expect(section.querySelector(".md\\:grid-cols-2") === null, variant).toBe(variant === "media-top");
      expect(section.querySelector('[data-place="title"]')!.tagName).toBe("H1");
      expect(text(section.querySelector("h1"))).toBe("Ship a landing page today");
      expect(section.querySelector('[data-field="/image"] img')!.getAttribute("src")).toBe("/samples/hero-alt.png");
      expect(section.querySelector("a")!.getAttribute("href")).toBe(getAt(heroBlock.props, "/actionHref"));
    }
  });

  it("fixes the 2nd member's name by path and keeps it through columns → cards", () => {
    let block = { ...teamBlock, props: setAt(teamBlock.props, "/members/1/title", "Jonas Bergström") };
    const { section, rerender } = show(block);
    for (const variant of ["columns-2", "cards-3", "columns-4"]) {
      block = { ...block, variant };
      rerender({ instance: block, mode: "page" });
      expect([...section.querySelectorAll("h3")].map(text)).toEqual(["Mira Chen", "Jonas Bergström", "Lena Ortiz"]);
    }
  });

  it("swaps two members, switches variant, edits a name by the clicked path: the right member changes; the feed stays shapes", () => {
    // 1. different names, then swap members 0 and 1 (one data edit)
    let block: BlockInstance = { ...teamBlock, props: swapAt(teamBlock.props, "/members", 0, 1) };
    const { section, rerender } = show(block);
    expect([...section.querySelectorAll("h3")].map(text)).toEqual(["Jonas Berg", "Mira Chen", "Lena Ortiz"]);

    // 2. switch variant without re-filling
    block = { ...block, variant: "cards-3" };
    rerender({ instance: block, mode: "page" });

    // 3. "click" Mira (now second) and read the inspector path from the DOM
    const mira = [...section.querySelectorAll("h3")].find((h) => text(h) === "Mira Chen")!;
    const pointer = pointerAt(mira, /^\/members\/\d+\/title$/);
    expect(pointer).toBe("/members/1/title");
    // her photo is bound to the same, new index
    expect(pointerAt(mira.closest('[data-place="member"]')!.querySelector("img")!, /avatar$/)).toBe("/members/1/avatar");

    // 4. edit by that path: Mira changes, Jonas (now first) does not
    block = { ...block, props: setAt(block.props, pointer, "Mira Chen-Park") };
    rerender({ instance: block, mode: "page" });
    expect([...section.querySelectorAll("h3")].map(text)).toEqual(["Jonas Berg", "Mira Chen-Park", "Lena Ortiz"]);
    const card = section.querySelector('[data-field="/members/1"]')!;
    expect(card.querySelector("img")!.getAttribute("alt")).toBe("Portrait of Mira Chen");
    expect(text(card.querySelector("p"))).toBe("Design lead");

    // 5. the same saved block in the feed: geometry only
    rerender({ instance: block, mode: "wireframe" });
    expect(text(section)).toBe("");
    expect(section.querySelectorAll("h3, p, a")).toHaveLength(0);
    expect(section.querySelectorAll('[data-place="member"]')).toHaveLength(3);
  });
});
