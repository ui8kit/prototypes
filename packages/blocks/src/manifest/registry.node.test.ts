/**
 * Registry over the generated contracts: ids, variants, places ↔ model paths, field budget, saved instances. Data-driven:
 * every check runs over `BLOCKS` (= the synced manifest) with content built from each block's model (./fixtures.ts), so
 * no block id is named here and a synced block is covered without a test edit.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { invalidContent, sampleContent } from "./fixtures";
import { BLOCKS, BLOCK_BY_ID, FIELD_BUDGET_MAX, FIELD_BUDGET_MIN, MODELS, blocksIn, categoriesPresent, fieldBudget, modelPaths, validateInstance } from "./registry";
import { BLOCK_CATEGORIES, bind, defaultVariantId, placesFor, settingKeys, settingValues, splitProps, variantSettings, wireframeProps, type BlockManifest } from "./types";

const generated = JSON.parse(readFileSync(new URL("../generated/manifest.json", import.meta.url), "utf8")) as {
  items: Array<{ item: string; model: string; contract: string }>;
};
const contentOf = (b: BlockManifest, fill?: "full" | "required") => sampleContent(MODELS[b.model]!.spec, fill);
/** the enumerated settings of a block (level, padding, align) with their allowed values */
const enumerated = (b: BlockManifest) => Object.entries(b.settings).flatMap(([k, s]) => { const v = settingValues(s); return v ? [[k, v] as const] : []; });

describe("registry", () => {
  it("is exactly the generated items, keyed by item id, in manifest order", () => {
    assert.ok(BLOCKS.length > 0);
    assert.deepEqual(BLOCKS.map((b) => b.id), generated.items.map((i) => i.item));
    for (const i of generated.items) assert.equal(BLOCK_BY_ID[i.item]!.model, i.model);
    assert.equal(new Set(BLOCKS.map((b) => b.id)).size, BLOCKS.length);
  });

  it("every block has a known catalog category (the id of its model); blocksIn / categoriesPresent agree", () => {
    for (const b of BLOCKS) {
      assert.ok((BLOCK_CATEGORIES as readonly string[]).includes(b.category), `${b.id}: category ${b.category}`);
      assert.equal(b.category, b.model.split("@")[0], b.id);
      assert.ok(blocksIn(b.category).includes(b), b.id);
    }
    assert.deepEqual(categoriesPresent(), [...new Set(BLOCKS.map((b) => b.category))]);
    assert.equal(categoriesPresent().reduce((n, c) => n + blocksIn(c).length, 0), BLOCKS.length);
  });

  it("every block names a known model, a default variant it has, and the wireframe as its only mode", () => {
    for (const b of BLOCKS) {
      assert.ok(MODELS[b.model], `${b.id}: model ${b.model}`);
      assert.ok(b.variants.some((v) => v.id === b.defaultVariant), `${b.id}: default variant`);
      assert.equal(defaultVariantId(b), b.defaultVariant);
      assert.deepEqual(b.modes, ["wireframe"]);
      assert.equal(b.defaultMode, "wireframe");
    }
  });

  it("variants are layout-only: their axes are the declared axes with declared values, ids unique", () => {
    for (const b of BLOCKS) {
      assert.equal(new Set(b.variants.map((v) => v.id)).size, b.variants.length, b.id);
      for (const v of b.variants) {
        assert.deepEqual(Object.keys(v.axes).sort(), Object.keys(b.axes).sort(), `${b.id}/${v.id}`);
        for (const [k, val] of Object.entries(v.axes)) assert.ok(b.axes[k]!.includes(val), `${b.id}/${v.id}: ${k}=${val}`);
      }
    }
  });

  it("every model path is drawn by a place and every place draws an existing path", () => {
    for (const b of BLOCKS) {
      const paths = modelPaths(MODELS[b.model]!.spec.fields);
      const drawn = new Set(b.places.flatMap((p) => p.fields));
      for (const p of b.places) for (const f of p.fields) assert.ok(paths.includes(f), `${b.id}: ${p.place} draws ${f}`);
      // list fields are drawn by their item places; record ids are keys, not drawn
      for (const path of paths) {
        if (/\/\*\/id$/.test(path)) continue;
        const list = b.places.some((p) => p.list && path === `/${p.list}`);
        assert.ok(drawn.has(path) || list, `${b.id}: ${path} has no place`);
      }
    }
  });

  it(`field budget ${FIELD_BUDGET_MIN}–${FIELD_BUDGET_MAX} per model`, () => {
    for (const b of BLOCKS) {
      const n = fieldBudget(b);
      assert.ok(n >= FIELD_BUDGET_MIN && n <= FIELD_BUDGET_MAX, `${b.id}: ${n}`);
    }
  });

  it("bind resolves every place to concrete pointers (list places by index); placesFor goes back", () => {
    for (const b of BLOCKS)
      for (const p of b.places) {
        const at = p.list ? 1 : 0;
        const want = p.fields.map((f) => f.replace(/\*/g, String(at))).join(" ");
        assert.deepEqual(bind(b, p.place, at), { place: p.place, field: want }, `${b.id}: ${p.place}`);
        if (p.list) for (const f of p.fields) assert.ok(f.startsWith(`/${p.list}/*/`), `${b.id}: ${p.place} ${f}`);
        for (const f of p.fields) assert.ok(placesFor(b, f).some((x) => x.place === p.place), `${b.id}: ${f}`);
      }
  });

  it("wireframe props: the variant axes, padding and align only (plus the variant's own align default), no content, id or mode", () => {
    for (const b of BLOCKS)
      for (const v of b.variants) {
        const own = v.settings?.align !== undefined ? { align: v.settings.align } : {};
        assert.deepEqual(wireframeProps(b, v.id), { ...v.axes, ...own }, `${b.id}/${v.id}`);
        assert.deepEqual(wireframeProps(b, v.id, { level: 2, padding: "compact", landmarkLabel: "x" }), { ...v.axes, padding: "compact", ...own }, `${b.id}/${v.id}`);
        assert.deepEqual(wireframeProps(b, v.id, { ...contentOf(b), level: 1 } as never), { ...v.axes, ...own }, `${b.id}/${v.id}: content is not a prop`);
      }
  });
});

