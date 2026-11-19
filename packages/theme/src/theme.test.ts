import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DENSITIES, DENSITY_PX, cleanTokens, densityOf, setDensity, tokenVars } from "./design";
import { SECTION_PADDINGS, SECTION_PADDING_SCALE, sectionPaddingVars } from "./section-padding";
import { RADII, SKIN_IDS } from "./skins";
import {
  CONFIG_FORMAT,
  NO_THEME,
  presetTheme,
  rootAttrs,
  cleanTheme,
  fromConfig,
  isDefault,
  patchTheme,
  setThemeField,
  toConfig,
} from "./theme";
import { colorVars, cssProperties, densityVars, exportCss, layoutVars, scopedCss } from "./css";
import { PRESETS_ROW1 } from "./presets";
import { DEFAULT_PALETTE, PALETTE_TOKENS, paletteTokens } from "./palette";

describe("density per element (codegen-x tokens)", () => {
  it("draws on the 4px grid; button and card on 8", () => {
    for (const d of DENSITIES) {
      assert.equal(DENSITY_PX.button[d].h % 8, 0);
      assert.equal(DENSITY_PX.button[d].w % 8, 0);
      assert.equal(DENSITY_PX.card[d].pad % 8, 0);
      assert.equal(DENSITY_PX.badge[d].h % 4, 0);
      assert.equal(DENSITY_PX.badge[d].w % 8, 0);
    }
    assert.deepEqual([DENSITY_PX.button.compact.h, DENSITY_PX.button.default.h, DENSITY_PX.button.comfortable.h], [32, 40, 48]);
    assert.deepEqual([DENSITY_PX.card.compact.pad, DENSITY_PX.card.default.pad, DENSITY_PX.card.comfortable.pad], [16, 24, 32]);
  });

  it("only the elements set write variables", () => {
    assert.deepEqual(densityVars({}), {});
    assert.deepEqual(densityVars({ "density-button": "compact" }), { "--h-button": "32px", "--w-button": "80px" });
    assert.deepEqual(densityVars({ "density-card": "comfortable" }), { "--pad-card": "32px" });
  });

  it("setDensity / densityOf as in codegen-x", () => {
    const t = setDensity({}, "compact");
    assert.deepEqual(t, { "density-badge": "compact", "density-button": "compact", "density-card": "compact", "density-alert": "compact" });
    assert.equal(densityOf(t), "compact");
    assert.equal(densityOf({ "density-card": "comfortable" }), null);
    assert.deepEqual(setDensity(t, "default"), {});
  });

  it("density attributes and the skin on the root", () => {
    assert.deepEqual(rootAttrs({ ...NO_THEME, skin: "sky", tokens: { "density-card": "compact", "radius-card": 8 } }), { "data-skin": "sky", "data-density-card": "compact" });
  });
});

describe("shadow per element", () => {
  it("none / sm / md map to the skin's own shadow scale", () => {
    assert.deepEqual(tokenVars({ "shadow-card": "sm", "shadow-media": "md", "shadow-alert": "none" }), {
      "--shadow-card": "var(--shadow-sm)",
      "--shadow-alert": "0 0 #0000",
      "--shadow-media": "var(--shadow-md)",
    });
  });
  it("the skin's shadow scale differs between light and dark where the skin says so", () => {
    const l = cssProperties({ ...NO_THEME, skin: "doom-64" }, "light");
    const d = cssProperties({ ...NO_THEME, skin: "doom-64" }, "dark");
    assert.ok(l["--shadow-sm"] && d["--shadow-sm"]);
    assert.ok(cssProperties(NO_THEME, "light")["--shadow-md"]);
  });
});

describe("radius per element", () => {
  it("keeps only known keys and radii, in codegen-x order", () => {
    assert.deepEqual(cleanTokens({ "radius-media": 0, "radius-card": 16, "radius-badge": 3, "radius-x": 8 }), { "radius-card": 16, "radius-media": 0 });
    assert.deepEqual(Object.keys(cleanTokens({ "radius-media": 0, "radius-badge": 4 })), ["radius-badge", "radius-media"]);
  });
  it("setThemeField writes tokens; null clears", () => {
    const t = setThemeField(NO_THEME, "radius-card", 16);
    assert.deepEqual(t.tokens, { "radius-card": 16 });
    assert.equal(layoutVars(t)["--radius-card"], "16px");
    assert.equal(isDefault(setThemeField(t, "radius-card", null)), true);
    assert.match(exportCss(t), /--radius-card: 16px/);
  });
});

