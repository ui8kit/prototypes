import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import FeaturesTeam from "./FeaturesTeam.svelte";

function letters(node: HTMLElement): string {
  return (node.textContent ?? "").replace(/\s+/g, "");
}

describe("FeaturesTeam", () => {
  it("renders a named region with three avatar columns and no copy", () => {
    const { container, getByRole } = render(FeaturesTeam);

    const region = getByRole("region", { name: "Team" });
    expect(region.tagName.toLowerCase()).toBe("section");
    expect(region.querySelectorAll('[data-shape="avatar"]')).toHaveLength(3);
    expect(region.querySelectorAll('[data-shape="heading"]')).toHaveLength(4);
    expect(region.querySelectorAll('[data-shape="text-line"]')).toHaveLength(6);
    expect(region.querySelector(".md\\:grid-cols-3")).not.toBeNull();
    expect(region.querySelector(".bg-accent")).not.toBeNull();
    expect(region.querySelector(".bg-muted")).not.toBeNull();
    expect(region.querySelector(".bg-secondary")).not.toBeNull();
    expect(region.querySelector(".rounded-full")).not.toBeNull();
    expect(letters(container as HTMLElement)).toBe("");
  });

  it("honours count", () => {
    const { container } = render(FeaturesTeam, { props: { count: 2 } });
    expect(container.querySelectorAll('[data-shape="avatar"]')).toHaveLength(2);
  });
});
