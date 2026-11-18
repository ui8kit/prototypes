<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box } from "@ui8kit/kit";
  import { shape } from "../classes";

  /** Card surface: bg-card + border-border. A container for other shapes or page content, not a content field. */
  let { children, ...rest }: { children?: Snippet; [key: string]: unknown } = $props();
</script>

<Box class={shape.surface} data-role="surface" data-slot="card" {...rest}>
  {@render children?.()}
</Box>
