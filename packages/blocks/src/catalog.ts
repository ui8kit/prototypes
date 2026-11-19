import { BLOCKS } from "./manifest/registry";

/**
 * item id → generated wireframe (codegen-x/ui8kit packages/prototypes `out/catalog.ts`, synced into src/generated; never
 * edited here): rectangles only, no content. Props: the variant axes and `padding`; build them with `wireframeProps()`.
 * Generated in lockstep with `BLOCKS` (both list the manifest items).
 */
export { CATALOG } from "./generated/catalog";

export function catalogIds(): string[] {
  return BLOCKS.map((block) => block.id);
}
