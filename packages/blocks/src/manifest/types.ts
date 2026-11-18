/**
 * One content schema per block: the typed contract a real site constructor
 * would bind. Layout differences are variants of that same contract.
 *
 * Rules (docs/content-contract.md):
 * - Simple content: named fields (title, description, image, actionLabel, …).
 *   Repeated content is a named record type, not a universal item.
 * - Interchangeable variants: layout only. A variant never adds required
 *   fields, changes types, or drops/transforms content.
 * - Full rendering: every filled field has a DOM rendering in every variant.
 */

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

/** Content kinds. Distinct entities (price vs duration) get their own kind later — never a universal field. */
export const CONTENT_KINDS = ["title", "description", "image", "actionLabel", "actionHref", "avatar"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

/** Kinds that render as `[data-shape=…]`. `dot` is a small avatar. */
export const SHAPE_KINDS = ["heading", "text-line", "avatar", "cta", "media", "dot"] as const;
export type ShapeKind = (typeof SHAPE_KINDS)[number];

/** Exact count, or a range with the default the organism renders. */
export type SlotCount = number | { min: number; max: number; default: number };

export type ContentScalar = {
  id: string;
  kind: ContentKind;
  count: SlotCount;
};

export type ContentRecord = {
  id: string;
  kind: "record";
  /** Named entity (`teamMember`, later `priceTier`). Never a generic "item". */
  record: string;
  count: SlotCount;
  fields: ContentField[];
};

export type ContentField = ContentScalar | ContentRecord;

export type BlockVariant = {
  id: string;
  /** Layout axes only (media side, column count). Never content. */
  layout: Record<string, string | number | boolean>;
  default?: boolean;
};

export type BlockManifest = {
  id: string;
  category: BlockCategory;
  /** Region name from the dictionary (aria-label). */
  label: string;
  /** One content schema shared by every variant. */
  content: ContentField[];
  variants: BlockVariant[];
};

export function resolveCount(count: SlotCount): number {
  return typeof count === "number" ? count : count.default;
}

export function defaultVariant(block: BlockManifest): BlockVariant {
  const marked = block.variants.filter((variant) => variant.default);
  return marked[0] ?? block.variants[0];
}

export function defaultVariantId(block: BlockManifest): string {
  return defaultVariant(block).id;
}

export function resolveVariant(block: BlockManifest, id: string | undefined): BlockVariant {
  return block.variants.find((variant) => variant.id === id) ?? defaultVariant(block);
}

export function emptyShapeCounts(): Record<ShapeKind, number> {
  return { heading: 0, "text-line": 0, avatar: 0, cta: 0, media: 0, dot: 0 };
}

/** Content kind → placeholder shape. `actionHref` rides on the same CTA as `actionLabel`. */
export function shapeForContent(kind: ContentKind): ShapeKind | null {
  if (kind === "title") return "heading";
  if (kind === "description") return "text-line";
  if (kind === "image") return "media";
  if (kind === "actionLabel") return "cta";
  if (kind === "actionHref") return null;
  if (kind === "avatar") return "avatar";
  return null;
}

/** Flatten content into rendered shape totals (records multiply nested fields). */
export function shapeCounts(fields: ContentField[], repeats = 1): Record<ShapeKind, number> {
  const out = emptyShapeCounts();
  for (const field of fields) {
    const n = resolveCount(field.count) * repeats;
    if (field.kind === "record") {
      const nested = shapeCounts(field.fields, n);
      for (const kind of SHAPE_KINDS) out[kind] += nested[kind];
    } else {
      const shape = shapeForContent(field.kind);
      if (shape) out[shape] += n;
    }
  }
  return out;
}

/** `dot` is implemented as Avatar, so it matches `[data-shape=avatar]`. */
export function attrForKind(kind: ShapeKind): string {
  return kind === "dot" ? "avatar" : kind;
}

export function countsByAttr(counts: Record<ShapeKind, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const kind of SHAPE_KINDS) {
    const attr = attrForKind(kind);
    out[attr] = (out[attr] ?? 0) + counts[kind];
  }
  return out;
}

export type FieldPath = {
  path: string;
  kind: ContentKind | "record";
  count: SlotCount;
  record?: string;
};

/** Dot-path of every content field, including nested record fields (`members.avatar`). */
export function fieldPaths(fields: ContentField[], prefix = ""): FieldPath[] {
  const out: FieldPath[] = [];
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.id}` : field.id;
    if (field.kind === "record") {
      out.push({ path, kind: "record", count: field.count, record: field.record });
      out.push(...fieldPaths(field.fields, path));
    } else {
      out.push({ path, kind: field.kind, count: field.count });
    }
  }
  return out;
}

/** How many `[data-field~=path]` nodes the default fill must render. */
export function fieldRenderCounts(fields: ContentField[], prefix = "", repeats = 1): Record<string, number> {
  const out: Record<string, number> = {};
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.id}` : field.id;
    const n = resolveCount(field.count) * repeats;
    if (field.kind === "record") Object.assign(out, fieldRenderCounts(field.fields, path, n));
    else out[path] = (out[path] ?? 0) + n;
  }
  return out;
}

export function fieldSelector(path: string): string {
  return `[data-field~="${path}"]`;
}

export function formatCount(count: SlotCount): string {
  if (typeof count === "number") return String(count);
  return `${count.min}–${count.max} (default ${count.default})`;
}

export type RecordTypeInfo = {
  name: string;
  path: string;
  fields: { id: string; kind: ContentKind | "record" }[];
};

export function recordTypes(fields: ContentField[], prefix = ""): RecordTypeInfo[] {
  const out: RecordTypeInfo[] = [];
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.id}` : field.id;
    if (field.kind === "record") {
      out.push({
        name: field.record,
        path,
        fields: field.fields.map((inner) => ({ id: inner.id, kind: inner.kind })),
      });
      out.push(...recordTypes(field.fields, path));
    }
  }
  return out;
}
