/**
 * The only place raw Tailwind utilities live for the constructor.
 * Layout shells and placeholder shapes read from here; block files stay class-free.
 */

export const layout = {
  block: "w-full",
  /** Section padding (theme setting, `Block`): every step a multiple of 8px. */
  section: {
    compact: "py-8 lg:py-16",
    default: "py-16 lg:py-32",
    spacious: "py-24 lg:py-40",
  },
  container: "mx-auto w-full max-w-6xl px-8",
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
  align: {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  },
  justify: {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  },
} as const;

/**
 * Semantic roles of a wireframe. Each role = one shadcn token + one height, so roles stay apart
 * in light and dark. Documented in docs/blocks.md ("Roles"); enforced by shapes/roles.test.ts.
 */
export const role = {
  text: "bg-muted rounded h-2",
  /** 8+4 forbids h-3 in layout scope: a lead is a body bar drawn wider (w-full, 2/3, 1/2). */
  lead: "bg-muted rounded h-2",
  heading: "bg-secondary rounded h-4",
  headingLg: "bg-secondary rounded h-6",
  ctaPrimary: "bg-primary rounded h-10",
  ctaSecondary: "bg-secondary rounded h-10",
  accent: "bg-accent",
  /** accent pill; its corner follows `--radius-badge` (unset: the pill) */
  badge: "bg-accent rounded-full h-6",
  media: "bg-muted rounded",
  surface: "bg-card border border-border rounded",
} as const;

export const shape = {
  textLine: role.text,
  lead: role.lead,
  heading: role.heading,
  headingLg: role.headingLg,
  cta: `${role.ctaPrimary} w-24 shrink-0`,
  ctaSecondary: `${role.ctaSecondary} w-24 shrink-0`,
  avatar: `rounded-full ${role.accent} shrink-0`,
  avatarSm: "h-8 w-8",
  avatarMd: "h-12 w-12",
  avatarLg: "h-16 w-16",
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
  surface: `${role.surface} p-8`,
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
export type SectionPadding = keyof typeof layout.section;
export type MediaRatio = keyof typeof shape.mediaRatio;
export type Width = keyof typeof width;
export type GridColumns = keyof typeof layout.gridMd;
export type Role = keyof typeof role;
export type AvatarSize = "sm" | "md" | "lg";
