import heroSimple from "../generated/contracts/hero-simple/1.json" with { type: "json" };
import teamSimple from "../generated/contracts/team-simple/1.json" with { type: "json" };
import { model as heroModel, validateHeroContent } from "../generated/models/hero@1";
import { model as teamModel, validateTeamContent } from "../generated/models/team@1";
import type { Issue, ModelField, ModelSpec } from "../generated/models/validate";
import { settingValues, splitProps, type BlockCategory, type BlockInstance, type BlockManifest, type Contract } from "./types";

/** Generated contracts (codegen-x/ui8kit packages/prototypes, synced by scripts/sync-codegen.ts) plus a catalog category. */
const manifest = (contract: unknown, category: BlockCategory): BlockManifest => {
  const c = contract as Contract;
  return { ...c, id: c.item, category };
};

export const BLOCKS: readonly BlockManifest[] = [manifest(heroSimple, "hero"), manifest(teamSimple, "team")];

/** Registry keyed by the stable item id. */
export const BLOCK_BY_ID: Readonly<Record<string, BlockManifest>> = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

export type ContentModel = { spec: ModelSpec; validate: (value: unknown) => Issue[] };

/** Every content model, keyed `id@version`. Blocks reference these; the count grows with content models, not variants. */
export const MODELS: Readonly<Record<string, ContentModel>> = {
  "hero@1": { spec: heroModel as unknown as ModelSpec, validate: validateHeroContent },
  "team@1": { spec: teamModel as unknown as ModelSpec, validate: validateTeamContent },
};

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