describe("legacy prototypes-theme v1 migrates to tokens", () => {
  it("radii and one global density become per-element tokens", () => {
    const r = fromConfig({ format: "prototypes-theme", version: 1, mode: "light", skin: "sky", radius: 8, radii: { card: 16, badge: 4 }, density: "comfortable", sectionPadding: "compact", palette: null });
    assert.ok(r.ok);
    assert.deepEqual(r.theme.tokens, { "radius-badge": 4, "radius-card": 16, "density-badge": "comfortable", "density-button": "comfortable", "density-card": "comfortable", "density-alert": "comfortable" });
    assert.equal(r.theme.sectionPadding, "compact");
    const stored = cleanTheme({ skin: "sky", radius: null, radii: { media: 0 }, density: "default", sectionPadding: "default" });
    assert.deepEqual(stored.tokens, { "radius-media": 0 });
  });
});

describe("section padding stays on the even 8px scale", () => {
  it("three levels, every step a multiple of 8, matching py-8/16/24 and lg:py-16/32/40", () => {
    assert.deepEqual([...SECTION_PADDINGS], ["compact", "standard", "spacious"]);
    assert.deepEqual(SECTION_PADDING_SCALE.compact, { py: 32, pyLg: 64 });
    assert.deepEqual(SECTION_PADDING_SCALE.standard, { py: 64, pyLg: 128 });
    assert.deepEqual(SECTION_PADDING_SCALE.spacious, { py: 96, pyLg: 160 });
    for (const id of SECTION_PADDINGS) {
      const s = SECTION_PADDING_SCALE[id];
      assert.equal(s.py % 8, 0, `${id} py`);
      assert.equal(s.pyLg % 8, 0, `${id} pyLg`);
      assert.ok(s.pyLg > s.py);
    }
  });

  it("emits CSS variables and is independent of density", () => {
    const v = sectionPaddingVars("spacious");
    assert.equal(v["--theme-section-py"], "96px");
    assert.equal(v["--theme-section-py-lg"], "160px");
    const mixed = layoutVars(cleanTheme({ tokens: { "density-button": "compact" }, sectionPadding: "spacious" }));
    assert.equal(mixed["--h-button"], "32px");
    assert.equal(mixed["--theme-section-py"], "96px");
    assert.equal(mixed["--theme-section-py-lg"], "160px");
  });
});

describe("writing direction of the preview (ltr | rtl, ours)", () => {
  it("defaults to ltr, keeps rtl, drops an unknown value, exports only rtl and survives a preset", () => {
    assert.equal(NO_THEME.direction, "ltr");
    assert.equal(cleanTheme({}).direction, "ltr");
    assert.equal(cleanTheme({ direction: "rtl" }).direction, "rtl");
    assert.equal(cleanTheme({ direction: "up" }).direction, "ltr");
    const rtl = setThemeField(NO_THEME, "direction", "rtl");
    assert.equal(rtl.direction, "rtl");
    assert.equal(isDefault(rtl), false);
    assert.equal(setThemeField(rtl, "direction", "nope").direction, "ltr");
    assert.equal(toConfig({ mode: "light", theme: NO_THEME }).direction, undefined);
    const config = toConfig({ mode: "light", theme: rtl });
    assert.equal(config.direction, "rtl");
    const back = fromConfig(JSON.stringify(config));
    assert.ok(back.ok && back.theme.direction === "rtl" && back.dropped.length === 0);
    const bad = fromConfig({ format: CONFIG_FORMAT, version: 2, mode: "light", direction: "up" });
    assert.ok(bad.ok && bad.dropped.includes("direction") && bad.theme.direction === "ltr");
    assert.equal(presetTheme(PRESETS_ROW1[0]!, rtl).direction, "rtl");
  });
});

