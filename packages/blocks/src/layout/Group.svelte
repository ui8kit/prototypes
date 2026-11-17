<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, cn, type BoxTag } from "@ui8kit/kit";
  import { layout, type Align, type Justify, type Space } from "../classes";

  let {
    tag = "div",
    gap = "4",
    align = "center",
    justify = "start",
    class: className,
    children,
    ...rest
  }: {
    tag?: BoxTag;
    gap?: Space;
    align?: Align;
    justify?: Justify;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  const cls = $derived(
    cn(layout.group, layout.gap[gap], layout.align[align], layout.justify[justify], className),
  );
</script>

<Box {tag} class={cls} {...rest}>
  {@render children?.()}
</Box>
