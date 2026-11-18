<!-- Heading place: a heading bar in the wireframe; h1–h4 on the page. The level never changes the look (`size` does). -->
<script lang="ts">
  import { useMode } from "./mode";
  import { Text } from "@ui8kit/kit";
  import { cn } from "@ui8kit/kit";
  import { page, type HeadingLevel, type Width } from "../classes";
  import { filled } from "../model/validate";
  import Heading from "../shapes/Heading.svelte";

  let {
    value,
    place,
    field,
    level = 2,
    size = "md",
    width = "1/2",
    center = false,
  }: {
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

  const mode = useMode();
</script>

{#if mode() === "wireframe"}
  <Heading {size} {width} {place} {field} />
{:else if filled(value)}
  {#if level === 1}
    <Text tag="h1" class={cls} data-place={place} data-field={field}>{value}</Text>
  {:else if level === 3}
    <Text tag="h3" class={cls} data-place={place} data-field={field}>{value}</Text>
  {:else if level === 4}
    <Text tag="h4" class={cls} data-place={place} data-field={field}>{value}</Text>
  {:else}
    <Text tag="h2" class={cls} data-place={place} data-field={field}>{value}</Text>
  {/if}
{/if}
