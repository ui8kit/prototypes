import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { ui } from "../content/en.ts";
import { heroModel } from "../models/hero.ts";
import { teamModel } from "../models/team.ts";
import { MODELS } from "../models/index.ts";
import { toJsonSchema } from "./json-schema.ts";
import { getAt, resolvePointer, segments, setAt, swapAt, templateOf, toPointer } from "./pointer.ts";
import { leafPaths, modelPaths } from "./types.ts";
import { validate } from "./validate.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("JSON pointers", () => {
  it("builds, resolves and templates RFC 6901 pointers (with escaping)", () => {
    assert.equal(toPointer("members", 1, "title"), "/members/1/title");
    assert.equal(toPointer("a/b", "c~d"), "/a~1b/c~0d");
    assert.deepEqual(segments("/a~1b/c~0d"), ["a/b", "c~d"]);
    assert.equal(resolvePointer("/members/*/title", 2), "/members/2/title");
    assert.equal(templateOf("/members/2/title"), "/members/*/title");
  });

  it("reads and writes immutably; undefined removes; swap reorders a list", () => {
    const v = { title: "A", members: [{ title: "x" }, { title: "y" }] };
    assert.equal(getAt(v, "/members/1/title"), "y");
    const w = setAt(v, "/members/1/title", "z");
    assert.equal(getAt(w, "/members/1/title"), "z");
    assert.equal(v.members[1]!.title, "y", "original untouched");
    assert.equal(w.members[0], v.members[0], "untouched branches are shared");
    assert.equal("title" in setAt(v, "/title", undefined), false);
    const s = swapAt(v, "/members", 0, 1);
    assert.deepEqual(s.members.map((m) => m.title), ["y", "x"]);
  });
});

describe("content models", () => {
  it("lists paths with * for list items; leaves exclude the list itself", () => {
    assert.deepEqual(
      modelPaths(teamModel.fields).map((p) => p.path),
      ["/title", "/description", "/members", "/members/*/avatar", "/members/*/title", "/members/*/description"],
    );
    assert.deepEqual(leafPaths(heroModel.fields), ["/badge", "/title", "/description", "/image", "/actionLabel", "/actionHref"]);
  });

  it("validates required, length, type, unknown keys, image shape and unsafe URLs", () => {
    assert.deepEqual(validate(heroModel, { title: "Hi" }), { ok: true, issues: [] });
    const codes = (v: unknown) => validate(heroModel, v).issues.map((i) => `${i.path}:${i.code}`).sort();
    assert.deepEqual(codes({}), ["/title:required"]);
    assert.deepEqual(codes({ title: "   " }), ["/title:required"], "blank is not filled");
    assert.deepEqual(codes({ title: "x".repeat(121) }), ["/title:maxLength"]);
    assert.deepEqual(codes({ title: "a", badge: null }), ["/badge:type"]);
    assert.deepEqual(codes({ title: "a", extra: 1 }), ["/extra:unknown"]);
    assert.deepEqual(codes({ title: "a", image: { src: "/a.png" } }), ["/image/alt:type"]);
    assert.deepEqual(codes({ title: "a", image: { src: "/a.png", alt: "", url: "x" } }), ["/image/url:unknown"]);
    assert.deepEqual(codes({ title: "a", actionHref: " JavaScript:alert(1)" }), ["/actionHref:unsafeUrl"]);
    assert.deepEqual(codes({ title: "a", image: { src: "data:image/png;base64,AA", alt: "" } }), ["/image/src:unsafeUrl"]);
    assert.deepEqual(codes([]), [":type"], "the root is an object");
  });

  it("validates list items per path and list bounds", () => {
    const codes = (v: unknown) => validate(teamModel, v).issues.map((i) => `${i.path}:${i.code}`).sort();
    assert.deepEqual(codes({ title: "T", members: [{ title: "A" }, { description: "no name" }] }), ["/members/1/title:required"]);
    assert.deepEqual(codes({ title: "T", members: Array.from({ length: 13 }, () => ({ title: "A" })) }), ["/members:maxItems"]);
    assert.deepEqual(codes({ title: "T", members: {} }), ["/members:type"]);
  });

  it("exports JSON Schema that agrees with the model and validate()", () => {
    for (const m of MODELS) {
      const s = toJsonSchema(m, (k) => (ui.fields as Record<string, string>)[k] ?? k) as {
        required: string[];
        properties: Record<string, { maxLength?: number; title: string; pattern?: string }>;
        additionalProperties: boolean;
      };
      assert.equal(s.additionalProperties, false, m.id);
      assert.deepEqual(Object.keys(s.properties), Object.keys(m.fields), m.id);
      assert.deepEqual(s.required, Object.entries(m.fields).filter(([, f]) => f.required).map(([k]) => k), m.id);
      for (const [k, f] of Object.entries(m.fields)) {
        if ("maxLength" in f) assert.equal(s.properties[k]!.maxLength, f.maxLength, `${m.id}${k}`);
        assert.equal(s.properties[k]!.title, (ui.fields as Record<string, string>)[f.label], `${m.id}/${k} title`);
      }
    }
    const hero = toJsonSchema(heroModel) as { properties: { actionHref: { pattern: string } } };
    const safe = new RegExp(hero.properties.actionHref.pattern);
    for (const href of ["javascript:x", " JaVaScRiPt:x", "data:text/html,x", "vbscript:x"]) {
      assert.equal(safe.test(href), false, href);
      assert.equal(validate(heroModel, { title: "a", actionHref: href }).ok, false, href);
    }
    for (const href of ["https://example.com", "/start", "#top", "mailto:a@b.c"]) {
      assert.equal(safe.test(href), true, href);
      assert.equal(validate(heroModel, { title: "a", actionHref: href }).ok, true, href);
    }
  });

  it("ships the generated schema files (bun run contract)", () => {
    for (const m of MODELS) {
      const file = join(ROOT, "schemas", `${m.id}.v${m.version}.schema.json`);
      const shipped = JSON.parse(readFileSync(file, "utf8"));
      assert.equal(shipped.$id, `urn:ui8kit:content:${m.id}:${m.version}`);
    }
  });
});
