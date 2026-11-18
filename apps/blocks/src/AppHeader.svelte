<!-- The header: Catalog (rectangle-only feed) / Builder preview (page mode), the preview's sample set, and the Theme button. -->
<script lang="ts">
  import { Group, SAMPLE_IDS } from "@ui8kit/blocks";
  import { Box, Button } from "@ui8kit/kit";
  import { galleryText } from "./content/gallery";
  import { themeText } from "./content/theme";
  import { themeCtl } from "./theme/ctl.svelte";
  import { VIEWS, app, setView } from "./view.svelte";
</script>

<Box tag="header" class="ui8-header" data-testid="app-header">
  <Group gap="4" justify="between" class="ui8-header-bar">
    <Group gap="4">
      <Group gap="2" role="group" aria-label={galleryText.viewLabel}>
        {#each VIEWS as view (view)}
          <Button class="ui8-seg-btn" pressed={app.view === view} onclick={() => setView({ view })} data-testid={"view-" + view}>
            {galleryText.views[view]}
          </Button>
        {/each}
      </Group>
      {#if app.view === "preview"}
        <Group gap="2" role="group" aria-label={galleryText.sampleLabel}>
          {#each SAMPLE_IDS as sample (sample)}
            <Button class="ui8-seg-btn" pressed={app.sample === sample} onclick={() => setView({ sample })} data-testid={"sample-" + sample}>
              {galleryText.samples[sample]}
            </Button>
          {/each}
        </Group>
      {/if}
    </Group>
    <Button
      class="ui8-theme-btn"
      aria-haspopup="dialog"
      aria-controls="theme-sheet"
      aria-expanded={themeCtl.open}
      onclick={() => (themeCtl.open = true)}
      data-testid="theme-open"
    >
      {themeText.title}
    </Button>
  </Group>
</Box>
