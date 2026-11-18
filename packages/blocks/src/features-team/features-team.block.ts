import { ui } from "../content/en";
import { teamModel } from "../models/team";
import { headingLevelOption, type BlockManifest } from "../manifest/types";

export const featuresTeam: BlockManifest<typeof teamModel> = {
  id: "features-team",
  category: "team",
  label: ui.featuresTeam.label,
  model: teamModel,
  places: [
    { id: "title", role: "heading", fields: ["/title"] },
    { id: "description", role: "text", fields: ["/description"] },
    { id: "member", role: "item", fields: ["/members/*"], each: "/members", wireframe: 3 },
    { id: "member.avatar", role: "avatar", fields: ["/members/*/avatar"], each: "/members" },
    { id: "member.title", role: "heading", fields: ["/members/*/title"], each: "/members" },
    { id: "member.description", role: "text", fields: ["/members/*/description"], each: "/members" },
  ],
  variants: [
    { id: "columns-2", layout: { columns: 2 } },
    { id: "columns-3", layout: { columns: 3 }, default: true },
    { id: "columns-4", layout: { columns: 4 } },
    { id: "cards-3", layout: { columns: 3, cards: true } },
  ],
  options: { headingLevel: headingLevelOption },
};
