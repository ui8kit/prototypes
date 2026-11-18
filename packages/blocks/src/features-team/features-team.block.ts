import { ui } from "../content/en";
import type { BlockManifest } from "../manifest/types";

export const featuresTeam: BlockManifest = {
  id: "features-team",
  category: "team",
  label: ui.featuresTeam.label,
  slots: [
    { id: "heading", kind: "heading", count: 1 },
    {
      id: "items",
      kind: "item",
      count: { min: 1, max: 6, default: 3 },
      fields: [
        { id: "avatar", kind: "avatar", count: 1 },
        { id: "title", kind: "heading", count: 1 },
        { id: "lines", kind: "text-line", count: 2 },
      ],
    },
  ],
  variants: [
    { id: "default", props: { count: 3 } },
    { id: "pair", props: { count: 2 } },
  ],
};
