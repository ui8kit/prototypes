import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FALLBACK } from "./css";

/** Wireframe roles must stay apart: page, text bar (muted), heading (secondary), accent, primary CTA. */
const ROLE_TOKENS = ["background", "muted", "secondary", "accent", "primary"] as const;
const MIN_STEP = 0.04;

function lightness(v: string): number {
  const m = /^oklch\(([\d.]+)/.exec(v);
  assert.ok(m, `not oklch: ${v}`);
  return Number(m[1]);
}

describe("wireframe role tokens", () => {
  for (const mode of ["light", "dark"] as const) {
    it(`${mode}: background, muted, secondary, accent, primary differ by ≥ ${MIN_STEP} lightness`, () => {
      const tokens = FALLBACK[mode];
      const ls = ROLE_TOKENS.map((t) => [t, lightness(tokens[t])] as const);
      for (let i = 0; i < ls.length; i++) {
        for (let j = i + 1; j < ls.length; j++) {
          assert.ok(
            Math.abs(ls[i][1] - ls[j][1]) >= MIN_STEP,
            `${mode}: ${ls[i][0]} ${ls[i][1]} vs ${ls[j][0]} ${ls[j][1]}`,
          );
        }
      }
    });
  }
});
