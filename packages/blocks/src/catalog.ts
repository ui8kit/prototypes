import type { Component } from "svelte";
import FeaturesTeam from "./features-team/FeaturesTeam.svelte";
import HeroSplit from "./hero-split/HeroSplit.svelte";
import { BLOCKS } from "./manifest/registry";

/** id → organism. Keep in lockstep with `BLOCKS` (enforced in tests). */
export const CATALOG: Record<string, Component<{ variant?: string; count?: number }>> = {
  "hero-split": HeroSplit,
  "features-team": FeaturesTeam,
};

export function catalogIds(): string[] {
  return BLOCKS.map((block) => block.id);
}
