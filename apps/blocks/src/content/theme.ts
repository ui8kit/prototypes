import type { Harmony } from "@ui8kit/theme";

export type ThemeIoText = {
  title: string;
  note: string;
  label: string;
  placeholder: string;
  exportJson: string;
  exportCss: string;
  import: string;
  copied: string;
  copyFailed: string;
  imported: string;
  partial: string;
  invalid: string;
};

export type PaletteText = {
  open: string;
  title: string;
  note: string;
  custom: string;
  reset: string;
  wheel: string;
  harmony: string;
  hue: string;
  saturation: string;
  lightness: string;
  options: { title: string; primary: string; hint: string; error: string };
  contrast: { legend: string; aa: string; aaa: string; note: string };
  harmonies: Record<Harmony, { name: string; hint: string }>;
  presets: { title: string; note: string; names: Record<string, string> };
  samples: {
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    chart: string;
  };
};

export type ThemeText = {
  title: string;
  note: string;
  skin: string;
  default: string;
  radius: string;
  resetRadius: string;
  density: string;
  sectionPadding: string;
  resetAll: string;
  back: string;
  close: string;
  elementRadius: string;
  elementRadiusNote: string;
  elements: Record<"badge" | "button" | "card" | "media", string>;
  follow: string;
  pill: string;
  io: ThemeIoText;
};

export const themeText: ThemeText = {
  title: "Theme",
  note: "Every block in the gallery follows these settings: skin, palette, radius, density and section padding. Light / dark is the toggle in the corner. Fonts are not part of this constructor.",
  skin: "Skin",
  default: "Default",
  radius: "Radius",
  resetRadius: "Reset radius",
  density: "Density",
  sectionPadding: "Section padding",
  resetAll: "Reset theme",
  back: "Back",
  close: "Close",
  elementRadius: "Radius per element",
  elementRadiusNote: "Badges, buttons, cards and media each take their own corner; unset follows the radius above (badges: the pill).",
  elements: { badge: "Badges", button: "Buttons", card: "Cards", media: "Media" },
  follow: "Follow",
  pill: "Pill",
  io: {
    title: "Export / import",
    note: "The whole theme as one JSON config (format prototypes-theme, version 1), or the generated CSS variables. Import replaces the theme. Fonts are never stored.",
    label: "Theme config",
    placeholder: "Paste a theme config (JSON)",
    exportJson: "Copy JSON",
    exportCss: "Copy CSS",
    import: "Import",
    copied: "Copied, and shown below",
    copyFailed: "Shown below (the clipboard is blocked)",
    imported: "Imported",
    partial: "Imported; dropped unknown values",
    invalid: "Not a theme config",
  },
};

export const paletteText: PaletteText = {
  open: "Palette",
  title: "Palette",
  note: "One colour on the wheel and a harmony: turn the wheel and every colour of the skin follows in the same proportions. Only the colours change (the skin's own shadcn tokens). Radius and density stay. Fonts are not part of this constructor.",
  custom: "Custom palette",
  reset: "Back to the skin's colours",
  wheel: "Colour wheel: hue round the wheel, saturation from the centre, lightness on the outer ring",
  harmony: "Harmony",
  hue: "Hue",
  saturation: "Saturation",
  lightness: "Lightness",
  options: {
    title: "Options",
    primary: "Primary colour",
    hint: "HSL as in the tokens (217 91% 60%) or Hex (#3b82f6, the # optional): Hex turns into HSL.",
    error: "Not a colour: type H S% L% (hue 0–360, saturation and lightness 0–100) or a Hex code.",
  },
  contrast: {
    legend: "Text contrast",
    aa: "AA · 4.5:1",
    aaa: "AAA · 7:1",
    note: "WCAG for normal text: every text on the palette's colours and surfaces, muted text included, keeps this ratio. AAA moves the colours further from their text.",
  },
  harmonies: {
    monochromatic: { name: "Monochromatic", hint: "1 hue, 3 shades" },
    analogous: { name: "Analogous", hint: "±30°" },
    complementary: { name: "Complementary", hint: "180°" },
    split: { name: "Split complementary", hint: "180° ± 30°" },
    triadic: { name: "Triadic", hint: "120°" },
    tetradic: { name: "Tetradic", hint: "60° + 180°" },
    square: { name: "Square", hint: "90°" },
    "double-split": { name: "Double split complementary", hint: "two pairs, 30° apart" },
    compound: { name: "Compound", hint: "±30°, 180° ± 15°" },
  },
  samples: {
    primary: "Primary",
    secondary: "Secondary",
    accent: "Accent",
    muted: "Muted",
    chart: "Chart colours",
  },
  presets: {
    title: "Well-known combinations",
    note: "Classic and current pairings, each turned into a harmony: a card sets the whole palette.",
    names: {
      "blue-orange": "Blue and orange",
      "red-green": "Red and green",
      "yellow-violet": "Yellow and violet",
      "navy-gold": "Navy and gold",
      "teal-amber": "Teal and amber",
      "sage-terracotta": "Sage and terracotta",
      "butter-aubergine": "Butter yellow and aubergine",
      "blue-tan": "Rich blue and tan",
      "mint-burgundy": "Mint and burgundy",
      "pink-green": "Pink and green",
      "coral-turquoise": "Coral and turquoise",
      "rgb-triad": "Red, green and blue",
      ocean: "Ocean",
      sunset: "Sunset",
      forest: "Forest",
      lavender: "Lavender tints",
    },
  },
};

export const skinLabels: Record<string, string> = {
  sky: "Sky",
  "modern-minimal": "Modern minimal",
  "violet-bloom": "Violet bloom",
  "t3-chat": "T3 chat",
  bubblegum: "Bubblegum",
  "doom-64": "Doom 64",
  "amber-minimal": "Amber minimal",
  supabase: "Supabase",
  "kodama-grove": "Kodama grove",
  perpetuity: "Perpetuity",
  "cosmic-night": "Cosmic night",
  claude: "Claude",
  "mocha-mousse": "Mocha mousse",
  "neo-brutalism": "Neo brutalism",
  notebook: "Notebook",
  rose: "Rose",
};
