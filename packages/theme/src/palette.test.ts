import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SKIN_IDS } from "./skins";
import { SKIN_NEUTRALS } from "./skin-neutrals";
import {
  AA,
  AAA,
  baseHueFor,
  contrastLevel,
  targetRatio,
  withContrast,
  NEUTRAL_PAIRS,
  NEUTRAL_TOKENS,
  neutralTokens,
  PRESETS,
  samePalette,
  cleanPalette,
  contrast,
  FOREGROUND_PAIRS,
  HARMONIES,
  harmonyColours,
  hueAt,
  OFFSETS,
  PALETTE_TOKENS,
  paletteTokens,
  type Hsl,
  type Palette,
} from "./palette";

const parse = (v: string): Hsl => {
  const m = /^hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)$/.exec(v)!;
  return { h: +m[1]!, s: +m[2]!, l: +m[3]! };
};

describe("palette", () => {
  it("the harmonies keep their angles as the base turns", () => {
    assert.deepEqual(OFFSETS.complementary, [0, 180]);
    assert.deepEqual(OFFSETS.triadic, [0, 120, 240]);
    assert.deepEqual(OFFSETS.square, [0, 90, 180, 270]);
    assert.deepEqual(OFFSETS.tetradic, [0, 60, 180, 240]);
    assert.deepEqual(OFFSETS.split, [0, 150, 210]);
    assert.deepEqual(OFFSETS.analogous, [0, -30, 30]);
    assert.deepEqual(OFFSETS["double-split"], [0, 30, 180, 210]);
    assert.deepEqual(OFFSETS.compound, [0, -30, 30, 165, 195]);
    for (const harmony of HARMONIES) {
      for (const h of [0, 47, 200, 359]) {
        const cs = harmonyColours({ harmony, h, s: 70, l: 50 });
        if (harmony === "monochromatic") {
          assert.equal(new Set(cs.map((c) => c.h)).size, 1);
          continue;
        }
        cs.forEach((c, i) => assert.equal((c.h - h + 360) % 360, (OFFSETS[harmony][i]! + 360) % 360));
      }
    }
  });

  it("dragging any marker turns the whole harmony", () => {
    const p: Palette = { harmony: "triadic", h: 10, s: 50, l: 50 };
    assert.equal(baseHueFor(p, 1, 200), 80);
    assert.equal(harmonyColours({ ...p, h: baseHueFor(p, 1, 200) })[1]!.h, 200);
    assert.equal(hueAt(0, -1), 0);
    assert.equal(hueAt(1, 0), 90);
    assert.equal(hueAt(0, 1), 180);
  });

  it("only the skin's own colour tokens, in the skins' hsl(H S% L%) format; destructive stays the skin's", () => {
    const t = paletteTokens({ harmony: "square", h: 120, s: 60, l: 40 }, "light", "claude");
    assert.deepEqual(Object.keys(t), [...PALETTE_TOKENS]);
    for (const v of Object.values(t)) assert.match(v, /^hsl\([\d.]+ [\d.]+% [\d.]+%( \/ [\d.]+)?\)$/);
    assert.equal("destructive" in t, false);
    assert.equal("destructive-foreground" in t, false);
  });

  it("the neutrals are tinted: the palette's hue, a low saturation, the skin's own lightness (and alpha)", () => {
    const p: Palette = { harmony: "triadic", h: 265, s: 70, l: 45 };
    const t = neutralTokens(p, "light", "claude");
    for (const k of NEUTRAL_TOKENS) assert.equal(parse(t[k]).h, 265);
    assert.equal(t.background, "hsl(265 8% 97%)");
    assert.equal(t.border, "hsl(265 12% 84%)");
    assert.equal(parse(t.foreground).s, 10);
    assert.equal(neutralTokens(p, "dark", null).border, "hsl(265 12% 100% / 0.1)");
    assert.equal(parse(neutralTokens({ ...p, harmony: "monochromatic" }, "light", "claude").background).s, 20);
    assert.equal(parse(neutralTokens({ ...p, s: 0 }, "light", "claude").muted).s, 0);
    assert.throws(() => neutralTokens(p, "light", "no-such-skin"));
  });

  it("the lightness table covers default plus every skin", () => {
    assert.deepEqual(Object.keys(SKIN_NEUTRALS), ["default", ...SKIN_IDS]);
  });

  it("every neutral text passes AA on each of its surfaces, for every skin, both modes and any base colour", () => {
    let n = 0;
    for (const skin of [null, ...SKIN_IDS]) {
      for (const harmony of ["monochromatic", "triadic"] as const) {
        for (let h = 0; h < 360; h += 45) {
          for (const s of [0, 50, 100]) {
            for (const l of [20, 50, 80]) {
              for (const mode of ["light", "dark"] as const) {
                const t = paletteTokens({ harmony, h, s, l }, mode, skin);
                for (const [text, surfaces] of NEUTRAL_PAIRS) {
                  for (const bg of surfaces) {
                    assert.ok(contrast(parse(t[text]), parse(t[bg])) >= AA);
                    n++;
                  }
                }
              }
            }
          }
        }
      }
    }
    assert.ok(n > 20000);
  });

  it("every -foreground pair passes WCAG AA, for any base colour and both modes", () => {
    let n = 0;
    for (const harmony of HARMONIES) {
      for (let h = 0; h < 360; h += 15) {
        for (const s of [0, 35, 70, 100]) {
          for (let l = 0; l <= 100; l += 10) {
            for (const mode of ["light", "dark"] as const) {
              const t = paletteTokens({ harmony, h, s, l }, mode, null);
              for (const [bg, fg] of FOREGROUND_PAIRS) {
                assert.ok(contrast(parse(t[bg]), parse(t[fg])) >= AA);
                n++;
              }
            }
          }
        }
      }
    }
    assert.ok(n > 10000);
  });

  it("16 presets, each a clean palette whose -foreground pairs and neutral texts pass AA in both modes over every skin", () => {
    assert.equal(PRESETS.length, 16);
    assert.equal(new Set(PRESETS.map((p) => p.id)).size, 16);
    for (const { palette } of PRESETS) {
      assert.deepEqual(cleanPalette(palette), palette);
      assert.equal(samePalette(cleanPalette(palette), palette), true);
      for (const mode of ["light", "dark"] as const) {
        for (const skin of [null, ...SKIN_IDS]) {
          const t = paletteTokens(palette, mode, skin);
          for (const [bg, fg] of FOREGROUND_PAIRS) {
            assert.ok(contrast(parse(t[bg]), parse(t[fg])) >= AA);
          }
          for (const [text, surfaces] of NEUTRAL_PAIRS) {
            for (const bg of surfaces) {
              assert.ok(contrast(parse(t[text]), parse(t[bg])) >= AA);
            }
          }
        }
      }
    }
  });

  it("AAA: every -foreground pair and every neutral text reaches 7:1, for every skin, both modes, a palette grid and the 16 presets", () => {
    const pals: Palette[] = [];
    for (const harmony of HARMONIES) {
      for (let h = 0; h < 360; h += 45) {
        for (const s of [0, 50, 100]) {
          for (const l of [0, 10, 25, 50, 75, 90, 100]) {
            pals.push({ harmony, h, s, l, contrast: "AAA" });
          }
        }
      }
    }
    for (const { palette } of PRESETS) pals.push(withContrast(palette, "AAA"));
    let n = 0;
    for (const skin of [null, ...SKIN_IDS]) {
      for (const p of pals) {
        for (const mode of ["light", "dark"] as const) {
          const t = paletteTokens(p, mode, skin);
          for (const [bg, fg] of FOREGROUND_PAIRS) {
            assert.ok(contrast(parse(t[bg]), parse(t[fg])) >= AAA);
            n++;
          }
          for (const [text, surfaces] of NEUTRAL_PAIRS) {
            for (const bg of surfaces) {
              assert.ok(contrast(parse(t[text]), parse(t[bg])) >= AAA);
              n++;
            }
          }
        }
      }
    }
    assert.ok(n > 500000);
  });

  it("the contrast level: absent is AA (the tokens of before), AAA is stored, AA is not written", () => {
    const p: Palette = { harmony: "triadic", h: 220, s: 80, l: 50 };
    assert.equal(contrastLevel(p), "AA");
    assert.equal(targetRatio(p), AA);
    assert.deepEqual(withContrast(p, "AAA"), { ...p, contrast: "AAA" });
    assert.deepEqual(withContrast(withContrast(p, "AAA"), "AA"), p);
    assert.deepEqual(cleanPalette({ ...p, contrast: "AAA" }), { ...p, contrast: "AAA" });
    assert.deepEqual(cleanPalette({ ...p, contrast: "AA" }), p);
    assert.deepEqual(cleanPalette({ ...p, contrast: "max" }), p);
    const aa = paletteTokens(p, "light", "claude");
    const aaa = paletteTokens(withContrast(p, "AAA"), "light", "claude");
    assert.equal(aa.primary, "hsl(220 80% 50%)");
    assert.equal(aaa.primary, "hsl(220 80% 42%)");
    assert.equal(aaa["muted-foreground"], "hsl(220 10% 29%)");
    assert.equal("destructive" in aaa, false);
  });

  it("cleans stored palettes", () => {
    assert.deepEqual(cleanPalette({ harmony: "triadic", h: 370, s: 120, l: -4 }), { harmony: "triadic", h: 10, s: 100, l: 0 });
    assert.equal(cleanPalette({ harmony: "pentad", h: 1, s: 1, l: 1 }), null);
    assert.equal(cleanPalette(null), null);
  });
});
