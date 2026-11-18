import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { layout } from "../classes";
import Block from "./Block.svelte";
import SectionProbe from "./SectionProbe.test.svelte";

describe("section padding", () => {
  it("has three steps, every one a multiple of 8px (4px Tailwind spacing)", () => {
    for (const cls of Object.values(layout.section)) {
      for (const token of cls.split(" ")) {
        const step = Number(token.replace(/^lg:/, "").replace(/^py-/, ""));
        expect((step * 4) % 8, token).toBe(0);
      }
    }
    expect(layout.section).toEqual({
      compact: "py-8 lg:py-16",
      default: "py-16 lg:py-32",
      spacious: "py-24 lg:py-40",
    });
  });

  it("a Block without a theme provider uses the standard step", () => {
    const { container } = render(Block, { props: { tag: "section" } });
    const region = container.querySelector("section")!;
    expect(region.getAttribute("data-section-padding")).toBe("default");
    expect(region.classList.contains("py-16")).toBe(true);
    expect(region.classList.contains("lg:py-32")).toBe(true);
  });

  it("a provided step reaches every Block", () => {
    for (const [padding, base, lg] of [
      ["compact", "py-8", "lg:py-16"],
      ["spacious", "py-24", "lg:py-40"],
    ] as const) {
      const { container, unmount } = render(SectionProbe, { props: { padding } });
      const region = container.querySelector("section")!;
      expect(region.getAttribute("data-section-padding")).toBe(padding);
      expect(region.classList.contains(base)).toBe(true);
      expect(region.classList.contains(lg)).toBe(true);
      unmount();
    }
  });
});
