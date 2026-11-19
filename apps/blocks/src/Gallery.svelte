<!--
  The catalog feed: every registered block in every layout variant, full width like page sections. Rectangles only: the
  generated wireframes take the variant axes and the padding setting (wireframeProps), never content.
-->
<script lang="ts">
  import { Box } from "@ui8kit/kit";
  import { BLOCKS, CATALOG, wireframeProps } from "@ui8kit/blocks";
  import { appTheme } from "./theme/ctl.svelte";

  // the theme's section padding is the padding setting (a prop) of every generated block: same names, same classes
  const padding = $derived(appTheme.state.theme.sectionPadding);
  import { galleryText } from "./content/gallery";
</script>

<Box tag="main" class="ui8-feed" aria-label={galleryText.title} data-testid="gallery">
  {#each BLOCKS as block (block.id)}
    {@const View = CATALOG[block.id]}
    {#if View}
      {#each block.variants as variant (variant.id)}
        <Box class="ui8-feed-item" data-block={block.id} data-variant={variant.id} data-testid={"feed-" + block.id + "-" + variant.id}>
          <View {...wireframeProps(block, variant.id, { padding })} />
        </Box>
      {/each}
    {/if}
  {/each}
</Box>
