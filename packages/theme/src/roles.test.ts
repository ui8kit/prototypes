import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { colorVars, cssProperties, FLOOR, legibleRoles, parseHslToken, skinColors } from "./css";
import { SKIN_IDS } from "./skins";
import { SKIN_TOKENS } from "./skin-tokens";
import { NO_THEME } from "./theme";

const L = (v: string | undefined): number => {
  const c = v ? parseHslToken(v) : null;
  assert.ok(c, `not hsl: ${v}`);
  return c.l;
};
const SKINS = [null, ...SKIN_IDS] as const;

describe("skin tokens follow the mode", () => {
  for (const skin of SKINS) {
    it(`${skin ?? "default"}: light paints the light rule, dark the dark rule (verbatim from codegen-x)`, () => {
      const id = skin ?? "default";
      const light = colorVars({ ...NO_THEME, skin }, "light");
      const dark = colorVars({ ...NO_THEME, skin }, "dark");
      assert.equal(light.background, SKIN_TOKENS[id]!.light.background);
      assert.equal(dark.background, SKIN_TOKENS[id]!.dark.background);
      assert.equal(light.muted, SKIN_TOKENS[id]!.light.muted);
      assert.notEqual(light.background, dark.background);
      assert.equal(skinColors(skin, "light").radius, undefined, "radius is not a colour");
    });
  }
});

describe("wireframe legibility floor", () => {
  for (const skin of SKINS) {
    for (const mode of ["light", "dark"] as const) {
      it(`${skin ?? "default"} ${mode}: text, heading and accent stand apart from the page`, () => {
        const props = cssProperties({ ...NO_THEME, skin }, mode, { legible: true });
        const dir = mode === "dark" ? 1 : -1;
        const bg = L(props["--background"]);
        const muted = L(props["--muted"]);
        const secondary = L(props["--secondary"]);
        const accent = L(props["--accent"]);
        assert.ok(dir * (muted - bg) >= FLOOR.muted - 0.05 || muted === 0 || muted === 100, `muted ${muted} vs bg ${bg}`);
        assert.ok(dir * (secondary - muted) >= FLOOR.secondary - 0.05 || secondary === 0 || secondary === 100, `secondary ${secondary} vs muted ${muted}`);
        assert.ok(dir * (accent - bg) >= FLOOR.accent - 0.05 || accent === 0 || accent === 100, `accent ${accent} vs bg ${bg}`);
        const edge = accent === 0 || accent === 100;
        assert.ok(edge || (Math.abs(accent - muted) >= FLOOR.apart - 0.05 && Math.abs(accent - secondary) >= FLOOR.apart - 0.05), `accent ${accent} vs muted ${muted} / secondary ${secondary}`);
      });
    }
  }

  it("keeps hue and saturation, and leaves tokens that are already apart untouched", () => {
    const out = legibleRoles({ background: "hsl(0 0% 100%)", muted: "hsl(210 20% 98%)", secondary: "hsl(220 14% 80%)", accent: "hsl(48 100% 96%)" }, "light");
    assert.equal(out.muted, "hsl(210 20% 94%)");
    assert.equal(out.secondary, "hsl(220 14% 80%)");
    assert.equal(out.accent, "hsl(48 100% 90%)");
  });

  it("exports stay exact (no floor)", () => {
    const exact = cssProperties({ ...NO_THEME, skin: "amber-minimal" }, "light");
    assert.equal(exact["--muted"], SKIN_TOKENS["amber-minimal"]!.light.muted);
  });
});
