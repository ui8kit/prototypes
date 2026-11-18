/**
 * Typed sketch of a prototype block: the slots a real site constructor
 * would later bind to fields. Shapes in the organism (heading, text-line,
 * avatar, cta, media, dot) are the kinds; `item` is a repeating group.
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

/** Kinds that render as `[data-shape=…]`. `dot` is a small avatar. */
export const SHAPE_KINDS = ["heading", "text-line", "avatar", "cta", "media", "dot"] as const;
export type ShapeKind = (typeof SHAPE_KINDS)[number];

export const SLOT_KINDS = [...SHAPE_KINDS, "item"] as const;
export type SlotKind = (typeof SLOT_KINDS)[number];

/** Exact count, or a range with the default the organism renders. */
export type SlotCount = number | { min: number; max: number; default: number };

export type Slot = {
  id: string;
  kind: SlotKind;
  count: SlotCount;
  /** Nested fields when kind is `item`. */
  fields?: Slot[];
};

export type BlockVariant = {
  id: string;
  /** Prop overlay the organism accepts (e.g. `{ count: 2 }`). */
  props?: Record<string, string | number | boolean>;
};

export type BlockManifest = {
  id: string;
  category: BlockCategory;
  /** Region name from the dictionary (aria-label). */
  label: string;
  slots: Slot[];
  variants?: BlockVariant[];
};

export function resolveCount(count: SlotCount): number {
  return typeof count === "number" ? count : count.default;
}

export function emptyShapeCounts(): Record<ShapeKind, number> {
  return { heading: 0, "text-line": 0, avatar: 0, cta: 0, media: 0, dot: 0 };
}

/** Flatten slots into rendered shape totals (item groups multiply nested fields). */
export function shapeCounts(slots: Slot[], repeats = 1): Record<ShapeKind, number> {
  const out = emptyShapeCounts();
  for (const slot of slots) {
    const n = resolveCount(slot.count) * repeats;
    if (slot.kind === "item") {
      const nested = shapeCounts(slot.fields ?? [], n);
      for (const kind of SHAPE_KINDS) out[kind] += nested[kind];
    } else {
      out[slot.kind] += n;
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
  kind: SlotKind;
  count: SlotCount;
};

/** Dot-path of every slot, including nested item fields (`items.avatar`). */
export function fieldPaths(slots: Slot[], prefix = ""): FieldPath[] {
  const out: FieldPath[] = [];
  for (const slot of slots) {
    const path = prefix ? `${prefix}.${slot.id}` : slot.id;
    out.push({ path, kind: slot.kind, count: slot.count });
    if (slot.kind === "item" && slot.fields) out.push(...fieldPaths(slot.fields, path));
  }
  return out;
}

export function formatCount(count: SlotCount): string {
  if (typeof count === "number") return String(count);
  return `${count.min}–${count.max} (default ${count.default})`;
}
