/** The DOM of every wireframe with the kit cn (clsx + tailwind-merge), as committed in catalog/wireframes.snap.html. */
import { describe, expect, it } from "vitest";
import { cn } from "../../../kit/src/utils";
import { drawAll } from "../../catalog/draw";

describe("wireframe DOM (kit cn)", () => {
  it("merges with tailwind-merge here", () => expect(cn("p-2", "p-4")).toBe("p-4"));
  it("every wireframe renders the snapshot DOM", async () => {
    await expect(drawAll()).toMatchFileSnapshot("../../catalog/wireframes.snap.html");
  });
});
