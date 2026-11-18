<!-- Heading place: a heading bar in the wireframe; an h2 (block title) or h3 (item title) on the page. -->
<script lang="ts">
  import { Text } from "@ui8kit/kit";
  import { cn } from "@ui8kit/kit";
  import { page, type HeadingLevel, type Width } from "../classes";
  import type { Mode } from "../manifest/types";
  import { filled } from "../model/validate";
  import Heading from "../shapes/Heading.svelte";

  let {
    mode,
    value,
    place,
    field,
    level = 2,
    size = "md",
    width = "1/2",
    center = false,
  }: {
    mode: Mode;
    value?: string;
    place: string;
    field: string;
    level?: HeadingLevel;
    size?: "md" | "lg";
    /** wireframe bar width (the variant's design) */
    width?: Width;
    center?: boolean;
  } = $props();

  const cls = $derived(cn(size === "lg" ? page.titleLg : page.title, center && page.center));
</script>

{#if mode === "wireframe"}
  <Heading {size} {width} {place} {field} />
{:else if filled(value)}
  {#if level === 3}
    <Text tag="h3" class={cls} data-place={place} data-field={field}>{value}</Text>
  {:else}
    <Text tag="h2" class={cls} data-place={place} data-field={field}>{value}</Text>
  {/if}
{/if}
