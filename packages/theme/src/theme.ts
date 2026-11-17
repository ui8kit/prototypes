// Global theme model, ported from codegen-x/ui8kit packages/theme-model/global-theme.ts
// (MIT) and stripped of fonts/typography. Storage key is the app's.

import { cleanPalette, type Palette } from "./palette";
import { RADII, SKIN_IDS, type Radius, type SkinId } from "./skins";
import { DENSITIES, type Density } from "./density";
import { SECTION_PADDINGS, type SectionPadding } from "./section-padding";

export type { SectionPadding };

export type Mode = "light" | "dark";
export const MODES = ["light", "dark"] as const;

export type GlobalTheme = {
  skin: SkinId | null;
  radius: Radius | null;
  density: Density;
  sectionPadding: SectionPadding;
  palette?: Palette;
};

export const NO_THEME: GlobalTheme = { skin: null, radius: null, density: "default", sectionPadding: "default" };

export function cleanTheme(v: unknown): GlobalTheme {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const skin = typeof o.skin === "string" && (SKIN_IDS as readonly string[]).includes(o.skin) ? (o.skin as SkinId) : null;
  const radius = typeof o.radius === "number" && (RADII as readonly number[]).includes(o.radius) ? (o.radius as Radius) : null;
  const density = typeof o.density === "string" && (DENSITIES as readonly string[]).includes(o.density) ? (o.density as Density) : "default";
  const sectionPadding =
    typeof o.sectionPadding === "string" && (SECTION_PADDINGS as readonly string[]).includes(o.sectionPadding)
      ? (o.sectionPadding as SectionPadding)
      : "default";
  const palette = cleanPalette(o.palette);
  return { skin, radius, density, sectionPadding, ...(palette ? { palette } : {}) };
}

export function patchTheme(t: GlobalTheme, patch: Partial<GlobalTheme>): GlobalTheme {
  const next: GlobalTheme = { ...t, ...patch };
  if ("skin" in patch && !("palette" in patch)) delete next.palette;
  if (next.palette === undefined) delete next.palette;
  return cleanTheme(next);
}

export const isDefault = (t: GlobalTheme): boolean =>
  t.skin === null && t.radius === null && t.density === "default" && t.sectionPadding === "default" && !t.palette;

const local = (): Storage | null => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

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

export type ThemeState = { mode: Mode; theme: GlobalTheme };

export const CONFIG_FORMAT = "prototypes-theme";
export const CONFIG_VERSION = 1;
export type ThemeConfig = {
  format: typeof CONFIG_FORMAT;
  version: typeof CONFIG_VERSION;
  mode: Mode;
  skin: SkinId | null;
  radius: Radius | null;
  density: Density;
  sectionPadding: SectionPadding;
  palette: Palette | null;
};

export type ImportResult = { ok: true; mode: Mode | null; theme: GlobalTheme; dropped: string[] } | { ok: false; error: string };

export function toConfig(s: ThemeState): ThemeConfig {
  const t = cleanTheme(s.theme);
  return {
    format: CONFIG_FORMAT,
    version: CONFIG_VERSION,
    mode: s.mode,
    skin: t.skin,
    radius: t.radius,
    density: t.density,
    sectionPadding: t.sectionPadding,
    palette: t.palette ?? null,
  };
}

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
  if (o.format !== undefined && o.format !== CONFIG_FORMAT && o.format !== "magazine-theme") {
    return { ok: false, error: "unknown format" };
  }
  if (o.v === 1 && o.theme && typeof o.theme === "object") o = o.theme as Record<string, unknown>;
  const theme = cleanTheme(o);
  const mode = o.mode === "light" || o.mode === "dark" ? o.mode : null;
  const dropped: string[] = [];
  if (o.skin !== undefined && o.skin !== null && theme.skin === null) dropped.push("skin");
  if (o.radius !== undefined && o.radius !== null && theme.radius === null) dropped.push("radius");
  if (o.density !== undefined && o.density !== "default" && theme.density === "default") {
    dropped.push("density");
  }
  if (o.sectionPadding !== undefined && o.sectionPadding !== "default" && theme.sectionPadding === "default") {
    dropped.push("sectionPadding");
  }
  if (o.mode !== undefined && o.mode !== null && mode === null) dropped.push("mode");
  if (o.palette !== undefined && o.palette !== null && !theme.palette) dropped.push("palette");
  return { ok: true, mode, theme, dropped };
}

export type FieldValue = string | number;
export type FieldId = "mode" | "skin" | "radius" | "density" | "sectionPadding";

export function setThemeField(t: GlobalTheme, id: FieldId, v: FieldValue | null): GlobalTheme {
  if (id === "mode") return t;
  if (id === "skin") {
    const skin = typeof v === "string" && (SKIN_IDS as readonly string[]).includes(v) ? (v as SkinId) : null;
    return patchTheme(t, { skin });
  }
  if (id === "radius") {
    const radius = typeof v === "number" && (RADII as readonly number[]).includes(v) ? (v as Radius) : null;
    return { ...t, radius };
  }
  if (id === "density") {
    const density = typeof v === "string" && (DENSITIES as readonly string[]).includes(v) ? (v as Density) : "default";
    return { ...t, density };
  }
  if (id === "sectionPadding") {
    const sectionPadding =
      typeof v === "string" && (SECTION_PADDINGS as readonly string[]).includes(v) ? (v as SectionPadding) : "default";
    return { ...t, sectionPadding };
  }
  return t;
}
