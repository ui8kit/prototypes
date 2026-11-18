import type { Component } from "svelte";
import HeroSimple from "./generated/svelte/blocks/hero-simple.svelte";
import TeamSimple from "./generated/svelte/blocks/team-simple.svelte";
import { BLOCKS } from "./manifest/registry";

/**
 * item id → generated wireframe (codegen-x/ui8kit packages/prototypes, synced into src/generated; never edited here):
 * rectangles only, no content. Props: the variant axes and `padding`; build them with `wireframeProps()`. Keep in lockstep
 * with `BLOCKS`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CATALOG: Record<string, Component<any>> = {
  "hero-simple": HeroSimple,
  "team-simple": TeamSimple,
};

export function catalogIds(): string[] {
  return BLOCKS.map((block) => block.id);
}
