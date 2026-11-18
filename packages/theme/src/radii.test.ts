import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cleanRadii, radiusVars, RADIUS_ELEMENTS, RADIUS_SLOT } from "./radii";
import { NO_THEME, cleanTheme, fromConfig, isDefault, setThemeField, toConfig } from "./theme";
import { exportCss, layoutVars } from "./css";

describe("radius per element (badge, button, card, media)", () => {
  it("keeps only known elements and radii", () => {
    assert.deepEqual(cleanRadii({ badge: 4, button: 3, card: 16, alert: 8, media: "8" }), { badge: 4, card: 16 });
    assert.deepEqual(cleanTheme({}).radii, {});
  });

  it("writes one CSS variable per set element, nothing for unset ones", () => {
    assert.deepEqual(radiusVars({ button: 0, card: 16 }), { "--radius-button": "0px", "--radius-card": "16px" });
    const vars = layoutVars({ ...NO_THEME, radius: 8, radii: { badge: 4 } });
    assert.equal(vars["--radius"], "8px");
    assert.equal(vars["--radius-badge"], "4px");
    assert.equal(vars["--radius-card"], undefined);
  });

  it("is a theme field, part of the default check, export and import", () => {
    const t = setThemeField(NO_THEME, "radius-card", 16);
    assert.deepEqual(t.radii, { card: 16 });
    assert.equal(isDefault(t), false);
    assert.deepEqual(setThemeField(t, "radius-card", null).radii, {});
    assert.equal(isDefault(setThemeField(t, "radius-card", null)), true);
    const cfg = toConfig({ mode: "light", theme: t });
    assert.deepEqual(cfg.radii, { card: 16 });
    const back = fromConfig(JSON.stringify(cfg));
    assert.ok(back.ok && back.theme.radii.card === 16);
    assert.match(exportCss(t), /--radius-card: 16px/);
  });

  it("every element has a data-slot", () => {
    for (const e of RADIUS_ELEMENTS) assert.ok(RADIUS_SLOT[e]);
  });
});
