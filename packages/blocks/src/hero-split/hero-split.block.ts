import { ui } from "../content/en";
import { heroModel } from "../models/hero";
import type { BlockManifest } from "../manifest/types";

export const heroSplit: BlockManifest<typeof heroModel> = {
  id: "hero-split",
  category: "hero",
  label: ui.heroSplit.label,
  model: heroModel,
  places: [
    { id: "badge", role: "badge", fields: ["/badge"] },
    { id: "title", role: "heading", fields: ["/title"] },
    { id: "description", role: "text", fields: ["/description"] },
    { id: "media", role: "media", fields: ["/image"] },
    { id: "action", role: "action", fields: ["/actionLabel", "/actionHref"] },
  ],
  variants: [
    { id: "media-left", layout: { media: "left" } },
    { id: "media-right", layout: { media: "right" }, default: true },
    { id: "media-top", layout: { media: "top" } },
  ],
};
