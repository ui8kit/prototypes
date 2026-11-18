// Radius per element, ported from codegen-x/ui8kit packages/theme-model/src/design.ts (ELEMENTS, `radius-<element>` tokens)
// and packages/kit-compose/*/src/styles/kit.css (`[data-slot=<slot>].rounded { border-radius: var(--radius-<element>, var(--radius)) }`).
// Alert is not ported: the constructor has no alert shape. Unset = follow the site radius (`--radius`); the badge unset is the pill.
import { RADII, type Radius } from "./skins";

export const RADIUS_ELEMENTS = ["badge", "button", "card", "media"] as const;
export type RadiusElement = (typeof RADIUS_ELEMENTS)[number];
export type Radii = Partial<Record<RadiusElement, Radius>>;

/** The data-slot each shape carries (stock names) and the CSS variable it reads. */
export const RADIUS_SLOT: Record<RadiusElement, string> = {
  badge: "badge",
  button: "button",
  card: "card",
  media: "media-frame",
};

export const radiusVar = (e: RadiusElement): string => `--radius-${e}`;

export function cleanRadii(v: unknown): Radii {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const out: Radii = {};
  for (const e of RADIUS_ELEMENTS) {
    const r = o[e];
    if (typeof r === "number" && (RADII as readonly number[]).includes(r)) out[e] = r as Radius;
  }
  return out;
}

export function setRadius(radii: Radii, e: RadiusElement, r: Radius | null): Radii {
  const next: Radii = { ...radii };
  if (r === null) delete next[e];
  else next[e] = r;
  return next;
}

/** Only the elements that are set: an unset one falls back in CSS (site radius, or the pill for badges). */
export function radiusVars(radii: Radii): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of RADIUS_ELEMENTS) {
    const r = radii[e];
    if (r !== undefined) out[radiusVar(e)] = `${r}px`;
  }
  return out;
}
