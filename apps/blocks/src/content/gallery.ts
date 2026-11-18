import type { BlockCategory } from "@ui8kit/blocks";

export const galleryText = {
  title: "Blocks",
  note: "Prototype library grouped by category. Open a block for the dual preview and the theme panel.",
  back: "All blocks",
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