/** the settings a block has, out of a wanted set (the header has no padding; the frame blocks without a heading have no level) */
const has = (b: (typeof BLOCKS)[number], s: Record<string, unknown>) => Object.fromEntries(Object.entries(s).filter(([k]) => k in b.settings));
// wave 2: no heading -> no level (figure, footer, header, pull quote); the header is a fixed slim band (no padding); the footer is compact
const NO_LEVEL = ["figure-simple", "footer-simple", "header-simple", "pull-quote-simple"];
const NO_PADDING = ["header-simple"];
const NO_ALIGN = ["figure-simple", "footer-simple", "header-simple", "pull-quote-simple", "purchase-simple", "rating-simple", "split-simple"];

describe("saved instances", () => {
  it("saved content (full and required-only, from the model) is valid for every block and variant", () => {
    for (const b of BLOCKS)
      for (const v of b.variants)
        for (const fill of ["full", "required"] as const)
          assert.deepEqual(validateInstance({ id: "x", item: b.id, variant: v.id, props: { ...contentOf(b, fill), ...has(b, { level: 1, padding: "compact" }), landmarkLabel: "Intro" } }).issues, [], `${b.id}/${v.id} ${fill}`);
  });

  it("flags an unknown item and an unknown variant", () => {
    assert.deepEqual(validateInstance({ id: "x", item: "zz-no-item", variant: "a", props: {} }).issues.map((i) => i.path), ["/item"]);
    for (const b of BLOCKS) assert.deepEqual(validateInstance({ id: "x", item: b.id, variant: "zzNoVariant", props: contentOf(b) }).issues.map((i) => i.path), ["/variant"], b.id);
  });

  it("flags every rule of every model field by pointer (unknown, required, empty, length, scheme, list size, item fields)", () => {
    for (const b of BLOCKS) {
      const cases = invalidContent(MODELS[b.model]!.spec);
      assert.ok(cases.length >= fieldBudget(b), `${b.id}: ${cases.length} cases`);
      for (const c of cases) {
        const r = validateInstance({ id: "x", item: b.id, variant: b.defaultVariant, props: { ...c.content, level: 2 } });
        assert.equal(r.ok, false, `${b.id}: ${c.rule}`);
        assert.ok(r.issues.some((i) => i.path === `/props${c.path}`), `${b.id}: ${c.rule}: ${r.issues.map((i) => i.path).join(" ")}`);
      }
    }
  });

  it("flags a bad value of every enumerated setting at /props/<key>; several issues at once", () => {
    for (const b of BLOCKS) {
      for (const [k] of enumerated(b)) {
        const bad = validateInstance({ id: "x", item: b.id, variant: b.defaultVariant, props: { ...contentOf(b), [k]: "zz-not-a-value" } as never });
        assert.deepEqual(bad.issues.map((i) => i.path), [`/props/${k}`], `${b.id}: ${k}`);
      }
      const many = validateInstance({ id: "x", item: b.id, variant: "zzNoVariant", props: { ...contentOf(b), ...has(b, { level: 4 }), zzUnknown: 1 } as never });
      const paths = many.issues.map((i) => i.path);
      for (const p of ["/variant", ...("level" in b.settings ? ["/props/level"] : []), "/props/zzUnknown"]) assert.ok(paths.includes(p), `${b.id}: ${p} in ${paths.join(" ")}`);
    }
  });
});

