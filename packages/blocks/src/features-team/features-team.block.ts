import { ui } from "../content/en";
import type { BlockManifest } from "../manifest/types";

export const featuresTeam: BlockManifest = {
  id: "features-team",
  category: "team",
  label: ui.featuresTeam.label,
  content: [
    { id: "title", kind: "title", count: 1 },
    { id: "description", kind: "description", count: 2 },
    {
      id: "members",
      kind: "record",
      record: "teamMember",
      count: { min: 1, max: 6, default: 3 },
      fields: [
        { id: "avatar", kind: "avatar", count: 1 },
        { id: "title", kind: "title", count: 1 },
        { id: "description", kind: "description", count: 2 },
      ],
    },
  ],
  variants: [
    { id: "columns-2", layout: { columns: 2 } },
    { id: "columns-3", layout: { columns: 3 }, default: true },
    { id: "columns-4", layout: { columns: 4 } },
    { id: "cards-3", layout: { columns: 3, cards: true } },
  ],
};
