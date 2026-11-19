/**
 * Section padding (vertical rhythm of Block / section), independent of density.
 * Three steps, every value a multiple of 8px (`--spacing` stays 4px):
 *
 *   compact    py-8  lg:py-16   →  32px / 64px
 *   standard   py-16 lg:py-32   →  64px / 128px
 *   spacious   py-24 lg:py-40   →  96px / 160px
 *
 * The names and class pairs are the block `padding` setting of codegen-x/ui8kit packages/prototypes (`PADDING`,
 * synced as `packages/blocks/src/generated/classes.json`); the gallery passes the theme's step to every block as its
 * `padding` prop. `packages/blocks/src/manifest/classes.node.test.ts` pins this px scale to those classes.
 * `"default"` (the name before UPC-6) is still read as `standard`.
 * `sectionPaddingVars` stays for exported CSS (`--theme-section-py`, `--theme-section-py-lg`).
 */

export const SECTION_PADDINGS = ["compact", "standard", "spacious"] as const;
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
  standard: { py: 64, pyLg: 128 },
  spacious: { py: 96, pyLg: 160 },
};

/** the step of a stored or imported value; `"default"` is the legacy name of `standard` */
export function sectionPaddingOf(v: unknown): SectionPadding {
  if (v === "default") return "standard";
  return typeof v === "string" && (SECTION_PADDINGS as readonly string[]).includes(v) ? (v as SectionPadding) : "standard";
}

export function sectionPaddingVars(p: SectionPadding): Record<string, string> {
  const s = SECTION_PADDING_SCALE[p];
  return {
    "--theme-section-py": `${s.py}px`,
    "--theme-section-py-lg": `${s.pyLg}px`,
  };
}
