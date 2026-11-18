import type { BlockCategory } from "@ui8kit/blocks";

export const galleryText = {
  title: "Blocks",
  note: "Prototype library grouped by category. Open a block for the dual preview and the theme panel.",
  back: "All blocks",
  variant: "Layout",
  variants: {
    "media-left": "Media left",
    "media-right": "Media right",
    "media-top": "Media top",
    "columns-2": "Two columns",
    "columns-3": "Three columns",
    "columns-4": "Four columns",
  } as Record<string, string>,
  categories: {
    hero: "Hero",
    features: "Features",
    team: "Team",
    cta: "CTA",
    pricing: "Pricing",
    content: "Content",
    media: "Media",
    nav: "Nav",
    footer: "Footer",
    form: "Form",
    social: "Social",
  } satisfies Record<BlockCategory, string>,
};
