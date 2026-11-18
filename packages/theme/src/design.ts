// Per-element design tokens, ported verbatim from codegen-x/ui8kit packages/theme-model/src/design.ts (MIT): radius, density and
// shadow for badge / button / card / alert / media, as one flat map of only the keys that differ (`{}` = nothing changed). The key
// names, value sets and key order are codegen-x's, so a config made there applies here and back. Alert has no shape in this
// constructor: its tokens are kept (and exported) but draw nothing.
import { RADII } from "./skins";

export const ELEMENTS = ["badge", "button", "card", "alert", "media"] as const;
export const SHADOW_ELEMENTS = ["card", "alert", "media"] as const;
export const DENSITY_ELEMENTS = ["badge", "button", "card", "alert"] as const;
export const DENSITIES = ["compact", "default", "comfortable"] as const;
export const SHADOWS = ["none", "sm", "md"] as const;
export type Element = (typeof ELEMENTS)[number];
export type Density = (typeof DENSITIES)[number];
export type Shadow = (typeof SHADOWS)[number];
/** `radius-card`: 16, `density-button`: "comfortable", `shadow-card`: "sm" (only changed keys; absent = the default) */
export type Tokens = Record<string, number | string>;

/** The data-slot each shape carries (codegen-x kit-compose names). */
export const ELEMENT_SLOT = { badge: "badge", button: "button", card: "card", alert: "alert", media: "media-frame" } as const satisfies Record<Element, string>;

export const RADIUS_KEYS = ELEMENTS.map((e) => "radius-" + e);
export const DENSITY_KEYS = DENSITY_ELEMENTS.map((e) => "density-" + e);
export const SHADOW_KEYS = SHADOW_ELEMENTS.map((e) => "shadow-" + e);
/** the value a shadow position writes: the shared scale of the skin (var(--shadow-sm), var(--shadow-md)), or no shadow */
export const SHADOW_VALUE: Record<Shadow, string> = { none: "0 0 #0000", sm: "var(--shadow-sm)", md: "var(--shadow-md)" };

const valid = (k: string, v: unknown): boolean =>
  RADIUS_KEYS.includes(k)
    ? typeof v === "number" && (RADII as readonly number[]).includes(v)
    : DENSITY_KEYS.includes(k)
      ? typeof v === "string" && v !== "default" && (DENSITIES as readonly string[]).includes(v)
      : SHADOW_KEYS.includes(k)
        ? typeof v === "string" && (SHADOWS as readonly string[]).includes(v)
        : false;

/** keep only known keys with a known, non-default value (density "default" is not stored) */
export function cleanTokens(t: unknown): Tokens {
  const out: Tokens = {};
  if (!t || typeof t !== "object" || Array.isArray(t)) return out;
  for (const k of [...RADIUS_KEYS, ...DENSITY_KEYS, ...SHADOW_KEYS]) {
    const v = (t as Record<string, unknown>)[k];
    if (valid(k, v)) out[k] = v as number | string;
  }
  return out;
}

/** set one key; null (or density "default") removes it, so the map holds only what differs */
export function setToken(t: Tokens, key: string, value: number | string | null): Tokens {
  const next = { ...t };
  delete next[key];
  return value === null ? cleanTokens(next) : cleanTokens({ ...next, [key]: value });
}

/** the CSS variables of the tokens (`--radius-card: 16px`, `--shadow-card: var(--shadow-sm)`) */
export function tokenVars(t: Tokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(cleanTokens(t))) {
    if (k.startsWith("radius-")) out[`--${k}`] = `${v}px`;
    else if (k.startsWith("shadow-")) out[`--${k}`] = SHADOW_VALUE[v as Shadow];
  }
  return out;
}

/** codegen-x tokenStyle: the same variables as one `style` string */
export const tokenStyle = (t: Tokens): string =>
  Object.entries(tokenVars(t))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

/** the density attributes of the tokens (`data-density-card="comfortable"`) */
export function tokenAttrs(t: Tokens): Record<string, string> {
  const c = cleanTokens(t);
  return Object.fromEntries(
    Object.entries(c)
      .filter(([k]) => k.startsWith("density-"))
      .map(([k, v]) => ["data-" + k, String(v)]),
  );
}

/** one density for every element that has one ("default" clears them) */
export function setDensity(tokens: Tokens, d: Density): Tokens {
  return DENSITY_ELEMENTS.reduce((t, e) => setToken(t, "density-" + e, d === "default" ? null : d), tokens);
}
/** the density shared by every element, or null when they differ */
export function densityOf(tokens: Tokens): Density | null {
  const v = DENSITY_ELEMENTS.map((e) => (tokens["density-" + e] as Density | undefined) ?? "default");
  return v.every((x) => x === v[0]) ? v[0]! : null;
}

/**
 * What a density step draws in this wireframe (packages/blocks/src/tokens.css reads these variables; `data-density-<element>`
 * on <html> selects the step). Card padding and badge height are codegen-x kit.css values; the button is a text-free bar, so
 * its height is kit.css `--h-button` and its width stands in for kit.css `--pad-button`.
 */
export const DENSITY_PX = {
  button: { compact: { h: 32, w: 80 }, default: { h: 40, w: 96 }, comfortable: { h: 48, w: 112 } },
  badge: { compact: { h: 20, w: 56 }, default: { h: 24, w: 64 }, comfortable: { h: 28, w: 72 } },
  card: { compact: { pad: 16 }, default: { pad: 24 }, comfortable: { pad: 32 } },
} as const;
