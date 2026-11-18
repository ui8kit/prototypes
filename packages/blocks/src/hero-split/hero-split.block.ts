import { ui } from "../content/en";
import type { BlockManifest } from "../manifest/types";

export const heroSplit: BlockManifest = {
  id: "hero-split",
  category: "hero",
  label: ui.heroSplit.label,
  slots: [
    { id: "heading", kind: "heading", count: 1 },
    { id: "lines", kind: "text-line", count: 2 },
    { id: "cta", kind: "cta", count: 1 },
    { id: "media", kind: "media", count: 1 },
  ],
  variants: [{ id: "default" }],
};
