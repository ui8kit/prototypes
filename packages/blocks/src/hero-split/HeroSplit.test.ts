import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import HeroSplit from "./HeroSplit.svelte";

function letters(node: HTMLElement): string {
  return (node.textContent ?? "").replace(/\s+/g, "");
}

function shapeOrder(root: Element): string[] {
  return [...root.querySelectorAll("[data-shape]")].map((node) => node.getAttribute("data-shape") ?? "");
}

describe("HeroSplit", () => {
  it("renders a split hero of shapes with a labelled CTA and no copy", () => {
    const { container, getByRole } = render(HeroSplit);

    const region = getByRole("region", { name: "Hero" });
    expect(region.tagName.toLowerCase()).toBe("section");
    expect(region.getAttribute("data-variant")).toBe("media-right");
    expect(region.querySelector(".md\\:grid-cols-2")).not.toBeNull();
    expect(region.querySelectorAll('[data-shape="heading"]')).toHaveLength(1);
    expect(region.querySelectorAll('[data-shape="text-line"]')).toHaveLength(2);
    expect(region.querySelectorAll('[data-shape="media"]')).toHaveLength(1);
    expect(region.querySelectorAll("img")).toHaveLength(2);

    const cta = getByRole("link", { name: "Get started" });
    expect(cta.getAttribute("data-shape")).toBe("cta");
    expect(cta.getAttribute("href")).toBe("#");
    expect(cta.className).toContain("bg-primary");
    expect(cta.textContent?.trim()).toBe("");
    expect(letters(container as HTMLElement)).toBe("");
  });

  it("media-left puts media before copy without dropping fields", () => {
    const { getByRole } = render(HeroSplit, { props: { variant: "media-left" } });
    const region = getByRole("region", { name: "Hero" });
    expect(region.getAttribute("data-variant")).toBe("media-left");
    expect(region.querySelector(".md\\:grid-cols-2")).not.toBeNull();
    expect(shapeOrder(region)[0]).toBe("media");
    expect(region.querySelectorAll('[data-field~="title"]')).toHaveLength(1);
    expect(region.querySelectorAll('[data-field~="image"]')).toHaveLength(1);
    expect(region.querySelectorAll('[data-field~="actionHref"]')).toHaveLength(1);
  });

  it("media-top stacks media above copy and keeps the contract", () => {
    const { getByRole } = render(HeroSplit, { props: { variant: "media-top" } });
    const region = getByRole("region", { name: "Hero" });
    expect(region.getAttribute("data-variant")).toBe("media-top");
    expect(region.querySelector(".md\\:grid-cols-2")).toBeNull();
    expect(shapeOrder(region)[0]).toBe("media");
    expect(region.querySelectorAll('[data-shape="heading"]')).toHaveLength(1);
    expect(region.querySelectorAll('[data-shape="text-line"]')).toHaveLength(2);
    expect(region.querySelectorAll('[data-shape="media"]')).toHaveLength(1);
    expect(region.querySelectorAll('[data-shape="cta"]')).toHaveLength(1);
  });
});
