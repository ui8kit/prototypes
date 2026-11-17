import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import HeroSplit from "./HeroSplit.svelte";

function letters(node: HTMLElement): string {
  return (node.textContent ?? "").replace(/\s+/g, "");
}

describe("HeroSplit", () => {
  it("renders a split hero of shapes with a labelled CTA and no copy", () => {
    const { container, getByRole } = render(HeroSplit);

    const region = getByRole("region", { name: "Hero" });
    expect(region.tagName.toLowerCase()).toBe("section");
    expect(region.querySelector(".md\\:grid-cols-2")).not.toBeNull();
    expect(region.querySelectorAll('[data-shape="heading"]')).toHaveLength(1);
    expect(region.querySelectorAll('[data-shape="text-line"]')).toHaveLength(2);
    expect(region.querySelectorAll('[data-shape="media"]')).toHaveLength(1);
    expect(region.querySelectorAll("img")).toHaveLength(2);

    const cta = getByRole("button", { name: "Get started" });
    expect(cta.getAttribute("data-shape")).toBe("cta");
    expect(cta.className).toContain("bg-primary");
    expect(cta.textContent?.trim()).toBe("");
    expect(letters(container as HTMLElement)).toBe("");
  });
});
