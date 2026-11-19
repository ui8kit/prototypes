import { CATEGORIES, CONTRACTS, MODELS as GENERATED_MODELS } from "../generated/registry";
import type { Issue, ModelField, ModelSpec } from "../generated/models/validate";
import { settingValues, splitProps, type BlockCategory, type BlockInstance, type BlockManifest, type Contract } from "./types";

/**
 * Generated contracts with their catalog category (codegen-x/ui8kit packages/prototypes `out/registry.ts`, synced by
 * scripts/sync-codegen.ts). Nothing here names a block: a synced block is registered by the sync.
 */
const manifest = (contract: unknown): BlockManifest => {
  const c = contract as Contract;
  return { ...c, id: c.item, category: CATEGORIES[c.item] as BlockCategory };
};

export const BLOCKS: readonly BlockManifest[] = CONTRACTS.map(manifest);

/** Registry keyed by the stable item id. */
export const BLOCK_BY_ID: Readonly<Record<string, BlockManifest>> = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

export type ContentModel = { spec: ModelSpec; validate: (value: unknown) => Issue[] };

/** Every content model, keyed `id@version`. Blocks reference these; the count grows with content models, not variants. */
export const MODELS: Readonly<Record<string, ContentModel>> = GENERATED_MODELS;

export function blocksIn(category: BlockCategory): BlockManifest[] {
  return BLOCKS.filter((b) => b.category === category);
}

export function categoriesPresent(): BlockCategory[] {
  return [...new Set(BLOCKS.map((b) => b.category))];
}

/** Field budget: every model path counts once (a list counts 1 plus its item fields); variants and cardinality do not. */
export const FIELD_BUDGET_MIN = 5;
export const FIELD_BUDGET_MAX = 10;
export function modelPaths(fields: Record<string, ModelField>, base = ""): string[] {
  return Object.entries(fields).flatMap(([k, f]) => {
    const path = `${base}/${k}`;
    return f.type === "list" && f.item ? [path, ...modelPaths(f.item.fields, `${path}/*`)] : [path];
  });
}
export const fieldBudget = (block: BlockManifest): number => modelPaths(MODELS[block.model]!.spec.fields).length;

type Code = "unknownItem" | "unknownVariant" | "settingValue";
export type InstanceCheck = { ok: boolean; issues: Array<Issue | { path: string; code: Code }> };

/**
 * Check a saved block `{ id, item, variant, props }`: known item and variant, valid setting values in props, and the
 * rest of props valid for the item's model (an unknown key is the model's `unknown field`).
 */
export function validateInstance(instance: Omit<BlockInstance, "props"> & { props: unknown }): InstanceCheck {
  const block = BLOCK_BY_ID[instance.item];
  if (!block) return { ok: false, issues: [{ path: "/item", code: "unknownItem" }] };
  const issues: InstanceCheck["issues"] = [];
  if (!block.variants.some((v) => v.id === instance.variant)) issues.push({ path: "/variant", code: "unknownVariant" });
  const { settings, content } = splitProps(block, instance.props);
  for (const [k, v] of Object.entries(settings)) {
    const allowed = settingValues(block.settings[k]!);
    if (allowed ? !allowed.includes(v as never) : typeof v !== "string") issues.push({ path: `/props/${k}`, code: "settingValue" });
  }
  issues.push(...MODELS[block.model]!.validate(content).map((i) => ({ ...i, path: `/props${i.path}` })));
  return { ok: issues.length === 0, issues };
}
