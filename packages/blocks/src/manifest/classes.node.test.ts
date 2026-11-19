/**
 * One source per value (UPC-6): the role table, Stack align / justify, the padding presets and the container come from
 * codegen-x `generated/classes.json`; the hand-written classes, the `padding` setting and the theme's section padding
 * scale (packages/theme) must agree with it.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SECTION_PADDINGS, SECTION_PADDING_SCALE } from "../../../theme/src/section-padding";
import generated from "../generated/classes.json" with { type: "json" };
import { layout, role } from "../classes";
import { BLOCKS } from "./registry";
import { BLOCK_ALIGNS, SECTION_PADDING_PRESETS, settingValues } from "./types";

const PX_PER_STEP = 4;
const step = (cls: string, prefix: string): number => {
  const m = new RegExp(`(?:^|\\s)${prefix}(\\d+)(?:\\s|$)`).exec(cls);
  assert.ok(m, `${prefix}N in ${cls}`);
  return Number(m[1]) * PX_PER_STEP;
};

describe("one source: generated/classes.json", () => {
  it("padding names are the same everywhere: codegen-x PADDING, the contract setting, the theme field", () => {
    const names = Object.keys(generated.padding);
    assert.deepEqual([...SECTION_PADDING_PRESETS], names);
    assert.deepEqual([...SECTION_PADDINGS], names);
    for (const b of BLOCKS) assert.deepEqual(settingValues(b.settings.padding!), names, b.id);
    assert.equal(layout.padding, generated.padding);
  });

  it("the theme's section padding px scale is the padding classes (py-N / lg:py-N × 4px), all 8px multiples", () => {
    for (const [name, cls] of Object.entries(generated.padding)) {
      const s = SECTION_PADDING_SCALE[name as keyof typeof SECTION_PADDING_SCALE];
      assert.deepEqual(s, { py: step(cls, "py-"), pyLg: step(cls, "lg:py-") }, name);
      assert.equal(s.py % 8, 0);
      assert.equal(s.pyLg % 8, 0);
    }
  });

  it("the container padding is one value and an 8px multiple", () => {
    assert.equal(layout.container, generated.container);
    assert.equal(step(generated.container, "px-") % 8, 0);
  });

  it("the align setting values are the text-align table, all logical", () => {
    assert.deepEqual([...BLOCK_ALIGNS], Object.keys(generated.textAlign));
    for (const b of BLOCKS) assert.deepEqual(settingValues(b.settings.align!), [...BLOCK_ALIGNS], b.id);
    assert.deepEqual(Object.values(generated.textAlign), ["text-start", "text-center", "text-end"]);
    assert.equal(layout.textAlign, generated.textAlign);
  });

  it("roles, align and justify are read from codegen-x, not restated", () => {
    assert.equal(role.text, generated.roles.text);
    assert.equal(role.heading, generated.roles.heading);
    assert.equal(role.headingLg, generated.roles["heading-lg"]);
    assert.equal(role.ctaPrimary, generated.roles["cta-primary"]);
    assert.equal(role.badge, generated.roles.badge);
    assert.equal(role.media, generated.roles.media);
    assert.equal(role.surface, generated.roles.surface);
    assert.equal(layout.align, generated.align);
    assert.equal(layout.justify, generated.justify);
  });
});
