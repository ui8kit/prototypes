// Global theme model, ported from codegen-x/ui8kit packages/theme-model/src/global-theme.ts (MIT). The model, the stored shape
// and the export / import config (`magazine-theme` v2) are codegen-x's, so a theme made in apps/stock applies here and back.
//
// Differences, all lossless:
//   - fonts (font, headingFont, fontScale, fontWidth, fontWeight, headingWeight, tracking) are carried through and exported again,
//     but not drawn: the wireframe has no text. Font ids are checked by shape only (codegen-x checks them against its font list).
//   - `sectionPadding` is this constructor's own field. It is exported only when it is not "standard" ("default", its name before UPC-6, is read as "standard"); codegen-x's importer ignores
//     unknown top-level fields, so the config still applies there.
//   - `direction` ("ltr" | "rtl") is this constructor's own too: the writing direction of the preview (dir on the feed), to
//     check the logical alignment of the blocks (align start / end follow it). Exported only when "rtl"; codegen-x ignores it.
//   - the legacy `prototypes-theme` v1 config and stored themes with `radii` / one global `density` are migrated to tokens.
import { cleanPalette, type Palette } from "./palette";
import { RADII, SKIN_IDS, type SkinId } from "./skins";
import { SECTION_PADDINGS, sectionPaddingOf, type SectionPadding } from "./section-padding";
import type { Preset } from "./presets";
import {
  cleanTokens,
  DENSITIES,
  DENSITY_ELEMENTS,
  ELEMENT_SLOT,
  ELEMENTS,
  setDensity,
  setToken,
  SHADOW_ELEMENTS,
  SHADOWS,
  type Density,
  type Tokens,
} from "./design";

export type { SectionPadding };

/** the writing direction of the preview (`dir` on the feed): start / end of the blocks' align setting follow it */
export const DIRECTIONS = ["ltr", "rtl"] as const;
export type Direction = (typeof DIRECTIONS)[number];
export const directionOf = (v: unknown): Direction => (v === "rtl" ? "rtl" : "ltr");

export type Mode = "light" | "dark";
export const MODES = ["light", "dark"] as const;

export type GlobalTheme = {
  skin: SkinId | null;
  font: string | null;
  headingFont: string | null;
  radius: number | null;
  tokens: Tokens;
  palette?: Palette;
  fontScale?: number;
  fontWidth?: number;
  fontWeight?: number;
  headingWeight?: number;
  tracking?: number;
  /** this constructor's own: vertical rhythm of every Block */
  sectionPadding: SectionPadding;
  /** this constructor's own: the writing direction of the preview */
  direction: Direction;
};

export const NO_THEME: GlobalTheme = { skin: null, font: null, headingFont: null, radius: null, tokens: {}, sectionPadding: "standard", direction: "ltr" };

// ---- font fields: carried through (codegen-x packages/theme-model/src/type.ts value sets) ----
export const FONT_SCALES = [80, 85, 90, 95, 100, 105, 110, 115, 120] as const;
export const FONT_WEIGHTS = [300, 400, 500, 600, 700] as const;
export const TRACKINGS = [-0.05, -0.025, 0, 0.025, 0.05, 0.075, 0.1] as const;
const FONT_ID = /^[a-z0-9][a-z0-9-]*$/;
const cleanFont = (v: unknown): string | null => (typeof v === "string" && FONT_ID.test(v) ? v : null);
const cleanScale = (v: unknown): number | null => (typeof v === "number" && v !== 100 && (FONT_SCALES as readonly number[]).includes(v) ? v : null);
const cleanWidth = (font: string | null, v: unknown): number | null =>
  font && typeof v === "number" && Number.isInteger(v) && v >= 25 && v <= 300 ? v : null;
const cleanWeight = (v: unknown): number | null => (typeof v === "number" && v !== 400 && (FONT_WEIGHTS as readonly number[]).includes(v) ? v : null);
const cleanHeadingWeight = (v: unknown): number | null => (typeof v === "number" && (FONT_WEIGHTS as readonly number[]).includes(v) ? v : null);
const cleanTracking = (v: unknown): number | null => (typeof v === "number" && v !== 0 && (TRACKINGS as readonly number[]).includes(v) ? v : null);

