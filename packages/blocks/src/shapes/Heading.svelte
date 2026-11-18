<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { shape, width, type Width } from "../classes";

  let {
    width: w = "1/2",
    size = "md",
    place,
    field,
  }: {
    width?: Width;
    size?: "md" | "lg";
    place?: string;
    field?: string;
  } = $props();

  const cls = $derived(cn(size === "lg" ? shape.headingLg : shape.heading, width[w]));
</script>

<Box class={cls} aria-hidden="true" data-shape="heading" data-role={size === "lg" ? "heading-lg" : "heading"} data-place={place} data-field={field}></Box>
