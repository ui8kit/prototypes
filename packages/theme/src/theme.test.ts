import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DENSITIES, DENSITY_SCALE, densityVars, onGrid } from "./density";
import { RADII, SKIN_IDS, labToHsl } from "./skins";
import { SKIN_COLORS } from "./skins";
import {
  CONFIG_FORMAT,
  NO_THEME,
  cleanTheme,
  fromConfig,
  isDefault,
  patchTheme,
  setThemeField,
  toConfig,
} from "./theme";
import { colorVars, cssProperties, exportCss, layoutVars } from "./css";
import { DEFAULT_PALETTE, PALETTE_TOKENS, paletteTokens } from "./palette";

describe("density stays on the 8+4 grid", () => {
  it("every scale step is a multiple of 4, and layout steps are multiples of 8 except the CTA control height", () => {
    for (const d of DENSITIES) {
      const s = DENSITY_SCALE[d];
      for (const px of Object.values(s)) {
        assert.equal(onGrid(px), true, `${d} ${px}`);
        assert.equal(px % 4, 0);
      }
      assert.equal(s.blockPy % 8, 0);
      assert.equal(s.gap % 8, 0);
      assert.equal(s.ctaW % 8, 0);
      assert.equal(s.headingH % 8, 0);
      assert.equal(s.lineH % 8, 0);
    }
    assert.equal(DENSITY_SCALE.compact.ctaH, 32);
    assert.equal(DENSITY_SCALE.default.ctaH, 40);
    assert.equal(DENSITY_SCALE.comfortable.ctaH, 48);
  });

  it("emits CSS variables for the app remap", () => {
    const v = densityVars("compact");
    assert.equal(v["--theme-block-py"], "32px");
    assert.equal(v["--theme-gap"], "16px");
    assert.equal(v["--theme-cta-h"], "32px");
  });
});

describe("theme model", () => {
  it("cleans unknown skins, radii, density, and palettes", () => {
    assert.deepEqual(cleanTheme({ skin: "nope", radius: 3, density: "huge", palette: { harmony: "x" } }), NO_THEME);
    assert.equal(cleanTheme({ skin: "claude", radius: 8, density: "compact" }).skin, "claude");
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
    const state = { mode: "dark" as const, theme: cleanTheme({ skin: "rose", radius: 8, density: "comfortable", palette: DEFAULT_PALETTE }) };
    const cfg = toConfig(state);
    assert.equal(cfg.format, CONFIG_FORMAT);
    assert.equal(cfg.version, 1);
    const back = fromConfig(JSON.stringify(cfg));
    assert.equal(back.ok, true);
    if (back.ok) {
      assert.equal(back.mode, "dark");
      assert.equal(back.theme.skin, "rose");
      assert.equal(back.theme.density, "comfortable");
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
    const t = setThemeField(NO_THEME, "density", "compact");
    assert.equal(t.density, "compact");
    assert.equal(isDefault(t), false);
    assert.equal(setThemeField(t, "radius", 4).radius, 4);
    assert.equal(setThemeField(t, "skin", "notebook").skin, "notebook");
    assert.equal(setThemeField(t, "mode", "dark").density, "compact");
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
    const vars = colorVars({ skin: null, radius: null, density: "default", palette: DEFAULT_PALETTE }, "light");
    assert.equal(vars.primary, light.primary);
    assert.equal(vars.background, light.background);
  });

  it("a named skin without a palette still paints primary, accent, and neutrals", () => {
    const light = colorVars({ skin: "sky", radius: 8, density: "default" }, "light");
    const dark = colorVars({ skin: "sky", radius: 8, density: "default" }, "dark");
    assert.match(light.primary, /^hsl\(/);
    assert.match(light.background, /^hsl\(/);
    assert.match(dark.primary, /^hsl\(/);
    assert.notEqual(light.background, dark.background);
    const hsl = labToHsl(SKIN_COLORS.sky.light.primary);
    assert.ok(hsl.s >= 0 && hsl.l >= 0);
  });

  it("no skin and no palette uses the kit fallback so light and dark previews still differ", () => {
    const light = colorVars(NO_THEME, "light");
    const dark = colorVars(NO_THEME, "dark");
    assert.equal(light.background, "oklch(1 0 0)");
    assert.equal(dark.background, "oklch(0.145 0 0)");
    const layout = layoutVars({ ...NO_THEME, density: "compact", radius: 16 });
    assert.equal(layout["--radius"], "16px");
    assert.equal(layout["--theme-gap"], "16px");
  });

  it("exportCss writes :root, .dark, and density", () => {
    const css = exportCss({
      skin: "claude",
      radius: 8,
      density: "comfortable",
      palette: DEFAULT_PALETTE,
    });
    assert.match(css, /prototypes-theme v1/);
    assert.match(css, /:root \{/);
    assert.match(css, /\.dark \{/);
    assert.match(css, /\[data-density="comfortable"\]/);
    assert.match(css, /--primary:/);
    assert.match(css, /--radius: 8px/);
    const props = cssProperties({ skin: null, radius: 4, density: "default", palette: DEFAULT_PALETTE }, "light");
    assert.equal(props["--radius"], "4px");
    assert.ok(props["--primary"]);
  });
});
