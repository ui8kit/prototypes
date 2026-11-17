/**
 * The only place raw Tailwind utilities live for the constructor.
 * Layout shells and placeholder shapes read from here; block files stay class-free.
 */

export const layout = {
  block: "w-full",
  py: {
    "8": "py-8",
    "16": "py-16",
    "24": "py-24",
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

export const shape = {
  textLine: "bg-muted rounded h-2",
  heading: "bg-secondary rounded h-4",
  headingLg: "bg-secondary rounded h-6",
  cta: "bg-primary rounded h-10 w-24 shrink-0",
  avatar: "rounded-full bg-accent shrink-0",
  avatarSm: "h-8 w-8",
  avatarMd: "h-12 w-12",
  avatarLg: "h-16 w-16",
  media: "relative flex items-center justify-center overflow-hidden rounded bg-muted w-full aspect-video",
  mediaLight: "h-full w-full rounded object-cover dark:hidden",
  mediaDark: "hidden h-full w-full rounded object-cover dark:block",
  mediaOverlay: "absolute inset-0 flex items-center justify-center",
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
export type Py = keyof typeof layout.py;
export type Width = keyof typeof width;
export type GridColumns = keyof typeof layout.gridMd;
export type AvatarSize = "sm" | "md" | "lg";
