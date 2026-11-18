import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cleanTheme, fromConfig, NO_THEME, toConfig, type ThemeConfig } from "./theme";
import { cssProperties } from "./css";

const fixture = (name: string): ThemeConfig =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/codegen-x/${name}.json`, import.meta.url)), "utf8")) as ThemeConfig;
const NAMES = ["amber-tokens", "palette-dark", "fonts"] as const;

describe("codegen-x magazine-theme v2: made there, applied here, exported back", () => {
  for (const name of NAMES) {
    it(`${name}: imports with nothing dropped and exports byte for byte`, () => {
      const cfg = fixture(name);
      const r = fromConfig(JSON.stringify(cfg));
      assert.ok(r.ok);
      assert.deepEqual(r.dropped, []);
      assert.equal(r.mode, cfg.mode);
      const back = toConfig({ mode: r.mode!, theme: r.theme });
      assert.equal(JSON.stringify(back), JSON.stringify(cfg));
    });
  }

  it("the amber config draws its tokens: radius, per-element radius, shadow and density", () => {
    const r = fromConfig(fixture("amber-tokens"));
    assert.ok(r.ok);
    const p = cssProperties(r.theme, "light");
    assert.equal(p["--radius"], "8px");
    assert.equal(p["--radius-button"], "16px");
    assert.equal(p["--radius-media"], "0px");
    assert.equal(p["--shadow-card"], "var(--shadow-sm)");
    assert.equal(p["--shadow-media"], "var(--shadow-md)");
    assert.equal(p["--shadow-alert"], "0 0 #0000");
    assert.equal(p["--h-button"], "32px");
    assert.equal(p["--pad-card"], "32px");
    assert.equal(p["--background"], "hsl(0 0% 100%)");
  });

  it("the palette config paints the palette in dark", () => {
    const r = fromConfig(fixture("palette-dark"));
    assert.ok(r.ok);
    assert.equal(r.theme.palette?.harmony, "triadic");
    assert.match(cssProperties(r.theme, "dark")["--primary"]!, /^hsl\(/);
  });
});

describe("our export applies in codegen-x", () => {
  it("is the same shape: format, version, field names and order, tokens keys", () => {
    const cfg = toConfig({ mode: "dark", theme: cleanTheme({ skin: "doom-64", radius: 4, tokens: { "shadow-card": "md", "density-button": "comfortable", "radius-card": 16 } }) });
    assert.deepEqual(Object.keys(cfg), ["format", "version", "mode", "skin", "font", "headingFont", "radius", "tokens", "palette"]);
    assert.equal(cfg.format, "magazine-theme");
    assert.equal(cfg.version, 2);
    assert.deepEqual(Object.keys(cfg.tokens), ["radius-card", "density-button", "shadow-card"]);
  });

  it("sectionPadding (ours) is written only when set, as an extra top-level field codegen-x ignores", () => {
    assert.equal("sectionPadding" in toConfig({ mode: "light", theme: NO_THEME }), false);
    const cfg = toConfig({ mode: "light", theme: { ...NO_THEME, sectionPadding: "spacious" } });
    assert.equal(cfg.sectionPadding, "spacious");
    const r = fromConfig(cfg);
    assert.ok(r.ok && r.theme.sectionPadding === "spacious");
  });

  it("rejects what codegen-x rejects: another format or version", () => {
    assert.equal(fromConfig({ format: "magazine-theme", version: 1 }).ok, false);
    assert.equal(fromConfig({ format: "other" }).ok, false);
    assert.equal(fromConfig("{").ok, false);
  });

  it("names unknown tokens and bad values in dropped", () => {
    const r = fromConfig({ format: "magazine-theme", version: 2, skin: "nope", tokens: { "radius-card": 3, "glow-card": "x", "density-card": "default" } });
    assert.ok(r.ok);
    assert.deepEqual(r.dropped.sort(), ["glow-card", "radius-card", "skin"]);
  });
});