/** legacy (prototypes-theme v1 / stored before round 3): `radii: {card: 8}` and one `density` for every element */
function legacyTokens(o: Record<string, unknown>): Tokens {
  let t: Tokens = {};
  if (o.radii && typeof o.radii === "object" && !Array.isArray(o.radii)) {
    for (const [e, r] of Object.entries(o.radii as Record<string, unknown>)) if (typeof r === "number") t["radius-" + e] = r;
  }
  if (typeof o.density === "string" && (DENSITIES as readonly string[]).includes(o.density)) t = setDensity(cleanTokens(t), o.density as Density);
  return cleanTokens(t);
}

/** a theme from anything (storage, JSON): unknown values become null, unknown tokens are dropped */
export function cleanTheme(v: unknown): GlobalTheme {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const skin = typeof o.skin === "string" && (SKIN_IDS as readonly string[]).includes(o.skin) ? (o.skin as SkinId) : null;
  const font = cleanFont(o.font);
  const headingFont = cleanFont(o.headingFont);
  const radius = typeof o.radius === "number" && (RADII as readonly number[]).includes(o.radius) ? o.radius : null;
  const palette = cleanPalette(o.palette);
  const tokens = o.tokens !== undefined ? cleanTokens(o.tokens) : legacyTokens(o);
  const sectionPadding = sectionPaddingOf(o.sectionPadding);
  const fontScale = cleanScale(o.fontScale);
  const fontWidth = cleanWidth(font, o.fontWidth);
  const fontWeight = cleanWeight(o.fontWeight);
  const headingWeight = cleanHeadingWeight(o.headingWeight);
  const tracking = cleanTracking(o.tracking);
  return {
    skin,
    font,
    headingFont,
    radius,
    tokens,
    ...(palette ? { palette } : {}),
    ...(fontScale !== null ? { fontScale } : {}),
    ...(fontWidth !== null ? { fontWidth } : {}),
    ...(fontWeight !== null ? { fontWeight } : {}),
    ...(headingWeight !== null ? { headingWeight } : {}),
    ...(tracking !== null ? { tracking } : {}),
    sectionPadding,
    direction: directionOf(o.direction),
  };
}

/** a patch merged into a theme: choosing a skin drops a custom palette unless the patch sets one; a font drops its width */
export function patchTheme(t: GlobalTheme, patch: Partial<GlobalTheme>): GlobalTheme {
  const next: GlobalTheme = { ...t, ...patch };
  if ("skin" in patch && !("palette" in patch)) delete next.palette;
  if ("font" in patch && !("fontWidth" in patch)) delete next.fontWidth;
  for (const k of ["palette", "fontScale", "fontWidth", "fontWeight", "headingWeight", "tracking"] as const) if (next[k] === undefined) delete next[k];
  return cleanTheme(next);
}

export const isDefault = (t: GlobalTheme): boolean =>
  t.skin === null &&
  t.font === null &&
  t.headingFont === null &&
  t.radius === null &&
  Object.keys(t.tokens).length === 0 &&
  !t.palette &&
  t.fontScale === undefined &&
  t.fontWidth === undefined &&
  t.fontWeight === undefined &&
  t.headingWeight === undefined &&
  t.tracking === undefined &&
  t.sectionPadding === "standard" &&
  t.direction === "ltr";

const local = (): Storage | null => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

/** the theme saved under `key` (`{ v: 1, theme }`, codegen-x's stored shape) */
export function readTheme(key: string, store: Pick<Storage, "getItem"> | null = local()): GlobalTheme {
  try {
    const raw = store?.getItem(key);
    return raw ? cleanTheme((JSON.parse(raw) as { theme?: unknown }).theme) : NO_THEME;
  } catch {
    return NO_THEME;
  }
}

export function writeTheme(key: string, t: GlobalTheme, store: Pick<Storage, "setItem" | "removeItem"> | null = local()): void {
  try {
    if (isDefault(t)) store?.removeItem(key);
    else store?.setItem(key, JSON.stringify({ v: 1, theme: cleanTheme(t) }));
  } catch {
    /* storage blocked */
  }
}

/** the attributes of the root: the skin and the density attributes (codegen-x rootAttrs) */
export function rootAttrs(t: GlobalTheme): Record<string, string> {
  const out: Record<string, string> = t.skin ? { "data-skin": t.skin } : {};
  for (const [k, v] of Object.entries(cleanTokens(t.tokens))) if (k.startsWith("density-")) out["data-" + k] = String(v);
  return out;
}

