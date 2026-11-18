import { defineModel, type ContentOf } from "../model/types";

/** Hero content (`hero@1`): one object, valid in every hero layout (media-left, media-right, media-top, …). */
export const heroModel = defineModel({
  id: "hero",
  version: 1,
  fields: {
    badge: { type: "text", maxLength: 40, label: "badge" },
    title: { type: "text", maxLength: 120, required: true, label: "title" },
    description: { type: "longText", maxLength: 400, label: "description" },
    image: { type: "image", label: "image" },
    actionLabel: { type: "text", maxLength: 40, label: "actionLabel" },
    actionHref: { type: "url", label: "actionHref" },
  },
});

export type HeroContent = ContentOf<typeof heroModel>;
