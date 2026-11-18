/**
 * Sample content (fixtures): saved blocks `{ id, item, variant, props }` as a builder would store them. Used by the app's
 * page-mode demo and by the tests. Fictional people, English only; images are local files in apps/blocks/public/samples.
 */
import type { BlockInstance } from "../manifest/types";
import type { HeroContent } from "../models/hero";
import type { TeamContent } from "../models/team";
import { swapAt } from "../model/pointer";

export const heroFilled: HeroContent = {
  badge: "New in 2026",
  title: "Launch pages from blocks, not from scratch",
  description:
    "Pick a layout in the feed, fill one small content object and switch variants freely: the content stays where it belongs.",
  image: {
    src: "/samples/hero-light.png",
    srcDark: "/samples/hero-dark.png",
    alt: "Dashboard of a page builder with three stacked sections",
  },
  actionLabel: "Start building",
  actionHref: "https://example.com/start",
};

/** Only the required field kept: badge, description, image and action cleared. */
export const heroMinimal: HeroContent = { title: heroFilled.title };

export const teamFilled: TeamContent = {
  title: "Meet the team",
  description: "Three people who design, build and ship the block catalog.",
  members: [
    { avatar: { src: "/samples/member-1.png", alt: "Portrait of Mira Chen" }, title: "Mira Chen", description: "Design lead" },
    { avatar: { src: "/samples/member-2.png", alt: "Portrait of Jonas Berg" }, title: "Jonas Berg", description: "Frontend engineer" },
    { avatar: { src: "/samples/member-3.png", alt: "Portrait of Lena Ortiz" }, title: "Lena Ortiz", description: "Content strategist" },
  ],
};

/** Only required values: no description, members without photos or roles. */
export const teamMinimal: TeamContent = {
  title: teamFilled.title,
  members: (teamFilled.members ?? []).map((m) => ({ title: m.title })),
};

/** Members 1 and 2 swapped (one data edit, no re-fill). */
export const teamSwapped: TeamContent = swapAt(teamFilled, "/members", 0, 1);

export type SampleId = "filled" | "minimal" | "swapped";
export const SAMPLE_IDS: readonly SampleId[] = ["filled", "minimal", "swapped"];

/** The content of each sample set, per block item id. */
export const SAMPLES: Record<SampleId, Record<string, BlockInstance["props"]>> = {
  filled: { "hero-split": heroFilled, "features-team": teamFilled },
  minimal: { "hero-split": heroMinimal, "features-team": teamMinimal },
  swapped: { "hero-split": heroFilled, "features-team": teamSwapped },
};

/** A saved page: blocks as the builder stores them. */
export const samplePage: BlockInstance[] = [
  { id: "b1", item: "hero-split", variant: "media-right", props: heroFilled },
  { id: "b2", item: "features-team", variant: "columns-3", props: teamFilled },
];
