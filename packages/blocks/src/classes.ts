/**
 * The only place raw Tailwind utilities live for the hand-written part of the catalog.
 * Layout shells and placeholder shapes read from here; block files stay class-free.
 *
 * One source per value: the role table, Stack `align` / `justify`, the `padding` setting presets and the container are
 * codegen-x/ui8kit packages/prototypes `ROLE` / `ALIGN` / `JUSTIFY` / `PADDING` / `CONTAINER`, synced verbatim as
 * `generated/classes.json` (pinned by codegen.lock.json). Only the gallery's own extras (the secondary CTA bar, widths,
 * grid columns, the app shell) are written here.
 */
import generated from "./generated/classes.json" with { type: "json" };

const R = generated.roles;

export const layout = {
  stack: "flex flex-col",
  group: "flex flex-row flex-wrap",
  grid: "grid w-full grid-cols-1",
  gridMd: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  },
  gap: {
    "0": "gap-0",
    "2": "gap-2",
    "4": "gap-4",
    "6": "gap-6",
    "8": "gap-8",
    "10": "gap-10",
    "12": "gap-12",
  },
  align: generated.align,
  justify: generated.justify,
  /** the block `padding` setting (every step a multiple of 8px); generated blocks render it themselves */
  padding: generated.padding,
  container: generated.container,
} as const;

/**
 * Semantic roles of a wireframe. Each role = one shadcn token + one height, so roles stay apart
 * in light and dark. Documented in docs/blocks.md ("Roles"); enforced by shapes/roles.test.ts.
 */
export const role = {
  text: R.text,
  /** 8+4 forbids h-3 in layout scope: a lead is a body bar drawn wider (w-full, 2/3, 1/2). */
  lead: R.text,
  heading: R.heading,
  headingLg: R["heading-lg"],
  ctaPrimary: R["cta-primary"],
  /** gallery-only: the theme panels' secondary button bar */
  ctaSecondary: "bg-secondary rounded h-10",
  /** accent pill; its corner follows `--radius-badge` (unset: the pill) */
  badge: R.badge,
  media: R.media,
  surface: R.surface,
} as const;

export const shape = {
  textLine: role.text,
  lead: role.lead,
  heading: role.heading,
  headingLg: role.headingLg,
  cta: `${role.ctaPrimary} w-24 shrink-0`,
  ctaSecondary: `${role.ctaSecondary} w-24 shrink-0`,
  badge: `${role.badge} w-16 shrink-0`,
  media: `relative flex items-center justify-center overflow-hidden ${role.media} w-full`,
  mediaRatio: {
    "4/3": "aspect-4/3",
    video: "aspect-video",
    "21/9": "aspect-21/9",
  },
  mediaLight: "h-full w-full object-cover dark:hidden",
  mediaDark: "hidden h-full w-full object-cover dark:block",
  mediaOverlay: "absolute inset-0 flex items-center justify-center",
  mediaMark: "rounded-full bg-background h-16 w-16",
  surface: `${role.surface} p-6`,
} as const;

export const width = {
  "1/4": "w-1/4",
  "1/3": "w-1/3",
  "1/2": "w-1/2",
  "2/3": "w-2/3",
  "3/4": "w-3/4",
  full: "w-full",
  "8": "w-8",
  "16": "w-16",
  "24": "w-24",
} as const;

export const app = {
  shell: "min-h-screen bg-background",
  themeToggle: "fixed bottom-8 right-8 bg-secondary rounded h-10 w-10",
} as const;

export type Space = keyof typeof layout.gap;
export type Align = keyof typeof layout.align;
export type Justify = keyof typeof layout.justify;
export type SectionPadding = keyof typeof layout.padding;
export type MediaRatio = keyof typeof shape.mediaRatio;
export type Width = keyof typeof width;
export type GridColumns = keyof typeof layout.gridMd;
export type Role = keyof typeof role;
export type HeadingLevel = 1 | 2 | 3 | 4;
