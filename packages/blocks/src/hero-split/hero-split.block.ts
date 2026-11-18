import { ui } from "../content/en";
import type { BlockManifest } from "../manifest/types";

export const heroSplit: BlockManifest = {
  id: "hero-split",
  category: "hero",
  label: ui.heroSplit.label,
  content: [
    { id: "title", kind: "title", count: 1 },
    { id: "description", kind: "description", count: 2 },
    { id: "image", kind: "image", count: 1 },
    { id: "actionLabel", kind: "actionLabel", count: 1 },
    { id: "actionHref", kind: "actionHref", count: 1 },
  ],
  variants: [
    { id: "media-left", layout: { media: "left" } },
    { id: "media-right", layout: { media: "right" }, default: true },
    { id: "media-top", layout: { media: "top" } },
  ],
};
