import { featuresTeam } from "../features-team/features-team.block";
import { heroSplit } from "../hero-split/hero-split.block";
import type { BlockCategory, BlockManifest } from "./types";

export const BLOCKS: readonly BlockManifest[] = [heroSplit, featuresTeam];

export const BLOCK_BY_ID: Readonly<Record<string, BlockManifest>> = Object.fromEntries(
  BLOCKS.map((block) => [block.id, block]),
);

export function blocksIn(category: BlockCategory): BlockManifest[] {
  return BLOCKS.filter((block) => block.category === category);
}

export function categoriesPresent(): BlockCategory[] {
  const seen = new Set<BlockCategory>();
  const order: BlockCategory[] = [];
  for (const block of BLOCKS) {
    if (seen.has(block.category)) continue;
    seen.add(block.category);
    order.push(block.category);
  }
  return order;
}
