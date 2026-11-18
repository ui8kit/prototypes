/** UI dictionary. Interface text (aria-label, inspector field labels) comes from here or from props; content comes from `props`. */
export const ui = {
  featuresTeam: {
    label: "Team",
  },
  heroSplit: {
    label: "Hero",
  },
  /** Inspector labels of content-model fields (`label` in models/*.ts is a key of this map). */
  fields: {
    badge: "Badge",
    title: "Title",
    description: "Description",
    image: "Image",
    actionLabel: "Button label",
    actionHref: "Button link",
    members: "Members",
    avatar: "Photo",
    memberTitle: "Name",
    memberDescription: "Role",
  },
  /** Inspector labels of instance options (`options` in the manifests). */
  options: {
    headingLevel: "Heading level",
  },
  themeToggle: {
    label: "Toggle color theme",
  },
} as const;

export type FieldLabelKey = keyof typeof ui.fields;
