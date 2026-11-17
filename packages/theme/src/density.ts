/**
 * Density for the wireframe constructor. Stock maps compact/default/comfortable
 * onto kit control CSS variables (`--pad-button`, `--pad-card`, …). This repo
 * has no kit.css density attributes, so one global density remaps layout
 * tokens that already sit on the 8+4 grid:
 *
 *   compact      default       comfortable
 *   py-8  32px   py-16 64px    py-24 96px
 *   gap-4 16px   gap-8 32px    gap-12 48px
 *   h-8   32px   h-10  40px    h-12  48px
 *
 * `--spacing` stays 4px. Values are always multiples of 8px (CTA height 40px
 * is 4px×10, the control step). App CSS applies the remap via `[data-density]`
 * so packages/blocks class names never change.
 */

export const DENSITIES = ["compact", "default", "comfortable"] as const;
export type Density = (typeof DENSITIES)[number];

export type DensityScale = {
  /** section padding-block, px */
  blockPy: number;
  /** stack/grid gap, px */
  gap: number;
  /** CTA height, px */
  ctaH: number;
  /** CTA width, px */
  ctaW: number;
  /** heading bar height, px */
  headingH: number;
  /** text-line height, px */
  lineH: number;
};

export const DENSITY_SCALE: Record<Density, DensityScale> = {
  compact: { blockPy: 32, gap: 16, ctaH: 32, ctaW: 64, headingH: 16, lineH: 8 },
  default: { blockPy: 64, gap: 32, ctaH: 40, ctaW: 96, headingH: 16, lineH: 8 },
  comfortable: { blockPy: 96, gap: 48, ctaH: 48, ctaW: 96, headingH: 24, lineH: 8 },
};

const STEP = 4;

export function onGrid(px: number): boolean {
  return px === 0 || px % 8 === 0 || px % STEP === 0;
}

export function densityVars(d: Density): Record<string, string> {
  const s = DENSITY_SCALE[d];
  return {
    "--theme-block-py": `${s.blockPy}px`,
    "--theme-gap": `${s.gap}px`,
    "--theme-cta-h": `${s.ctaH}px`,
    "--theme-cta-w": `${s.ctaW}px`,
    "--theme-heading-h": `${s.headingH}px`,
    "--theme-line-h": `${s.lineH}px`,
  };
}
