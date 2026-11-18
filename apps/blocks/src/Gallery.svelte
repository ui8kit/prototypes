<!--
  The catalog feed: every registered block in every layout variant, full width like page sections. Always rectangle-only:
  the generated organisms get only the variant axes and an id (wireframeProps), no content, so they draw their wireframe.
-->
<script lang="ts">
  import { Box } from "@ui8kit/kit";
  import { BLOCKS, CATALOG, wireframeProps } from "@ui8kit/blocks";
  import { galleryText } from "./content/gallery";
</script>

<Box tag="main" class="ui8-feed" aria-label={galleryText.title} data-testid="gallery">
  {#each BLOCKS as block (block.id)}
    {@const View = CATALOG[block.id]}
    {#if View}
      {#each block.variants as variant (variant.id)}
        <Box class="ui8-feed-item" data-block={block.id} data-variant={variant.id} data-testid={"feed-" + block.id + "-" + variant.id}>
          <View {...wireframeProps(block, variant.id)} />
        </Box>
      {/each}
    {/if}
  {/each}
</Box>