describe("theme model", () => {
  it("cleans unknown skins, radii, density, and palettes", () => {
    assert.deepEqual(cleanTheme({ skin: "nope", radius: 3, density: "huge", tokens: { "density-card": "huge" }, palette: { harmony: "x" } }), NO_THEME);
    assert.equal(cleanTheme({ skin: "nope", sectionPadding: "huge" }).sectionPadding, "standard");
    assert.equal(cleanTheme({ skin: "claude", radius: 8, density: "compact" }).skin, "claude");
    assert.equal(cleanTheme({ sectionPadding: "spacious" }).sectionPadding, "spacious");
    // "default" is the name of `standard` before UPC-6 (saved themes and exports keep loading, nothing reported dropped)
    assert.equal(cleanTheme({ sectionPadding: "default" }).sectionPadding, "standard");
    const legacy = fromConfig({ format: "prototypes-theme", version: 2, mode: "light", sectionPadding: "default" });
    assert.ok(legacy.ok && legacy.theme.sectionPadding === "standard" && !legacy.dropped.includes("sectionPadding"));
    const unknown = fromConfig({ format: "prototypes-theme", version: 2, mode: "light", sectionPadding: "huge" });
    assert.ok(unknown.ok && unknown.dropped.includes("sectionPadding"));
    assert.equal(cleanTheme({ radius: 12 }).radius, 12);
    assert.ok(RADII.includes(0) && RADII.includes(16));
    assert.equal(SKIN_IDS.length, 16);
  });

  it("a skin pick drops the custom palette", () => {
    const t = patchTheme(NO_THEME, { palette: DEFAULT_PALETTE });
    assert.ok(t.palette);
    const next = patchTheme(t, { skin: "sky" });
    assert.equal(next.skin, "sky");
    assert.equal(next.palette, undefined);
  });

  it("round-trips JSON config; magazine-theme is accepted; unknown format is not", () => {
    const state = { mode: "dark" as const, theme: cleanTheme({ skin: "rose", radius: 8, tokens: setDensity({}, "comfortable"), sectionPadding: "spacious", palette: DEFAULT_PALETTE }) };
    const cfg = toConfig(state);
    assert.equal(cfg.format, CONFIG_FORMAT);
    assert.equal(cfg.version, 2);
    const back = fromConfig(JSON.stringify(cfg));
    assert.equal(back.ok, true);
    if (back.ok) {
      assert.equal(back.mode, "dark");
      assert.equal(back.theme.skin, "rose");
      assert.equal(densityOf(back.theme.tokens), "comfortable");
      assert.equal(back.theme.sectionPadding, "spacious");
      assert.deepEqual(back.theme.palette, DEFAULT_PALETTE);
    }
    const mag = fromConfig({ format: "magazine-theme", version: 2, mode: "light", skin: "sky" });
    assert.equal(mag.ok, true);
    if (mag.ok) assert.equal(mag.theme.skin, "sky");
    const bad = fromConfig({ format: "other" });
    assert.equal(bad.ok, false);
    const stored = fromConfig({ v: 1, theme: { skin: "claude" } });
    assert.equal(stored.ok, true);
    if (stored.ok) assert.equal(stored.theme.skin, "claude");
  });

  it("setThemeField and isDefault", () => {
    assert.equal(isDefault(NO_THEME), true);
    const t = setThemeField(NO_THEME, "density-card", "compact");
    assert.equal(t.tokens["density-card"], "compact");
    assert.equal(isDefault(t), false);
    assert.equal(setThemeField(t, "radius", 4).radius, 4);
    assert.equal(setThemeField(t, "skin", "notebook").skin, "notebook");
    assert.equal(setThemeField(t, "mode", "dark").tokens["density-card"], "compact");
    assert.deepEqual(setThemeField(t, "density-card", "default").tokens, {});
    assert.equal(setThemeField(NO_THEME, "sectionPadding", "compact").sectionPadding, "compact");
    assert.equal(isDefault(setThemeField(NO_THEME, "sectionPadding", "spacious")), false);
  });
});

