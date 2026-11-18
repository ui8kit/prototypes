/**
 * Sample content (fixtures): saved blocks `{ id, item, variant, options?, props }` as a builder would store them. Used by
 * the app's builder preview and by the tests. Fictional people, English only; images are local files in
 * apps/blocks/public/samples. Shapes are the generated models (src/generated/models: hero@1, team@1).
 */
import type { HeroContent } from "../generated/models/hero@1";
import type { TeamContent } from "../generated/models/team@1";
import type { BlockInstance } from "../manifest/types";

export const heroFilled: HeroContent = {
  badge: "New in 2026",
  title: "Launch pages from blocks, not from scratch",
  description:
    "Pick a layout in the feed, fill one small content object and switch variants freely: the content stays where it belongs.",
  image: "/samples/hero-light.png",
  imageDark: "/samples/hero-dark.png",
  imageAlt: "Dashboard of a page builder with three stacked sections",
  actionLabel: "Start building",
  actionHref: "https://example.com/start",
};

/** Only the required field kept: badge, description, image and action cleared. */
export const heroMinimal: HeroContent = { title: heroFilled.title };

export const teamFilled: TeamContent = {
  title: "Meet the team",
  description: "Three people who design, build and ship the block catalog.",
  members: [
    { id: "mira", avatar: "/samples/member-1.png", title: "Mira Chen", description: "Design lead" },
    { id: "jonas", avatar: "/samples/member-2.png", title: "Jonas Berg", description: "Frontend engineer" },
    { id: "lena", avatar: "/samples/member-3.png", title: "Lena Ortiz", description: "Content strategist" },
  ],
};

/** Only required values: no description, members without photos or roles. */
export const teamMinimal: TeamContent = {
  title: teamFilled.title,
  members: teamFilled.members.map((m) => ({ id: m.id, title: m.title })),
};

/** Members 1 and 2 swapped (one data edit, no re-fill). */
export const teamSwapped: TeamContent = {
  ...teamFilled,
  members: [teamFilled.members[1]!, teamFilled.members[0]!, ...teamFilled.members.slice(2)],
};

export type SampleId = "filled" | "minimal" | "swapped";
export const SAMPLE_IDS: readonly SampleId[] = ["filled", "minimal", "swapped"];

/** The content of each sample set, per block item id. */
export const SAMPLES: Record<SampleId, Record<string, BlockInstance["props"]>> = {
  filled: { "hero-simple": heroFilled, "team-simple": teamFilled },
  minimal: { "hero-simple": heroMinimal, "team-simple": teamMinimal },
  swapped: { "hero-simple": heroFilled, "team-simple": teamSwapped },
};

/** A saved page: blocks as the builder stores them. */
export const samplePage: BlockInstance[] = [
  { id: "b1", item: "hero-simple", variant: "mediaEnd", options: { level: 1 }, props: heroFilled },
  { id: "b2", item: "team-simple", variant: "cols3", props: teamFilled },
];
