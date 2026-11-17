<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { shape, width, type Width } from "../classes";

  let {
    width: w = "1/2",
    size = "md",
  }: {
    width?: Width;
    size?: "md" | "lg";
  } = $props();

  const cls = $derived(cn(size === "lg" ? shape.headingLg : shape.heading, width[w]));
</script>

<Box class={cls} data-shape="heading"></Box>