// ---- the fields this constructor edits (codegen-x FIELDS minus the font fields, plus sectionPadding) ----

export type FieldGroup = "site" | "radius" | "density" | "shadow";
export type FieldValue = string | number;
export type Field = {
  id: string;
  group: FieldGroup;
  element?: string;
  values: readonly FieldValue[];
  nullable: boolean;
  unset: FieldValue | null;
  store: "mode" | "theme" | "tokens";
  slot?: string;
};

export const FIELDS: readonly Field[] = [
  { id: "mode", group: "site", values: MODES, nullable: false, unset: null, store: "mode" },
  { id: "skin", group: "site", values: SKIN_IDS, nullable: true, unset: null, store: "theme" },
  { id: "radius", group: "site", values: RADII, nullable: true, unset: null, store: "theme" },
  { id: "sectionPadding", group: "site", values: SECTION_PADDINGS, nullable: false, unset: "standard", store: "theme" },
  { id: "direction", group: "site", values: DIRECTIONS, nullable: false, unset: "ltr", store: "theme" },
  ...ELEMENTS.map((e): Field => ({ id: "radius-" + e, group: "radius", element: e, values: RADII, nullable: true, unset: null, store: "tokens", slot: ELEMENT_SLOT[e] })),
  ...DENSITY_ELEMENTS.map((e): Field => ({ id: "density-" + e, group: "density", element: e, values: DENSITIES, nullable: false, unset: "default", store: "tokens", slot: ELEMENT_SLOT[e] })),
  ...SHADOW_ELEMENTS.map((e): Field => ({ id: "shadow-" + e, group: "shadow", element: e, values: SHADOWS, nullable: true, unset: null, store: "tokens", slot: ELEMENT_SLOT[e] })),
];
export const fieldOf = (id: string): Field | undefined => FIELDS.find((f) => f.id === id);
export type FieldId = string;

export type ThemeState = { mode: Mode; theme: GlobalTheme };

export function fieldValue(s: ThemeState, id: string): FieldValue | null {
  const f = fieldOf(id);
  if (!f) return null;
  if (f.store === "mode") return s.mode;
  if (f.store === "theme") return (s.theme[id as "skin" | "radius" | "sectionPadding" | "direction"] as FieldValue | null) ?? f.unset;
  return s.theme.tokens[id] ?? f.unset;
}

/** set one field (mode is the controller's); an unknown value clears the field */
export function setThemeField(t: GlobalTheme, id: FieldId, v: FieldValue | null): GlobalTheme {
  const f = fieldOf(id);
  if (!f || f.store === "mode") return t;
  const value = v !== null && f.values.includes(v) ? v : null;
  if (f.store === "theme") return patchTheme(t, { [id]: value ?? f.unset } as Partial<GlobalTheme>);
  return { ...t, tokens: setToken(t.tokens, id, value) };
}

// ---- export / import: codegen-x `magazine-theme` v2 ----

export const CONFIG_FORMAT = "magazine-theme";
export const CONFIG_VERSION = 2;
/** the format this constructor wrote before round 3 (still imported) */
export const LEGACY_FORMAT = "prototypes-theme";
export type ThemeConfig = {
  format: typeof CONFIG_FORMAT;
  version: typeof CONFIG_VERSION;
  mode: Mode;
  skin: string | null;
  font: string | null;
  headingFont: string | null;
  radius: number | null;
  tokens: Tokens;
  palette: Palette | null;
  fontScale?: number;
  fontWidth?: number;
  fontWeight?: number;
  headingWeight?: number;
  tracking?: number;
  /** ours; only when not "standard" (codegen-x ignores it) */
  sectionPadding?: SectionPadding;
  /** ours; only when "rtl" (codegen-x ignores it) */
  direction?: Direction;
};
export type ImportResult = { ok: true; mode: Mode | null; theme: GlobalTheme; dropped: string[] } | { ok: false; error: string };

