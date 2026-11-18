import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { CATALOG } from "../catalog";
import { BLOCKS, countsByAttr, shapeCounts } from "./index";

describe("manifest matches rendered structure", () => {
  it("exports a component for every registered block", () => {
    for (const block of BLOCKS) {
      expect(CATALOG[block.id], block.id).toBeTypeOf("function");
    }
    expect(Object.keys(CATALOG).sort()).toEqual([...BLOCKS.map((block) => block.id)].sort());
  });

  for (const block of BLOCKS) {
    it(`${block.id}: default [data-shape] counts match flattened slots`, () => {
      const View = CATALOG[block.id];
      const { container } = render(View);
      const expected = countsByAttr(shapeCounts(block.slots));
      for (const [attr, n] of Object.entries(expected)) {
        expect(container.querySelectorAll(`[data-shape="${attr}"]`), attr).toHaveLength(n);
      }
    });
  }
});
