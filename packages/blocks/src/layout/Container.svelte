<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, cn, type BoxTag } from "@ui8kit/kit";
  import { layout } from "../classes";

  let {
    tag = "div",
    class: className,
    children,
    ...rest
  }: {
    tag?: BoxTag;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  const cls = $derived(cn(layout.container, className));
</script>

<Box {tag} class={cls} {...rest}>
  {@render children?.()}
</Box>
