<!--
  Text place: ONE text value. The wireframe draws it as several bars (count and widths are the variant's design, `bars`);
  the page draws one paragraph. Clearing the value removes the paragraph; the wireframe is chosen by the feed only.
-->
<script lang="ts">
  import { useMode } from "./mode";
  import { cn, Text } from "@ui8kit/kit";
  import { page, type Width } from "../classes";
  import Stack from "../layout/Stack.svelte";
  import { filled } from "../model/validate";
  import TextLine from "../shapes/TextLine.svelte";

  let {
    value,
    place,
    field,
    bars = ["full", "2/3"],
    size = "text",
    center = false,
  }: {
    value?: string;
    place: string;
    field: string;
    bars?: Width[];
    size?: "text" | "lead";
    center?: boolean;
  } = $props();

  const cls = $derived(cn(size === "lead" ? page.lead : page.text, center && page.center));

  const mode = useMode();
</script>

{#if mode() === "wireframe"}
  <Stack gap="2" align={center ? "center" : "stretch"} class={page.fill} aria-hidden="true" data-place={place} data-field={field}>
    {#each bars as bar, i (i)}
      <TextLine {size} width={bar} />
    {/each}
  </Stack>
{:else if filled(value)}
  <Text tag="p" class={cls} data-place={place} data-field={field}>{value}</Text>
{/if}
