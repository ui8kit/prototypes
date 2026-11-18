<!--
  Builder preview (page mode), separate from the catalog: each block × variant rendered from one saved sample instance
  `{ id, item, variant, options, props }` through BlockView with an explicit mode="page". Same components as the feed.
-->
<script lang="ts">
  import { Box } from "@ui8kit/kit";
  import { BLOCKS, BlockView, SAMPLES, samplePage } from "@ui8kit/blocks";
  import { galleryText } from "./content/gallery";
  import { app } from "./view.svelte";

  const optionsOf = (item: string) => samplePage.find((b) => b.item === item)?.options;
</script>

<Box tag="main" class="ui8-feed" aria-label={galleryText.previewTitle} data-testid="preview">
  {#each BLOCKS as block (block.id)}
    {#each block.variants as variant (variant.id)}
      <Box class="ui8-feed-item" data-block={block.id} data-variant={variant.id} data-testid={"feed-" + block.id + "-" + variant.id}>
        <BlockView
          mode="page"
          instance={{ id: block.id + "-" + variant.id, item: block.id, variant: variant.id, options: optionsOf(block.id), props: SAMPLES[app.sample][block.id] ?? {} }}
        />
      </Box>
    {/each}
  {/each}
</Box>
