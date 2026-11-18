import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { BLOCKS, BLOCK_BY_ID, fieldPaths, shapeCounts } from "./index.ts";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["layout", "shapes", "content", "manifest"]);

function organismDirs(): string[] {
  return readdirSync(SRC, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !SKIP.has(entry.name))
    .map((entry) => entry.name)
    .filter((name) => readdirSync(join(SRC, name)).some((file) => file.endsWith(".svelte")))
    .sort();
}

describe("block manifests", () => {
  it("gives every organism directory exactly one *.block.ts", () => {
    const dirs = organismDirs();
    assert.ok(dirs.length > 0, "expected at least one organism");
    for (const name of dirs) {
      const files = readdirSync(join(SRC, name)).filter((file) => file.endsWith(".block.ts"));
      assert.equal(files.length, 1, `${name}: expected one *.block.ts, found ${files.join(", ") || "none"}`);
    }
  });

  it("registers every organism id exactly once", () => {
    const ids = BLOCKS.map((block) => block.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate manifest ids");
    for (const name of organismDirs()) {
      assert.ok(BLOCK_BY_ID[name], `registry missing id ${name}`);
      assert.equal(BLOCK_BY_ID[name].id, name);
    }
    assert.equal(BLOCKS.length, organismDirs().length);
  });

  it("keeps CATALOG keys in lockstep with the registry", () => {
    const catalog = readFileSync(join(SRC, "catalog.ts"), "utf8");
    for (const block of BLOCKS) {
      assert.match(catalog, new RegExp(`"${block.id}"\\s*:`), `catalog.ts missing ${block.id}`);
    }
  });

  it("flattens default content counts for the current library", () => {
    assert.deepEqual(shapeCounts(BLOCK_BY_ID["features-team"].content), {
      heading: 4,
      "text-line": 6,
      avatar: 3,
      cta: 0,
      media: 0,
      dot: 0,
    });
    assert.deepEqual(shapeCounts(BLOCK_BY_ID["hero-split"].content), {
      heading: 1,
      "text-line": 2,
      avatar: 0,
      cta: 1,
      media: 1,
      dot: 0,
    });
  });

  it("points each manifest at an existing organism file", () => {
    for (const block of BLOCKS) {
      const dir = join(SRC, block.id);
      assert.ok(existsSync(dir), `missing directory ${block.id}`);
      const svelte = readdirSync(dir).filter((file) => file.endsWith(".svelte"));
      assert.equal(svelte.length, 1, `${block.id}: expected one .svelte`);
    }
  });

  it("gives each block one content schema and layout-only variants", () => {
    for (const block of BLOCKS) {
      assert.ok(block.content.length > 0, `${block.id}: empty content schema`);
      assert.ok(block.variants.length > 0, `${block.id}: need at least one variant`);
      const defaults = block.variants.filter((variant) => variant.default);
      assert.equal(defaults.length, 1, `${block.id}: exactly one default variant`);
      const ids = block.variants.map((variant) => variant.id);
      assert.equal(new Set(ids).size, ids.length, `${block.id}: duplicate variant ids`);
      const contentIds = new Set(fieldPaths(block.content).map((field) => field.path));
      for (const variant of block.variants) {
        assert.equal("content" in variant, false, `${block.id}/${variant.id}: variants must not carry content`);
        assert.ok(variant.layout && Object.keys(variant.layout).length > 0, `${block.id}/${variant.id}: empty layout`);
        for (const key of Object.keys(variant.layout)) {
          assert.equal(contentIds.has(key), false, `${block.id}/${variant.id}: layout key ${key} collides with content`);
        }
      }
      for (const field of fieldPaths(block.content)) {
        if (field.kind === "record") {
          assert.ok(field.record && field.record !== "item", `${block.id}: record ${field.path} needs a named type`);
        }
      }
    }
  });
});
