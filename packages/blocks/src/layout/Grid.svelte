<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, cn, type BoxTag } from "@ui8kit/kit";
  import { layout, type Align, type GridColumns, type Justify, type Space } from "../classes";

  let {
    tag = "div",
    cols = 3,
    gap = "8",
    align = "stretch",
    justify = "start",
    class: className,
    children,
    ...rest
  }: {
    tag?: BoxTag;
    cols?: GridColumns;
    gap?: Space;
    align?: Align;
    justify?: Justify;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  const cls = $derived(
    cn(
      layout.grid,
      layout.gridMd[cols],
      layout.gap[gap],
      layout.align[align],
      layout.justify[justify],
      className,
    ),
  );
</script>

<Box {tag} class={cls} {...rest}>
  {@render children?.()}
</Box>
