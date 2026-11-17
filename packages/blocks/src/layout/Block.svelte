<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, cn, type BoxTag } from "@ui8kit/kit";
  import { layout, type Py } from "../classes";

  let {
    tag = "div",
    py = "16",
    class: className,
    children,
    ...rest
  }: {
    tag?: BoxTag;
    py?: Py;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  const cls = $derived(cn(layout.block, layout.py[py], className));
</script>

<Box {tag} class={cls} {...rest}>
  {@render children?.()}
</Box>
