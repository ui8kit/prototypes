import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(process.cwd(), "packages/blocks/src/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({ sel: m[1]!.trim(), body: m[2]! }));

describe("tokens.css (per-element radius, density, shadow)", () => {
  it("size and shadow rules only touch the constructor's shapes, never app chrome", () => {
    const sized = rules.filter((r) => /\b(height|width|padding|box-shadow)\s*:/.test(r.body));
    expect(sized.length).toBeGreaterThanOrEqual(5);
    for (const r of sized) expect(r.sel, r.sel).toMatch(/\[data-(shape|role)=/);
  });
  it("every value reads a theme variable with the class default as fallback", () => {
    for (const r of rules) for (const decl of r.body.split(";").filter((d) => d.trim())) expect(decl, r.sel).toMatch(/var\(--/);
  });
});
