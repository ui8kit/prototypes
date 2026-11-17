import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatHsl, hslToHex, parseColour, parseHex, parseHsl, rgbToHsl } from "./colour-input";

describe("the typed colour of the palette's Options: Hex <-> HSL", () => {
  it("Hex in every form, or null", () => {
    assert.deepEqual(parseHex("#3b82f6"), [59, 130, 246]);
    assert.deepEqual(parseHex("3B82F6"), [59, 130, 246]);
    assert.deepEqual(parseHex("#fff"), [255, 255, 255]);
    assert.deepEqual(parseHex(" f00 "), [255, 0, 0]);
    for (const bad of ["#ff", "#ffff", "#gggggg", "#3b82f6ff", "", "blue"]) {
      assert.equal(parseHex(bad), null);
    }
  });

  it("Hex to whole-number HSL (the palette's steps)", () => {
    assert.deepEqual(rgbToHsl([255, 0, 0]), { h: 0, s: 100, l: 50 });
    assert.deepEqual(rgbToHsl([0, 0, 0]), { h: 0, s: 0, l: 0 });
    assert.deepEqual(rgbToHsl([255, 255, 255]), { h: 0, s: 0, l: 100 });
    assert.deepEqual(rgbToHsl([128, 128, 128]), { h: 0, s: 0, l: 50 });
    assert.deepEqual(rgbToHsl(parseHex("#3b82f6")!), { h: 217, s: 91, l: 60 });
    assert.equal(rgbToHsl([255, 0, 1]).h, 0);
  });

  it("HSL to Hex, and the round trip stays within the rounding of whole-number HSL", () => {
    assert.equal(hslToHex({ h: 0, s: 100, l: 50 }), "#ff0000");
    assert.equal(hslToHex({ h: 120, s: 100, l: 25 }), "#008000");
    assert.equal(hslToHex({ h: 0, s: 0, l: 100 }), "#ffffff");
    let worst = 0;
    for (let v = 0; v < 4096; v += 7) {
      const rgb: [number, number, number] = [(v >> 8) * 17, ((v >> 4) & 15) * 17, (v & 15) * 17];
      const back = parseHex(hslToHex(rgbToHsl(rgb)))!;
      worst = Math.max(worst, ...back.map((c, i) => Math.abs(c - rgb[i]!)));
    }
    assert.ok(worst <= 4);
  });

  it("HSL in the token format and its neighbours; out of range or garbage is null", () => {
    assert.deepEqual(parseHsl("217 91% 60%"), { h: 217, s: 91, l: 60 });
    assert.deepEqual(parseHsl("hsl(217 91% 60%)"), { h: 217, s: 91, l: 60 });
    assert.deepEqual(parseHsl("217, 91%, 60%"), { h: 217, s: 91, l: 60 });
    assert.deepEqual(parseHsl("217deg 91 60"), { h: 217, s: 91, l: 60 });
    assert.deepEqual(parseHsl("360 50% 50%"), { h: 0, s: 50, l: 50 });
    assert.deepEqual(parseHsl("12.6 40.4% 50.5%"), { h: 13, s: 40, l: 51 });
    for (const bad of ["361 50% 50%", "10 101% 50%", "10 50% 120%", "-1 50% 50%", "10 50%", "a b c", ""]) {
      assert.equal(parseHsl(bad), null);
    }
    assert.equal(formatHsl({ h: 217, s: 91, l: 60 }), "217 91% 60%");
  });

  it("a typed colour: HSL, else Hex, else nothing", () => {
    assert.deepEqual(parseColour("217 91% 60%"), { hsl: { h: 217, s: 91, l: 60 }, from: "hsl" });
    assert.deepEqual(parseColour("#3b82f6"), { hsl: { h: 217, s: 91, l: 60 }, from: "hex" });
    assert.deepEqual(parseColour("123"), { hsl: rgbToHsl([17, 34, 51]), from: "hex" });
    assert.equal(parseColour("nope"), null);
  });
});
