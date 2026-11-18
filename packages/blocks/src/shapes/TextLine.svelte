<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { shape, width, type Width } from "../classes";

  /** One text bar (wireframe). Several bars of one text value are grouped by TextPlace. */
  let {
    width: w = "full",
    size = "text",
    place,
    field,
  }: { width?: Width; size?: "text" | "lead"; place?: string; field?: string } = $props();

  const cls = $derived(cn(size === "lead" ? shape.lead : shape.textLine, width[w]));
</script>

<Box class={cls} aria-hidden="true" data-shape="text-line" data-role={size} data-place={place} data-field={field}></Box>
