import { css as hslCss, paletteTokens, withForeground, type Mode } from "./palette";
import { densityVars } from "./density";
import { labToHsl, SKIN_COLORS, type SkinId } from "./skins";
import { NEUTRAL_TOKENS } from "./neutral-tokens";
import { SKIN_NEUTRALS } from "./skin-neutrals";
import type { GlobalTheme } from "./theme";

const round1 = (v: number): number => Math.round(v * 10) / 10;

function skinChromatic(skin: SkinId, mode: Mode): Record<string, string> {
  const row = SKIN_COLORS[skin][mode];
  const primary = labToHsl(row.primary);
  const accent = labToHsl(row.accent);
  const ratio = 4.5;
  const p = withForeground(primary, ratio);
  const a = withForeground(accent, ratio);
  const secondary = withForeground({ h: accent.h, s: Math.min(accent.s, 40), l: mode === "dark" ? 22 : 92 }, ratio);
  const mid = mode === "dark" ? 62 : 52;
  const chart = (h: number, s: number, d: number): string =>
    hslCss({ h, s: Math.min(s, 80), l: Math.min(88, Math.max(12, mid + d)) });
  return {
    primary: hslCss(p.bg),
    "primary-foreground": hslCss(p.fg),
    accent: hslCss(a.bg),
    "accent-foreground": hslCss(a.fg),
    secondary: hslCss(secondary.bg),
    "secondary-foreground": hslCss(secondary.fg),
    ring: hslCss(p.bg),
    "chart-1": chart(primary.h, primary.s, 0),
    "chart-2": chart(accent.h, accent.s, -8),
    "chart-3": chart((primary.h + 120) % 360, primary.s, 8),
    "chart-4": chart((primary.h + 180) % 360, primary.s, -14),
    "chart-5": chart((accent.h + 30) % 360, accent.s, 14),
    "sidebar-primary": hslCss(p.bg),
    "sidebar-primary-foreground": hslCss(p.fg),
    "sidebar-accent": hslCss(a.bg),
    "sidebar-accent-foreground": hslCss(a.fg),
    "sidebar-ring": hslCss(p.bg),
  };
}

function skinNeutrals(skin: SkinId | null, mode: Mode): Record<string, string> {
  const row = SKIN_NEUTRALS[skin ?? "default"];
  if (!row) return {};
  const out: Record<string, string> = {};
  NEUTRAL_TOKENS.forEach((name, i) => {
    const v = row[mode][i];
    if (!v) return;
    const [l, alpha] = v;
    const body = `hsl(0 0% ${round1(l)}%`;
    out[name] = alpha === undefined ? `${body})` : `${body} / ${alpha})`;
  });
  return out;
}

/** Kit defaults (oklch) used for chrome + previews when no skin and no palette. */
const FALLBACK: Record<Mode, Record<string, string>> = {
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.145 0 0)",
    primary: "oklch(0.205 0 0)",
    "primary-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.97 0 0)",
    "secondary-foreground": "oklch(0.205 0 0)",
    muted: "oklch(0.97 0 0)",
    "muted-foreground": "oklch(0.556 0 0)",
    accent: "oklch(0.97 0 0)",
    "accent-foreground": "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0 0)",
  },
  dark: {
    background: "oklch(0.145 0 0)",
    foreground: "oklch(0.985 0 0)",
    card: "oklch(0.205 0 0)",
    "card-foreground": "oklch(0.985 0 0)",
    popover: "oklch(0.205 0 0)",
    "popover-foreground": "oklch(0.985 0 0)",
    primary: "oklch(0.922 0 0)",
    "primary-foreground": "oklch(0.205 0 0)",
    secondary: "oklch(0.269 0 0)",
    "secondary-foreground": "oklch(0.985 0 0)",
    muted: "oklch(0.269 0 0)",
    "muted-foreground": "oklch(0.708 0 0)",
    accent: "oklch(0.269 0 0)",
    "accent-foreground": "oklch(0.985 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.556 0 0)",
  },
};

/** Colour tokens for one mode: custom palette wins; else the named skin; else the kit fallback. */
export function colorVars(theme: GlobalTheme, mode: Mode): Record<string, string> {
  if (theme.palette) {
    return paletteTokens(theme.palette, mode, theme.skin);
  }
  if (theme.skin) {
    return { ...skinNeutrals(theme.skin, mode), ...skinChromatic(theme.skin, mode) };
  }
  return { ...FALLBACK[mode] };
}

export function layoutVars(theme: GlobalTheme): Record<string, string> {
  const out: Record<string, string> = { ...densityVars(theme.density) };
  if (theme.radius !== null) out["--radius"] = `${theme.radius}px`;
  return out;
}

export function cssProperties(theme: GlobalTheme, mode: Mode): Record<string, string> {
  const colors = colorVars(theme, mode);
  const mapped: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors)) mapped[`--${k}`] = v;
  return { ...mapped, ...layoutVars(theme) };
}

function decls(vars: Record<string, string>, indent = "  "): string {
  return Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

/** CSS file with `:root` (light) and `.dark` (dark), plus density/radius. */
export function exportCss(theme: GlobalTheme): string {
  const light = cssProperties(theme, "light");
  const darkColors = colorVars(theme, "dark");
  const dark: Record<string, string> = {};
  for (const [k, v] of Object.entries(darkColors)) dark[`--${k}`] = v;
  const density = theme.density !== "default" ? `[data-density="${theme.density}"]` : null;
  const parts = [`/* prototypes-theme v1 */`, `:root {`, decls(light), `}`];
  if (Object.keys(dark).length) {
    parts.push(``, `.dark {`, decls(dark), `}`);
  }
  if (density) {
    parts.push(``, `${density} {`, decls(densityVars(theme.density)), `}`);
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
