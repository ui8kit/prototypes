<!--
  The feed: every registered block in every layout variant, full width like page sections. Wireframe mode is the search
  feed (shapes only); page mode renders the same blocks from one sample content set: one object per block, every variant.
-->
<script lang="ts">
  import { Box } from "@ui8kit/kit";
  import { BLOCKS, CATALOG, SAMPLES } from "@ui8kit/blocks";
  import { galleryText } from "./content/gallery";
  import { view } from "./view.svelte";
</script>

<Box tag="main" class="ui8-feed" aria-label={galleryText.title} data-testid="gallery" data-mode={view.mode}>
  {#each BLOCKS as block (block.id)}
    {@const View = CATALOG[block.id]}
    {#if View}
      {#each block.variants as variant (variant.id)}
        <Box class="ui8-feed-item" data-block={block.id} data-variant={variant.id} data-testid={"feed-" + block.id + "-" + variant.id}>
          <View variant={variant.id} mode={view.mode} content={view.mode === "page" ? SAMPLES[view.sample][block.id] : undefined} />
        </Box>
      {/each}
    {/if}
  {/each}
</Box>
