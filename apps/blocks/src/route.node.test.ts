import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { blockHref, parseHash } from "./route.ts";

describe("hash routes", () => {
  it("treats empty and unknown hashes as the gallery", () => {
    assert.deepEqual(parseHash(""), { view: "gallery" });
    assert.deepEqual(parseHash("#/"), { view: "gallery" });
    assert.deepEqual(parseHash("#/nope"), { view: "gallery" });
  });

  it("opens a block studio from #/block/<id>", () => {
    assert.deepEqual(parseHash("#/block/hero-split"), { view: "block", id: "hero-split" });
    assert.equal(blockHref("hero-split"), "#/block/hero-split");
  });

  it("carries a layout variant on #/block/<id>/<variant>", () => {
    assert.deepEqual(parseHash("#/block/hero-split/media-left"), {
      view: "block",
      id: "hero-split",
      variant: "media-left",
    });
    assert.equal(blockHref("hero-split", "media-left"), "#/block/hero-split/media-left");
  });
});
