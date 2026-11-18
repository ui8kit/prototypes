import type { Component } from "svelte";
import HeroSimple from "./generated/svelte/blocks/hero-simple.svelte";
import TeamSimple from "./generated/svelte/blocks/team-simple.svelte";
import { BLOCKS } from "./manifest/registry";

/**
 * item id → generated organism (codegen-x/ui8kit packages/prototypes, synced into src/generated; never edited here).
 * Props: the variant axes, the settings (`level`, `landmarkLabel`), the content fields, `id` and `mode`
 * (`wireframe` by default). Build them with `instanceProps()` / `wireframeProps()`. Keep in lockstep with `BLOCKS`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CATALOG: Record<string, Component<any>> = {
  "hero-simple": HeroSimple,
  "team-simple": TeamSimple,
};

export function catalogIds(): string[] {
  return BLOCKS.map((block) => block.id);
}
