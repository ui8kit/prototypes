/** Registry over the generated contracts: ids, variants, places ↔ model paths, field budget, saved instances. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { BLOCKS, BLOCK_BY_ID, FIELD_BUDGET_MAX, FIELD_BUDGET_MIN, MODELS, fieldBudget, modelPaths, validateInstance } from "./registry";
import { bind, defaultVariantId, paddingOf, placesFor, settingValues, wireframeProps } from "./types";

// saved content as a builder stores it (data only: prototypes never render it)
const hero = { title: "Launch pages from blocks", badge: "New", description: "One small content object.", image: "/hero.png", imageAlt: "A page builder", actionLabel: "Start", actionHref: "https://example.com/start" };
const team = { title: "Meet the team", members: [{ id: "mira", title: "Mira Chen", description: "Design lead", avatar: "/m1.png" }, { id: "jonas", title: "Jonas Berg" }] };
const CONTENT: Record<string, Record<string, unknown>> = { "hero-simple": hero, "team-simple": team };

const generated = JSON.parse(readFileSync(new URL("../generated/manifest.json", import.meta.url), "utf8")) as {
  items: Array<{ item: string; model: string; contract: string }>;
};

describe("registry", () => {
  it("is exactly the generated items, keyed by item id, in manifest order", () => {
    assert.deepEqual(BLOCKS.map((b) => b.id), generated.items.map((i) => i.item));
    for (const i of generated.items) assert.equal(BLOCK_BY_ID[i.item]!.model, i.model);
    assert.equal(new Set(BLOCKS.map((b) => b.id)).size, BLOCKS.length);
  });

  it("every block names a known model, a default variant it has, and the wireframe as its only mode", () => {
    for (const b of BLOCKS) {
      assert.ok(MODELS[b.model], `${b.id}: model ${b.model}`);
      assert.ok(b.variants.some((v) => v.id === b.defaultVariant), `${b.id}: default variant`);
      assert.deepEqual(b.modes, ["wireframe"]);
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

  it("wireframe props: the variant axes and padding only, no content, id or mode", () => {
    const hero = BLOCK_BY_ID["hero-simple"]!;
    assert.deepEqual(wireframeProps(hero, "mediaTop"), { media: "top" });
    assert.deepEqual(wireframeProps(hero, "mediaEnd", { level: 2, padding: "compact", landmarkLabel: "x" }), { media: "end", padding: "compact" });
    assert.equal(defaultVariantId(hero), "mediaEnd");
  });
});

describe("saved instances", () => {
  it("saved content is valid for the model of every block", () => {
    for (const b of BLOCKS) assert.deepEqual(validateInstance({ id: "x", item: b.id, variant: defaultVariantId(b), options: { level: 1 }, props: CONTENT[b.id] }).issues, [], b.id);
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

describe("settings", () => {
  it("every block has level 1–3 and padding compact | standard | spacious (default standard)", () => {
    for (const b of BLOCKS) {
      assert.deepEqual(settingValues(b.settings.level!), [1, 2, 3]);
      assert.deepEqual(settingValues(b.settings.padding!), ["compact", "standard", "spacious"]);
      assert.equal(b.settings.padding!.default, "standard");
      assert.equal(settingValues(b.settings.landmarkLabel!), undefined);
    }
  });

  it("padding is checked as an option and maps from the theme step (default → standard)", () => {
    const ok = validateInstance({ id: "x", item: "team-simple", variant: "cols3", options: { padding: "spacious" }, props: team });
    assert.deepEqual(ok.issues, []);
    const bad = validateInstance({ id: "x", item: "team-simple", variant: "cols3", options: { padding: "huge" as never }, props: team });
    assert.deepEqual(bad.issues.map((i) => i.path), ["/options/padding"]);
    assert.deepEqual(["compact", "default", "spacious"].map((s) => paddingOf(s as never)), ["compact", "standard", "spacious"]);
    assert.equal(wireframeProps(BLOCK_BY_ID["hero-simple"]!, "mediaEnd", { padding: "compact" }).padding, "compact");
  });
});