describe("settings", () => {
  it("every block has level 1–3 and padding compact | standard | spacious (default standard)", () => {
    assert.deepEqual(BLOCKS.filter((b) => !b.settings.level).map((b) => b.id).sort(), NO_LEVEL);
    assert.deepEqual(BLOCKS.filter((b) => !b.settings.padding).map((b) => b.id).sort(), NO_PADDING);
    for (const b of BLOCKS) {
      if (b.settings.level) assert.deepEqual(settingValues(b.settings.level), [1, 2, 3]);
      if (b.settings.padding) {
        assert.deepEqual(settingValues(b.settings.padding), ["compact", "standard", "spacious"]);
        assert.equal(b.settings.padding.default, b.id === "footer-simple" ? "compact" : "standard");
      }
      assert.equal(settingValues(b.settings.landmarkLabel!), undefined);
    }
  });

  it("every allowed value of every enumerated setting is valid in props; padding and align are drawn by the wireframe", () => {
    for (const b of BLOCKS)
      for (const [k, values] of enumerated(b))
        for (const value of values) {
          assert.deepEqual(validateInstance({ id: "x", item: b.id, variant: b.defaultVariant, props: { ...contentOf(b), [k]: value } }).issues, [], `${b.id}: ${k}=${value}`);
          if (k === "padding" || k === "align") assert.equal(wireframeProps(b, b.defaultVariant, { [k]: value } as never)[k], value, `${b.id}: ${k}=${value}`);
        }
  });

  it("align is a setting: start | center | end (the block default is one of them); a variant default is a known setting value; the saved prop wins", () => {
    // split-simple has no align setting (its copy is fixed at the start): a saved align is an unknown field there
    assert.deepEqual(BLOCKS.filter((b) => !b.settings.align).map((b) => b.id).sort(), NO_ALIGN);
    for (const b of BLOCKS.filter((x) => x.settings.align)) {
      assert.deepEqual(settingValues(b.settings.align!), ["start", "center", "end"]);
      // the block default comes from codegen-x (hero-simple start, team-simple center); it is one of the values, never absent
      assert.ok(settingValues(b.settings.align!)!.includes(b.settings.align!.default as never), `${b.id}: align default ${b.settings.align!.default}`);
      for (const v of b.variants) {
        for (const [k, x] of Object.entries(v.settings ?? {})) {
          assert.ok(k in b.settings, `${b.id}/${v.id}: setting ${k}`);
          const allowed = settingValues(b.settings[k]!);
          if (allowed) assert.ok(allowed.includes(x as never), `${b.id}/${v.id}: ${k}=${x}`);
        }
        const s = variantSettings(b, v.id);
        assert.equal(s.align, v.settings?.align ?? b.settings.align!.default, `${b.id}/${v.id}`);
        if (b.settings.padding) assert.equal(s.padding, v.settings?.padding ?? b.settings.padding.default, `${b.id}/${v.id}`);
        for (const a of settingValues(b.settings.align!)!) assert.equal(wireframeProps(b, v.id, { align: a as never }).align, a, `${b.id}/${v.id}: ${a}`);
      }
    }
  });

  it("splitProps: the contract settings (minus id) are settings, the rest is content", () => {
    for (const b of BLOCKS) {
      assert.deepEqual(settingKeys(b), ["level", "padding", "align", "landmarkLabel"].filter((k) => k in b.settings));
      const content = contentOf(b);
      const { settings, content: rest } = splitProps(b, { ...content, ...has(b, { level: 3 }), id: "nope" });
      assert.deepEqual(settings, has(b, { level: 3 }), b.id);
      assert.deepEqual(rest, { ...content, id: "nope" }, b.id);
    }
  });
});
