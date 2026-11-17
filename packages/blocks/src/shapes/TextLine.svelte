<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { shape, width, type Width } from "../classes";

  let { width: w = "full" }: { width?: Width } = $props();

  const cls = $derived(cn(shape.textLine, width[w]));
</script>

<Box class={cls} data-shape="text-line"></Box>
