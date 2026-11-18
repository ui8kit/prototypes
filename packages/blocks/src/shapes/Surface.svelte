<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box } from "@ui8kit/kit";
  import { shape } from "../classes";

  /** Card surface: bg-card + border-border. A container for other shapes, not a content field. */
  let { children }: { children?: Snippet } = $props();
</script>

<Box class={shape.surface} data-role="surface">
  {@render children?.()}
</Box>
