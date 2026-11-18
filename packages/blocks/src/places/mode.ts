/**
 * Builder-only: the render mode travels by context, never as a block prop. No provider = "wireframe" (prototypes are
 * rectangle-only by default; the feed and the catalog never set a mode). Only the builder's preview (`builder/BlockView`)
 * provides "page". Organisms do not read the mode; they ask `presence()` what to draw.
 */
import { getContext, setContext } from "svelte";
import type { Mode } from "../manifest/types";
import { filled, hasImage } from "../model/validate";

const KEY = Symbol("ui8kit.blocks.mode");

export function provideMode(get: () => Mode): void {
  setContext(KEY, get);
}

export function useMode(): () => Mode {
  return getContext<(() => Mode) | undefined>(KEY) ?? (() => "wireframe");
}

/** a content value counts as present when it is filled text or an image with a src */
export const present = (v: unknown): boolean => filled(v) || hasImage(v);

export type Row<T> = { index: number; item: Partial<T> };

/**
 * What an organism draws. Wireframe: every place, list places as `placeholders` empty items, content ignored. Page:
 * only present values, list items in array order (items with nothing present are skipped and keep their own index).
 */
export function presence() {
  const mode = useMode();
  const wire = () => mode() === "wireframe";
  return {
    /** the content to bind (empty in the wireframe) */
    content<T extends object>(content: T | undefined): Partial<T> {
      return wire() ? {} : (content ?? {});
    },
    /** draw a group when any of its values is present (always in the wireframe) */
    any(...values: unknown[]): boolean {
      return wire() || values.some(present);
    },
    /** list items to draw */
    rows<T extends object>(list: readonly T[] | undefined, placeholders: number): Row<T>[] {
      if (wire()) return Array.from({ length: placeholders }, (_, index) => ({ index, item: {} }));
      return (list ?? [])
        .map((item, index) => ({ index, item: item as Partial<T> }))
        .filter((row) => Object.values(row.item).some(present));
    },
  };
}
