import type { Component } from "svelte";
import FeaturesTeam from "./features-team/FeaturesTeam.svelte";
import HeroSplit from "./hero-split/HeroSplit.svelte";
import { BLOCKS } from "./manifest/registry";
import type { Mode } from "./manifest/types";

/** What every organism accepts: a variant id, the mode, and the saved block's props as `content`. */
export type BlockProps = { variant?: string; mode?: Mode; content?: Record<string, unknown> };

/** item id → organism. Keep in lockstep with `BLOCKS` (enforced in tests). */
export const CATALOG: Record<string, Component<BlockProps>> = {
  "hero-split": HeroSplit as Component<BlockProps>,
  "features-team": FeaturesTeam as Component<BlockProps>,
};

export function catalogIds(): string[] {
  return BLOCKS.map((block) => block.id);
}