/** the config of a state, field for field codegen-x toConfig (plus sectionPadding when set) */
export function toConfig(s: ThemeState): ThemeConfig {
  const t = cleanTheme(s.theme);
  return {
    format: CONFIG_FORMAT,
    version: CONFIG_VERSION,
    mode: s.mode,
    skin: t.skin,
    font: t.font,
    headingFont: t.headingFont,
    radius: t.radius,
    tokens: t.tokens,
    palette: t.palette ?? null,
    ...(t.fontScale !== undefined ? { fontScale: t.fontScale } : {}),
    ...(t.fontWidth !== undefined ? { fontWidth: t.fontWidth } : {}),
    ...(t.fontWeight !== undefined ? { fontWeight: t.fontWeight } : {}),
    ...(t.headingWeight !== undefined ? { headingWeight: t.headingWeight } : {}),
    ...(t.tracking !== undefined ? { tracking: t.tracking } : {}),
    ...(t.sectionPadding !== "standard" ? { sectionPadding: t.sectionPadding } : {}),
    ...(t.direction !== "ltr" ? { direction: t.direction } : {}),
  };
}

/**
 * a theme from a config: `magazine-theme` v2, the stored shape (`{ v: 1, theme }`), a bare theme, a codegen-x style preset
 * (format 1), or this constructor's legacy `prototypes-theme` v1. Fields not in the input are unset; a known field with an
 * unknown value is named in `dropped`.
 */
export function fromConfig(input: unknown): ImportResult {
  let v = input;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return { ok: false, error: "not JSON" };
    }
  }
  if (!v || typeof v !== "object" || Array.isArray(v)) return { ok: false, error: "not an object" };
  let o = v as Record<string, unknown>;
  if (o.format !== undefined && o.format !== CONFIG_FORMAT && o.format !== 1 && o.format !== LEGACY_FORMAT) return { ok: false, error: "unknown format" };
  if (o.format === CONFIG_FORMAT && o.version !== CONFIG_VERSION) return { ok: false, error: "unknown version" };
  if (o.v === 1 && o.theme && typeof o.theme === "object") o = o.theme as Record<string, unknown>;
  const theme = cleanTheme(o);
  const mode = o.mode === "light" || o.mode === "dark" ? o.mode : null;
  const dropped: string[] = [];
  for (const k of ["skin", "font", "headingFont", "radius"] as const) if (o[k] !== undefined && o[k] !== null && theme[k] === null) dropped.push(k);
  if (o.mode !== undefined && o.mode !== null && mode === null) dropped.push("mode");
  if (o.palette !== undefined && o.palette !== null && !theme.palette) dropped.push("palette");
  if (o.fontScale !== undefined && o.fontScale !== null && o.fontScale !== 100 && theme.fontScale === undefined) dropped.push("fontScale");
  for (const k of ["fontWeight", "headingWeight", "tracking"] as const) {
    if (o[k] !== undefined && o[k] !== null && theme[k] === undefined && !(k === "fontWeight" && o[k] === 400) && !(k === "tracking" && o[k] === 0)) dropped.push(k);
  }
  if (o.fontWidth !== undefined && o.fontWidth !== null && theme.fontWidth === undefined) dropped.push("fontWidth");
  if (o.sectionPadding !== undefined && sectionPaddingOf(o.sectionPadding) !== o.sectionPadding && o.sectionPadding !== "default") dropped.push("sectionPadding");
  if (o.direction !== undefined && o.direction !== null && o.direction !== directionOf(o.direction)) dropped.push("direction");
  if (o.tokens && typeof o.tokens === "object" && !Array.isArray(o.tokens)) {
    for (const [k, x] of Object.entries(o.tokens as Record<string, unknown>)) {
      if (!(k in theme.tokens) && !(k.startsWith("density-") && x === "default" && fieldOf(k))) dropped.push(k);
    }
  } else if (o.tokens !== undefined && o.tokens !== null) dropped.push("tokens");
  return { ok: true, mode, theme, dropped };
}

/** a brand preset as a theme (skin, fonts, radius, tokens); the custom palette is dropped, section padding and direction stay */
export function presetTheme(p: Preset, keep: Partial<Pick<GlobalTheme, "sectionPadding" | "direction">> = NO_THEME): GlobalTheme {
  return cleanTheme({ skin: p.skin, font: p.font, headingFont: p.headingFont, radius: p.radius, tokens: p.tokens, sectionPadding: keep.sectionPadding, direction: keep.direction });
}
