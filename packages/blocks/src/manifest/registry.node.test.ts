/** Registry over the generated contracts: ids, variants, places ↔ model paths, field budget, saved instances. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { samplePage, SAMPLES, SAMPLE_IDS } from "../fixtures/samples";
import { BLOCKS, BLOCK_BY_ID, FIELD_BUDGET_MAX, FIELD_BUDGET_MIN, MODELS, fieldBudget, modelPaths, validateInstance } from "./registry";
import { bind, defaultVariantId, instanceProps, placesFor, wireframeProps } from "./types";

const generated = JSON.parse(readFileSync(new URL("../generated/manifest.json", import.meta.url), "utf8")) as {
  items: Array<{ item: string; model: string; contract: string }>;
};

describe("registry", () => {
  it("is exactly the generated items, keyed by item id, in manifest order", () => {
    assert.deepEqual(BLOCKS.map((b) => b.id), generated.items.map((i) => i.item));
    for (const i of generated.items) assert.equal(BLOCK_BY_ID[i.item]!.model, i.model);
    assert.equal(new Set(BLOCKS.map((b) => b.id)).size, BLOCKS.length);
  });

  it("every block names a known model, a default variant it has, and both modes (wireframe first)", () => {
    for (const b of BLOCKS) {
      assert.ok(MODELS[b.model], `${b.id}: model ${b.model}`);
      assert.ok(b.variants.some((v) => v.id === b.defaultVariant), `${b.id}: default variant`);
      assert.deepEqual(b.modes, ["wireframe", "page"]);
      assert.equal(b.defaultMode, "wireframe");
    }
  });

  it("variants are layout-only: their axes are the declared axes with declared values", () => {
    for (const b of BLOCKS)
      for (const v of b.variants) {
        assert.deepEqual(Object.keys(v.axes).sort(), Object.keys(b.axes).sort(), `${b.id}/${v.id}`);
        for (const [k, val] of Object.entries(v.axes)) assert.ok(b.axes[k]!.includes(val), `${b.id}/${v.id}: ${k}=${val}`);
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

  it("bind resolves list places to concrete pointers; placesFor goes back", () => {
    const team = BLOCK_BY_ID["team-simple"]!;
    assert.deepEqual(bind(team, "members.title", 1), { place: "members.title", field: "/members/1/title" });
    assert.deepEqual(placesFor(team, "/members/*/avatar").map((p) => p.place), ["members.avatar"]);
    const hero = BLOCK_BY_ID["hero-simple"]!;
    assert.equal(bind(hero, "action").field, "/actionLabel /actionHref");
  });

  it("instance props: variant axes, settings, content, id and mode; wireframe props carry no content", () => {
    const hero = BLOCK_BY_ID["hero-simple"]!;
    const p = instanceProps(hero, samplePage[0]!, "page");
    assert.equal(p.media, "end");
    assert.equal(p.level, 1);
    assert.equal(p.title, SAMPLES.filled["hero-simple"]!.title);
    assert.equal(p.mode, "page");
    assert.deepEqual(wireframeProps(hero, "mediaTop"), { media: "top", id: "hero-simple-mediaTop", mode: "wireframe" });
    assert.equal(defaultVariantId(hero), "mediaEnd");
  });
});

describe("saved instances", () => {
  it("the sample page and every sample set are valid", () => {
    for (const b of samplePage) assert.deepEqual(validateInstance(b).issues, [], b.id);
    for (const s of SAMPLE_IDS)
      for (const b of BLOCKS) {
        const check = validateInstance({ id: "x", item: b.id, variant: defaultVariantId(b), props: SAMPLES[s][b.id] });
        assert.deepEqual(check.issues, [], `${s}/${b.id}`);
      }
  });

  it("flags unknown items, variants, options, bad levels and invalid content by pointer", () => {
    assert.equal(validateInstance({ id: "x", item: "nope", variant: "a", props: {} }).issues[0]!.path, "/item");
    const bad = validateInstance({
      id: "x",
      item: "team-simple",
      variant: "cols5",
      options: { level: 4 as never, headingLevel: 1 } as never,
      props: { title: "T", members: [{ id: "a", title: "" }, { title: "B" }] },
    });
    const paths = bad.issues.map((i) => i.path);
    assert.ok(paths.includes("/variant"));
    assert.ok(paths.includes("/options/level"));
    assert.ok(paths.includes("/options/headingLevel"));
    assert.ok(paths.includes("/props/members/1/id"), paths.join(" "));
    assert.equal(bad.ok, false);
    const many = validateInstance({ id: "x", item: "team-simple", variant: "cols3", props: { title: "T", members: [] } });
    assert.ok(many.issues.some((i) => i.path === "/props/members"));
    const url = validateInstance({ id: "x", item: "hero-simple", variant: "mediaEnd", props: { title: "T", actionHref: "javascript:alert(1)" } });
    assert.ok(url.issues.some((i) => i.path === "/props/actionHref"));
  });
});
