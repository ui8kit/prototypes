<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, cn, type BoxTag } from "@ui8kit/kit";
  import { layout, type SectionPadding } from "../classes";
  import { sectionPadding } from "./section";

  let {
    tag = "div",
    padding,
    class: className,
    children,
    ...rest
  }: {
    tag?: BoxTag;
    /** overrides the theme's section padding (compact / default / spacious) */
    padding?: SectionPadding;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  const themed = sectionPadding();
  const step = $derived(padding ?? themed());
  const cls = $derived(cn(layout.block, layout.section[step], className));
</script>

<Box {tag} class={cls} data-section-padding={step} {...rest}>
  {@render children?.()}
</Box>
