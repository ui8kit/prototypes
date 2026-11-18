<script lang="ts">
  import { Box, Link, Text } from "@ui8kit/kit";
  import { BLOCKS, CATALOG, categoriesPresent } from "@ui8kit/blocks";
  import { galleryText } from "./content/gallery";
  import { blockHref } from "./route";

  const groups = $derived(
    categoriesPresent().map((category) => ({
      category,
      title: galleryText.categories[category],
      blocks: BLOCKS.filter((block) => block.category === category),
    })),
  );
</script>

<Box tag="section" class="ui8-gallery" aria-label={galleryText.title} data-testid="gallery">
  <Text tag="h1" class="ui8-gallery-title">{galleryText.title}</Text>
  <Text class="ui8-gallery-note">{galleryText.note}</Text>
  {#each groups as group (group.category)}
    <Box class="ui8-gallery-category">
      <Text tag="h2" class="ui8-gallery-category-title">{group.title}</Text>
      <Box class="ui8-gallery-grid">
        {#each group.blocks as block (block.id)}
          {@const View = CATALOG[block.id]}
          {#if View}
            <Link class="ui8-gallery-card" href={blockHref(block.id)} aria-label={block.label} data-testid={"card-" + block.id}>
              <Box class="ui8-gallery-card-preview">
                <View />
              </Box>
              <Text class="ui8-gallery-card-name">{block.label}</Text>
            </Link>
          {/if}
        {/each}
      </Box>
    </Box>
  {/each}
</Box>
