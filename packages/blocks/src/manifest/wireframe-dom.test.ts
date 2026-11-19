/** The DOM of every wireframe with the kit cn (clsx + tailwind-merge), as committed in catalog/snapshots/<item>.snap.html. */
import { describe, expect, it } from "vitest";
import { cn } from "../../../kit/src/utils";
import { BLOCKS, drawBlock, snapshotItems, snapshotOf } from "../../catalog/draw";

describe("wireframe DOM (kit cn)", () => {
  it("merges with tailwind-merge here", () => expect(cn("p-2", "p-4")).toBe("p-4"));
  it.each(BLOCKS.map((b) => [b.id, b] as const))("%s renders its snapshot DOM", async (_id, b) => {
    await expect(drawBlock(b)).toMatchFileSnapshot(snapshotOf(b.id));
  });
  it("one snapshot file per block, none stale", () => expect(snapshotItems()).toEqual(BLOCKS.map((b) => b.id).sort()));
});
