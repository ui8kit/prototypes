import { paletteTokens, type Mode } from "./palette";
import { densityVars } from "./density";
import { sectionPaddingVars } from "./section-padding";
import { radiusVars } from "./radii";
import { type SkinId } from "./skins";
import { SKIN_TOKENS } from "./skin-tokens";
import type { GlobalTheme } from "./theme";

/** Colour tokens of a skin, verbatim from codegen-x (skin-tokens.ts); `null` is the shadcn neutral default. */
export function skinColors(skin: SkinId | null, mode: Mode): Record<string, string> {
  const row = SKIN_TOKENS[skin ?? "default"]?.[mode] ?? SKIN_TOKENS.default![mode];
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) if (!SKIN_EXTRAS.has(k)) out[k] = v;
  return out;
}

const SKIN_EXTRAS = new Set(["radius", "shadow-sm", "shadow-md"]);

/** The skin's own radius (`null`: none, the app default stays) and shadow steps for one mode. */
export function skinExtras(skin: SkinId | null, mode: Mode): { radius: string | null; shadowSm: string; shadowMd: string } {
  const row = SKIN_TOKENS[skin ?? "default"]?.[mode] ?? SKIN_TOKENS.default![mode];
  const base = SKIN_TOKENS.default![mode];
  return { radius: skin ? (row.radius ?? null) : null, shadowSm: row["shadow-sm"] ?? base["shadow-sm"]!, shadowMd: row["shadow-md"] ?? base["shadow-md"]! };
}

/** Colour tokens for one mode: a custom palette wins; else the skin's own tokens (light ones in light, dark ones in dark). */
export function colorVars(theme: GlobalTheme, mode: Mode): Record<string, string> {
  if (theme.palette) return { ...skinColors(theme.skin, mode), ...paletteTokens(theme.palette, mode, theme.skin) };
  return skinColors(theme.skin, mode);
}

// ---- wireframe legibility floor ----
// A wireframe has no words: text bars (muted), headings (secondary) and emphasis (accent) only read when they stand apart from the
// page. Many skins keep muted / secondary / accent within 2-4% lightness of the background (amber-minimal light: 98 / 96 / 96 on
// 100). The floor moves only their lightness (hue and saturation stay the skin's), away from the background, and only when they
// are too close. Exported CSS and the JSON config keep the skin's exact values.

export const FLOOR = { muted: 6, secondary: 6, accent: 10, apart: 4 } as const;

type Hsla = { h: number; s: number; l: number; a?: string };
export function parseHslToken(v: string): Hsla | null {
  const m = /^hsl\(\s*(-?[\d.]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%\s*(?:\/\s*([^)]+))?\)$/.exec(v.trim());
  return m ? { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]), ...(m[4] ? { a: m[4].trim() } : {}) } : null;
}
const fmt = (c: Hsla): string => `hsl(${round1(c.h)} ${round1(c.s)}% ${round1(c.l)}%${c.a ? ` / ${c.a}` : ""})`;
const round1 = (v: number): number => Math.round(v * 10) / 10;

/** Muted, secondary and accent pushed apart from the background (light: darker, dark: lighter) when a skin keeps them too close. */
export function legibleRoles(colors: Record<string, string>, mode: Mode): Record<string, string> {
  const bg = colors.background ? parseHslToken(colors.background) : null;
  if (!bg) return colors;
  const dir = mode === "dark" ? 1 : -1;
  const away = (from: number, step: number, c: Hsla): Hsla => {
    if (dir * (c.l - from) >= step) return c;
    return { ...c, l: Math.min(100, Math.max(0, from + dir * step)) };
  };
  const out = { ...colors };
  const muted = colors.muted ? parseHslToken(colors.muted) : null;
  let mutedL = bg.l;
  if (muted) {
    const m = away(bg.l, FLOOR.muted, muted);
    out.muted = fmt(m);
    mutedL = m.l;
  }
  const secondary = colors.secondary ? parseHslToken(colors.secondary) : null;
  let secondaryL = mutedL + dir * FLOOR.secondary;
  if (secondary) {
    const sc = away(mutedL, FLOOR.secondary, away(bg.l, FLOOR.muted + FLOOR.secondary, secondary));
    out.secondary = fmt(sc);
    secondaryL = sc.l;
  }
  const accent = colors.accent ? parseHslToken(colors.accent) : null;
  if (accent) {
    let ac = away(bg.l, FLOOR.accent, accent);
    // a grey accent equal to the text bar or the heading would hide emphasis: step it past the heading
    if (Math.abs(ac.l - mutedL) < FLOOR.apart || Math.abs(ac.l - secondaryL) < FLOOR.apart) {
      ac = { ...ac, l: Math.min(100, Math.max(0, secondaryL + dir * FLOOR.secondary)) };
    }
    out.accent = fmt(ac);
  }
  return out;
}

export function layoutVars(theme: GlobalTheme): Record<string, string> {
  const out: Record<string, string> = {
    ...densityVars(theme.density),
    ...sectionPaddingVars(theme.sectionPadding),
  };
  if (theme.radius !== null) out["--radius"] = `${theme.radius}px`;
  Object.assign(out, radiusVars(theme.radii ?? {}));
  return out;
}

/** Every CSS variable of the theme for one mode. `legible`: apply the wireframe legibility floor (the app does; exports do not). */
export function cssProperties(theme: GlobalTheme, mode: Mode, opts: { legible?: boolean } = {}): Record<string, string> {
  const raw = colorVars(theme, mode);
  const colors = opts.legible ? legibleRoles(raw, mode) : raw;
  const extras = skinExtras(theme.skin, mode);
  const mapped: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors)) mapped[`--${k}`] = v;
  mapped["--shadow-sm"] = extras.shadowSm;
  mapped["--shadow-md"] = extras.shadowMd;
  if (extras.radius) mapped["--radius"] = extras.radius;
  return { ...mapped, ...layoutVars(theme) };
}

function decls(vars: Record<string, string>, indent = "  "): string {
  return Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

/** CSS file with `:root` (light) and `.dark` (dark), plus density / section padding / radius. */
export function exportCss(theme: GlobalTheme): string {
  const light = cssProperties(theme, "light");
  const darkColors = colorVars(theme, "dark");
  const dark: Record<string, string> = {};
  for (const [k, v] of Object.entries(darkColors)) dark[`--${k}`] = v;
  const density = theme.density !== "default" ? `[data-density="${theme.density}"]` : null;
  const section = theme.sectionPadding !== "default" ? `[data-section-padding="${theme.sectionPadding}"]` : null;
  const parts = [`/* prototypes-theme v1 */`, `:root {`, decls(light), `}`];
  if (Object.keys(dark).length) {
    parts.push(``, `.dark {`, decls(dark), `}`);
  }
  if (density) {
    parts.push(``, `${density} {`, decls(densityVars(theme.density)), `}`);
  }
  if (section) {
    parts.push(``, `${section} {`, decls(sectionPaddingVars(theme.sectionPadding)), `}`);
  }
  return parts.join("\n") + "\n";
}

export function applyVars(el: HTMLElement, vars: Record<string, string>, previous: string[] = []): string[] {
  for (const k of previous) el.style.removeProperty(k);
  const keys: string[] = [];
  for (const [k, v] of Object.entries(vars)) {
    el.style.setProperty(k, v);
    keys.push(k);
  }
  return keys;
}
