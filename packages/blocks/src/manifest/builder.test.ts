/**
 * Wireframe is the default: organisms have no mode and draw only shapes when rendered directly. Instance options (heading
 * level) change the element, never the look.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import BlockView from "../builder/BlockView.svelte";
import { CATALOG } from "../catalog";
import { SAMPLES } from "../fixtures/samples";
import { BLOCKS } from "./registry";
import type { Mode } from "./types";

const CASES = BLOCKS.flatMap((b) => b.variants.map((v) => [b.id, v.id] as const));

function section(item: string, variant: string, mode: Mode, props: Record<string, unknown>, options?: Record<string, number>) {
  const { container } = render(BlockView, { props: { instance: { id: "t", item, variant, options, props }, mode } });
  return container.querySelector("section")!;
}

describe("wireframe is the default", () => {
  it("organism sources have no mode and write no binding or wireframe attributes", () => {
    for (const block of BLOCKS) {
      const dir = resolve(process.cwd(), "packages/blocks/src", block.id);
      const name = block.id.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join("");
      const code = readFileSync(resolve(dir, `${name}.svelte`), "utf8")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
      for (const marker of ["data-place", "data-field", "data-shape", "aria-hidden", "data-mode", "useMode", "provideMode"]) expect(code.includes(marker), `${block.id}: ${marker}`).toBe(false);
      expect(/\bmode\b/.test(code), `${block.id}: mode`).toBe(false);
    }
  });

  it("a block rendered directly, without mode, given full content, shows only shapes", () => {
    for (const [item, variant] of CASES) {
      const { container } = render(CATALOG[item]!, { props: { variant, content: SAMPLES.filled[item] } });
      const s = container.querySelector("section")!;
      expect(s.textContent?.trim(), `${item}/${variant}`).toBe("");
      expect(s.querySelectorAll("h1, h2, h3, h4, p, a, button")).toHaveLength(0);
      expect(s.querySelectorAll("[data-shape]").length).toBeGreaterThan(0);
      expect(JSON.stringify([...s.querySelectorAll("img")].map((i) => i.getAttribute("src")))).not.toContain("/samples/");
    }
  });
});

describe("instance option headingLevel", () => {
  it("hero title is h1 / h2 / h3 with the same classes; default h2", () => {
    const classes = new Set<string>();
    for (const level of [1, 2, 3] as const) {
      const h = section("hero-split", "media-right", "page", SAMPLES.filled["hero-split"]!, { headingLevel: level }).querySelector('[data-place="title"]')!;
      expect(h.tagName).toBe(`H${level}`);
      classes.add(h.className);
    }
    expect(classes.size).toBe(1);
    expect(section("hero-split", "media-right", "page", SAMPLES.filled["hero-split"]!).querySelector('[data-place="title"]')!.tagName).toBe("H2");
  });

  it("team member names sit one level below the block title", () => {
    for (const [level, member] of [[1, "H2"], [2, "H3"], [3, "H4"]] as const) {
      const s = section("features-team", "columns-3", "page", SAMPLES.filled["features-team"]!, { headingLevel: level });
      expect(s.querySelector('[data-place="title"]')!.tagName).toBe(`H${level}`);
      expect([...s.querySelectorAll('[data-place="member.title"]')].map((h) => h.tagName)).toEqual([member, member, member]);
    }
  });
});
