import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { CATALOG } from "../catalog";
import {
  BLOCKS,
  countsByAttr,
  fieldRenderCounts,
  fieldSelector,
  shapeCounts,
} from "./index";

describe("manifest matches rendered structure", () => {
  it("exports a component for every registered block", () => {
    for (const block of BLOCKS) {
      expect(CATALOG[block.id], block.id).toBeTypeOf("function");
    }
    expect(Object.keys(CATALOG).sort()).toEqual([...BLOCKS.map((block) => block.id)].sort());
  });

  for (const block of BLOCKS) {
    it(`${block.id}: default [data-shape] counts match flattened content`, () => {
      const View = CATALOG[block.id];
      const { container } = render(View);
      const expected = countsByAttr(shapeCounts(block.content));
      for (const [attr, n] of Object.entries(expected)) {
        expect(container.querySelectorAll(`[data-shape="${attr}"]`), attr).toHaveLength(n);
      }
    });
  }
});

describe("completeness: every contract field renders in every variant", () => {
  for (const block of BLOCKS) {
    for (const variant of block.variants) {
      it(`${block.id} / ${variant.id} renders every filled field`, () => {
        const View = CATALOG[block.id];
        const { container } = render(View, { props: { variant: variant.id } });
        const expected = fieldRenderCounts(block.content);
        for (const [path, n] of Object.entries(expected)) {
          expect(container.querySelectorAll(fieldSelector(path)), path).toHaveLength(n);
        }
      });
    }
  }
});
