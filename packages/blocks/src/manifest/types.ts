/**
 * Block manifest: the machine-readable contract of one block type (item) for a catalog and a page builder.
 *
 *   item      stable block type id (`hero-split`); a saved block is `{ id, item, variant, props }`
 *   model     the content model of `props` (`hero@1`), shared by every variant and by other blocks with the same content
 *   places    where each value is drawn: a place binds one or more JSON-pointer templates to one spot of the composition
 *   variants  layout-only alternatives; any valid `props` renders fully in every variant
 *
 * Rules (docs/content-contract.md): simple content (5–10 fields), interchangeable variants, full rendering, one composition
 * for the wireframe feed and the finished page (mode), no second render mechanism.
 */
import { modelPaths, type ContentModel } from "../model/types";
import { resolvePointer } from "../model/pointer";

export const BLOCK_CATEGORIES = [
  "hero",
  "features",
  "team",
  "cta",
  "pricing",
  "content",
  "media",
  "nav",
  "footer",
  "form",
  "social",
] as const;
export type BlockCategory = (typeof BLOCK_CATEGORIES)[number];

/** How a block draws: `wireframe` = shapes only (the search feed), `page` = real content from `props`. */
export const MODES = ["wireframe", "page"] as const;
export type Mode = (typeof MODES)[number];

/** What a place is in the composition (wireframe shape / page element). */
export const PLACE_ROLES = ["badge", "heading", "text", "action", "media", "avatar", "item"] as const;
export type PlaceRole = (typeof PLACE_ROLES)[number];

export type Place = {
  /** unique within the block (`action`, `member.title`) */
  id: string;
  role: PlaceRole;
  /** JSON-pointer templates of the values drawn here; `*` is the list index of the instance */
  fields: string[];
  /** a place repeated per list item: the list it repeats over (`/members`) */
  each?: string;
  /** how many list items the wireframe draws (the page draws one per array item) */
  wireframe?: number;
};

export type BlockVariant = {
  id: string;
  /** Layout axes only (media side, column count, card style). Never content. */
  layout: Record<string, string | number | boolean>;
  default?: boolean;
};

export type BlockManifest<M extends ContentModel = ContentModel> = {
  /** stable block type id = `item` of a saved block */
  id: string;
  category: BlockCategory;
  /** Region name from the dictionary (aria-label). */
  label: string;
  model: M;
  places: Place[];
  variants: BlockVariant[];
};

/** A block as a builder saves it on a page. `id` is the instance, `item` the block type, `props` the content. */
export type BlockInstance<P = Record<string, unknown>> = { id: string; item: string; variant: string; props: P };

export function defaultVariant(block: BlockManifest): BlockVariant {
  return block.variants.find((v) => v.default) ?? block.variants[0]!;
}
export const defaultVariantId = (block: BlockManifest): string => defaultVariant(block).id;
export function resolveVariant(block: BlockManifest, id: string | undefined): BlockVariant {
  return block.variants.find((v) => v.id === id) ?? defaultVariant(block);
}

export function placeOf(block: BlockManifest, id: string): Place {
  const p = block.places.find((x) => x.id === id);
  if (!p) throw new Error(`${block.id}: no place ${id}`);
  return p;
}

/** The attributes a place instance carries in the DOM: `data-place` (place id) and `data-field` (concrete pointers). */
export type PlaceBinding = { place: string; field: string };

/** Bind a place for one instance: `bind(team, "member.title", 1)` → `{ place: "member.title", field: "/members/1/title" }`. */
export function bind(block: BlockManifest, id: string, ...indices: number[]): PlaceBinding {
  const p = placeOf(block, id);
  return { place: p.id, field: p.fields.map((f) => resolvePointer(f, ...indices)).join(" ") };
}

/** Field budget: every model path counts once (a list counts 1 plus its item fields); bars and cardinality do not multiply. */
export const FIELD_BUDGET_MIN = 5;
export const FIELD_BUDGET_MAX = 10;
export const fieldBudget = (block: BlockManifest): number => modelPaths(block.model.fields).length;

/** Which places draw a value (inspector: from a clicked or edited pointer back to its spots). */
export function placesFor(block: BlockManifest, pointerTemplate: string): Place[] {
  return block.places.filter((p) => p.fields.includes(pointerTemplate));
}
