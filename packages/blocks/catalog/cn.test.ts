/**
 * The catalog bundle's cn (kit-cn.ts, ui8kit/codegen `generate --cn join`) draws the same wireframes as the kit's cn
 * (clsx + tailwind-merge): the whole DOM of every block × variant × padding preset (tags, classes, ARIA, data-place /
 * data-field) matches catalog/snapshots/<item>.snap.html, which src/manifest/wireframe-dom.test.ts renders with the kit cn.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { cn } from "../../kit/src/utils";
import { BLOCKS, drawBlock, snapshotOf } from "./draw";

vi.mock("../../kit/src/utils/cn.ts", () => import("./kit-cn"));

describe("catalog cn", () => {
  it("kit-cn.ts is dependency-free and is what the kit utils export here", () => {
    expect(readFileSync(resolve(process.cwd(), "packages/blocks/catalog/kit-cn.ts"), "utf8")).not.toMatch(/^\s*import\b|\bfrom\s+["']/m);
    expect(cn("p-2", "p-4")).toBe("p-2 p-4");
  });

  it.each(BLOCKS.map((b) => [b.id, b] as const))("%s renders its snapshot DOM", async (_id, b) => {
    await expect(drawBlock(b)).toMatchFileSnapshot(snapshotOf(b.id));
  });
});
