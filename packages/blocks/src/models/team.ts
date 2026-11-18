import { defineModel, type ContentOf } from "../model/types";

/** Team content (`team@1`): a heading and an ordered list of members, valid in every team layout. */
export const teamModel = defineModel({
  id: "team",
  version: 1,
  fields: {
    title: { type: "text", maxLength: 120, required: true, label: "title" },
    description: { type: "longText", maxLength: 400, label: "description" },
    members: {
      type: "list",
      label: "members",
      minItems: 0,
      maxItems: 12,
      item: {
        id: "teamMember",
        fields: {
          avatar: { type: "image", label: "avatar" },
          title: { type: "text", maxLength: 80, required: true, label: "memberTitle" },
          description: { type: "longText", maxLength: 240, label: "memberDescription" },
        },
      },
    },
  },
});

export type TeamContent = ContentOf<typeof teamModel>;
export type TeamMember = TeamContent["members"] extends Array<infer M> | undefined ? M : never;