describe("CSS generation", () => {
  it("maps every palette token role onto hsl() for light and dark", () => {
    const light = paletteTokens(DEFAULT_PALETTE, "light", null);
    const dark = paletteTokens(DEFAULT_PALETTE, "dark", "claude");
    for (const name of PALETTE_TOKENS) {
      assert.match(light[name], /^hsl\(/);
      assert.match(dark[name], /^hsl\(/);
    }
    assert.notEqual(light.primary, dark.primary);
    const vars = colorVars({ ...NO_THEME, palette: DEFAULT_PALETTE }, "light");
    assert.equal(vars.primary, light.primary);
    assert.equal(vars.background, light.background);
  });

  it("a named skin without a palette still paints primary, accent, and neutrals", () => {
    const light = colorVars({ ...NO_THEME, skin: "sky", radius: 8 }, "light");
    const dark = colorVars({ ...NO_THEME, skin: "sky", radius: 8 }, "dark");
    assert.match(light.primary, /^hsl\(/);
    assert.match(light.background, /^hsl\(/);
    assert.match(dark.primary, /^hsl\(/);
    assert.notEqual(light.background, dark.background);
  });

  it("no skin and no palette uses the shadcn neutral default skin so light and dark previews still differ", () => {
    const light = colorVars(NO_THEME, "light");
    const dark = colorVars(NO_THEME, "dark");
    assert.equal(light.background, "hsl(0 0% 100%)");
    assert.equal(dark.background, "hsl(0 0% 4%)");
    const layout = layoutVars({ ...NO_THEME, tokens: { "density-card": "compact" }, radius: 16 });
    assert.equal(layout["--radius"], "16px");
    assert.equal(layout["--pad-card"], "16px");
  });

  it("exportCss writes :root and .dark with exact skin values, tokens and section padding", () => {
    const css = exportCss({
      ...NO_THEME,
      skin: "claude",
      radius: 8,
      tokens: { "density-button": "comfortable", "shadow-card": "sm" },
      sectionPadding: "spacious",
      palette: DEFAULT_PALETTE,
    });
    assert.match(css, /magazine-theme v2/);
    assert.match(css, /:root \{/);
    assert.match(css, /\.dark \{/);
    assert.match(css, /--h-button: 48px/);
    assert.match(css, /--shadow-card: var\(--shadow-sm\)/);
    assert.match(css, /--theme-section-py: 96px/);
    assert.match(css, /--theme-section-py-lg: 160px/);
    assert.match(css, /--primary:/);
    assert.match(css, /--radius: 8px/);
    const props = cssProperties({ ...NO_THEME, radius: 4, palette: DEFAULT_PALETTE }, "light");
    assert.equal(props["--radius"], "4px");
    assert.ok(props["--primary"]);
  });
});

describe("brand presets (taste-data row 1)", () => {
  it("every preset is a valid codegen-x theme: known skin, radius and tokens survive cleaning", () => {
    assert.ok(PRESETS_ROW1.length >= 10);
    for (const p of PRESETS_ROW1) {
      const t = presetTheme(p);
      assert.equal(t.skin, p.skin, p.id);
      assert.equal(t.radius, p.radius, p.id);
      assert.deepEqual(t.tokens, cleanTokens(p.tokens), p.id);
      assert.equal(JSON.stringify(t.tokens), JSON.stringify(cleanTokens(p.tokens)));
      const cfg = toConfig({ mode: "light", theme: t });
      const back = fromConfig(cfg);
      assert.ok(back.ok && back.dropped.length === 0, p.id);
    }
  });
  it("a preset keeps the section padding and drops the palette", () => {
    const t = presetTheme(PRESETS_ROW1[0]!, { sectionPadding: "spacious" });
    assert.equal(t.sectionPadding, "spacious");
    assert.equal(t.palette, undefined);
  });
});

describe("scoped previews", () => {
  it("a skin card carries its own light and dark tokens and resets the page's element tokens", () => {
    const css = scopedCss('[data-skin-card="sky"]', { ...NO_THEME, skin: "sky" });
    assert.match(css, /^\[data-skin-card="sky"\]\{/);
    assert.match(css, /\n\.dark \[data-skin-card="sky"\]\{/);
    assert.match(css, /--shadow-card:0 0 #0000/);
    assert.match(css, /--radius:/);
  });
});
