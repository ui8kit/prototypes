import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { ui } from "../content/en.ts";
import { samplePage, SAMPLES } from "../fixtures/samples.ts";
import { modelPaths } from "../model/types.ts";
import { MODELS, modelKey } from "../models/index.ts";
import {
  BLOCKS,
  BLOCK_BY_ID,
  FIELD_BUDGET_MAX,
  FIELD_BUDGET_MIN,
  bind,
  fieldBudget,
  placesFor,
  validateInstance,
} from "./index.ts";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["layout", "shapes", "content", "manifest", "places", "model", "models", "fixtures", "builder"]);

function organismDirs(): string[] {
  return readdirSync(SRC, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !SKIP.has(entry.name))
    .map((entry) => entry.name)
    .filter((name) => readdirSync(join(SRC, name)).some((file) => file.endsWith(".svelte")))
    .sort();
}

describe("block manifests", () => {
  it("gives every organism directory exactly one *.block.ts and one .svelte", () => {
    const dirs = organismDirs();
    assert.ok(dirs.length > 0);
    for (const name of dirs) {
      const files = readdirSync(join(SRC, name));
      assert.equal(files.filter((f) => f.endsWith(".block.ts")).length, 1, name);
      assert.equal(files.filter((f) => f.endsWith(".svelte")).length, 1, name);
    }
  });

  it("registers every organism under its stable item id, once, and in CATALOG", () => {
    const ids = BLOCKS.map((block) => block.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate item ids");
    assert.deepEqual([...ids].sort(), organismDirs());
    const catalog = readFileSync(join(SRC, "catalog.ts"), "utf8");
    for (const block of BLOCKS) {
      assert.equal(BLOCK_BY_ID[block.id], block);
      assert.ok(existsSync(join(SRC, block.id)));
      assert.match(catalog, new RegExp(`"${block.id}"\\s*:`), `catalog.ts missing ${block.id}`);
    }
  });

  it("keeps variants layout-only, with exactly one default", () => {
    for (const block of BLOCKS) {
      assert.equal(block.variants.filter((v) => v.default).length, 1, block.id);
      const ids = block.variants.map((v) => v.id);
      assert.equal(new Set(ids).size, ids.length, `${block.id}: duplicate variant ids`);
      const content = new Set(Object.keys(block.model.fields));
      for (const v of block.variants) {
        assert.equal("content" in v || "props" in v, false, `${block.id}/${v.id} carries content`);
        assert.ok(Object.keys(v.layout).length > 0, `${block.id}/${v.id}: empty layout`);
        for (const key of Object.keys(v.layout)) assert.equal(content.has(key), false, `${block.id}/${v.id}: ${key}`);
      }
    }
  });

  it("binds every model value to a place and every place to existing model paths", () => {
    for (const block of BLOCKS) {
      const paths = modelPaths(block.model.fields);
      // a list item itself (`/members/*`) is addressable too: the item place binds it
      const known = new Set(paths.flatMap((p) => (p.field.type === "list" ? [p.path, `${p.path}/*`] : [p.path])));
      const placeIds = block.places.map((p) => p.id);
      assert.equal(new Set(placeIds).size, placeIds.length, `${block.id}: duplicate place ids`);
      for (const place of block.places) {
        assert.ok(place.fields.length > 0, `${block.id}#${place.id}: no fields`);
        for (const f of place.fields) assert.ok(known.has(f), `${block.id}#${place.id}: ${f} is not in ${modelKey(block.model)}`);
        if (place.each) {
          assert.ok(known.has(place.each), `${block.id}#${place.id}: each ${place.each}`);
          for (const f of place.fields) assert.ok(f.startsWith(`${place.each}/*`), `${block.id}#${place.id}: ${f} outside ${place.each}`);
        }
      }
      for (const { path, field } of paths) {
        const drawn = placesFor(block, path).length > 0 || block.places.some((p) => p.role === "item" && p.each === path);
        assert.ok(drawn, `${block.id}: ${path} (${field.type}) has no place`);
      }
    }
  });

  it("resolves place bindings to concrete pointers per list index", () => {
    const team = BLOCK_BY_ID["features-team"]!;
    assert.deepEqual(bind(team, "member.title", 1), { place: "member.title", field: "/members/1/title" });
    assert.deepEqual(bind(team, "member", 0), { place: "member", field: "/members/0" });
    assert.deepEqual(bind(BLOCK_BY_ID["hero-split"]!, "action"), { place: "action", field: "/actionLabel /actionHref" });
  });

  it("keeps each content model in the 5–10 field budget and labels every field from the dictionary", () => {
    for (const block of BLOCKS) {
      const n = fieldBudget(block);
      assert.ok(n >= FIELD_BUDGET_MIN && n <= FIELD_BUDGET_MAX, `${block.id}: ${n}`);
      for (const { path, field } of modelPaths(block.model.fields)) {
        assert.ok(field.label in ui.fields, `${block.id}: ${path} label ${field.label} not in ui.fields`);
      }
    }
  });

  it("declares instance options with a default inside their values and a dictionary label", () => {
    for (const block of BLOCKS) {
      for (const [k, def] of Object.entries(block.options)) {
        assert.ok(def.values.includes(def.default), `${block.id}: ${k}`);
        assert.ok(def.label in ui.options, `${block.id}: ${k} label`);
        assert.equal(k in block.model.fields, false, `${block.id}: option ${k} collides with content`);
      }
      assert.deepEqual(block.options.headingLevel?.values, [1, 2, 3], block.id);
    }
  });

  it("grows schemas with content models, not variants", () => {
    const models = new Set(BLOCKS.map((b) => modelKey(b.model)));
    const variants = BLOCKS.reduce((n, b) => n + b.variants.length, 0);
    assert.equal(models.size, MODELS.length, "every registered model is used, every used model is registered");
    assert.ok(variants > models.size);
    const schemas = readdirSync(join(SRC, "..", "schemas")).filter((f) => f.endsWith(".schema.json"));
    assert.equal(schemas.length, MODELS.length);
  });

  it("accepts the saved sample page and every sample set; rejects unknown items, variants and invalid props", () => {
    for (const instance of samplePage) assert.deepEqual(validateInstance(instance), { ok: true, issues: [] }, instance.id);
    for (const [sample, byItem] of Object.entries(SAMPLES)) {
      for (const [item, props] of Object.entries(byItem)) {
        for (const v of BLOCK_BY_ID[item]!.variants) {
          assert.equal(validateInstance({ id: "x", item, variant: v.id, props }).ok, true, `${sample}/${item}/${v.id}`);
        }
      }
    }
    assert.equal(validateInstance({ id: "x", item: "nope", variant: "a", props: {} }).issues[0]?.code, "unknownItem");
    const hero = { id: "x", item: "hero-split", variant: "media-left", props: { title: "T" } };
    assert.equal(validateInstance({ ...hero, options: { headingLevel: 1 } }).ok, true);
    assert.deepEqual(
      validateInstance({ ...hero, options: { headingLevel: 4, size: 2 } }).issues.map((i) => `${i.path}:${i.code}`),
      ["/options/headingLevel:optionValue", "/options/size:unknownOption"],
    );
    const bad = validateInstance({ id: "x", item: "hero-split", variant: "media-diagonal", props: { title: "", actionHref: "javascript:alert(1)" } });
    assert.deepEqual(
      bad.issues.map((i) => `${i.path}:${i.code}`).sort(),
      ["/actionHref:unsafeUrl", "/title:required", "/variant:unknownVariant"],
    );
  });
});
