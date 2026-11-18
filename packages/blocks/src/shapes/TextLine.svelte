<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { shape, width, type Width } from "../classes";

  /** `text` = body line; `lead` = subtitle / lead paragraph (same bar, drawn wider). Both are a `description`. */
  let {
    width: w = "full",
    size = "text",
    field,
  }: { width?: Width; size?: "text" | "lead"; field?: string } = $props();

  const cls = $derived(cn(size === "lead" ? shape.lead : shape.textLine, width[w]));
</script>

<Box class={cls} data-shape="text-line" data-role={size} data-field={field}></Box>
