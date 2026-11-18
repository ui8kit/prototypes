import type { Component } from "svelte";
import FeaturesTeam from "./features-team/FeaturesTeam.svelte";
import HeroSplit from "./hero-split/HeroSplit.svelte";
import { BLOCKS } from "./manifest/registry";
import type { TitleLevel } from "./manifest/types";

/**
 * What every organism accepts: a variant id, the saved block's props as `content`, and its instance options as props of
 * the same name. No mode: rendered directly, a block is rectangle-only (the builder preview sets the mode by context).
 */
export type BlockProps = { variant?: string; content?: Record<string, unknown>; headingLevel?: TitleLevel };

/** item id → organism. Keep in lockstep with `BLOCKS` (enforced in tests). */
export const CATALOG: Record<string, Component<BlockProps>> = {
  "hero-split": HeroSplit as Component<BlockProps>,
  "features-team": FeaturesTeam as Component<BlockProps>,
};

export function catalogIds(): string[] {
  return BLOCKS.map((block) => block.id);
}
