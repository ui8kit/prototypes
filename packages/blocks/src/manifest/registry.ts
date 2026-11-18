import { featuresTeam } from "../features-team/features-team.block";
import { heroSplit } from "../hero-split/hero-split.block";
import { modelKey } from "../models/index";
import { validate, type Issue } from "../model/validate";
import type { BlockCategory, BlockInstance, BlockManifest } from "./types";

export const BLOCKS: readonly BlockManifest[] = [heroSplit, featuresTeam];

/** Registry keyed by the stable item id. */
export const BLOCK_BY_ID: Readonly<Record<string, BlockManifest>> = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

export function blocksIn(category: BlockCategory): BlockManifest[] {
  return BLOCKS.filter((b) => b.category === category);
}

export function categoriesPresent(): BlockCategory[] {
  return [...new Set(BLOCKS.map((b) => b.category))];
}

export type InstanceCheck = { ok: boolean; issues: Array<Issue | { path: string; code: "unknownItem" | "unknownVariant" | "unknownOption" | "optionValue" }> };

/** Check a saved block `{ id, item, variant, props }`: known item, known variant, props valid for the item's model. */
export function validateInstance(instance: BlockInstance<unknown>): InstanceCheck {
  const block = BLOCK_BY_ID[instance.item];
  if (!block) return { ok: false, issues: [{ path: "/item", code: "unknownItem" }] };
  const issues: InstanceCheck["issues"] = [];
  if (!block.variants.some((v) => v.id === instance.variant)) issues.push({ path: "/variant", code: "unknownVariant" });
  for (const [k, v] of Object.entries(instance.options ?? {})) {
    const def = block.options[k];
    if (!def) issues.push({ path: `/options/${k}`, code: "unknownOption" });
    else if (!def.values.includes(v)) issues.push({ path: `/options/${k}`, code: "optionValue" });
  }
  issues.push(...validate(block.model, instance.props).issues.map((i) => ({ ...i, path: i.path })));
  return { ok: issues.length === 0, issues };
}

export const blockModelKey = (block: BlockManifest): string => modelKey(block.model);
