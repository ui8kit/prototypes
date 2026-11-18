/**
 * Section padding (vertical rhythm of Block / section), independent of density.
 * Three steps, every value a multiple of 8px (`--spacing` stays 4px):
 *
 *   compact    py-8  lg:py-16   →  32px / 64px
 *   default    py-16 lg:py-32   →  64px / 128px
 *   spacious   py-24 lg:py-40   →  96px / 160px
 *
 * Blocks render these real class pairs (`layout.section` in packages/blocks/src/classes.ts; the app provides the
 * theme's step to every Block). ui8px layout spacing is widened to 32 and 40 in `.ui8px/policy/allowed.json`.
 * `sectionPaddingVars` stays for exported CSS (`--theme-section-py`, `--theme-section-py-lg`).
 */

export const SECTION_PADDINGS = ["compact", "default", "spacious"] as const;
export type SectionPadding = (typeof SECTION_PADDINGS)[number];

export type SectionPaddingScale = {
  /** padding-block below the lg breakpoint, px */
  py: number;
  /** padding-block at lg (1024px) and up, px */
  pyLg: number;
};

/** Tailwind step → px (4px base). Every value is a multiple of 8. */
export const SECTION_PADDING_SCALE: Record<SectionPadding, SectionPaddingScale> = {
  compact: { py: 32, pyLg: 64 },
  default: { py: 64, pyLg: 128 },
  spacious: { py: 96, pyLg: 160 },
};

export function sectionPaddingVars(p: SectionPadding): Record<string, string> {
  const s = SECTION_PADDING_SCALE[p];
  return {
    "--theme-section-py": `${s.py}px`,
    "--theme-section-py-lg": `${s.pyLg}px`,
  };
}
