<!-- The header: wireframe / page switch, the sample content set (page mode) and the Theme button (apps/stock). -->
<script lang="ts">
  import { Group, MODES, SAMPLE_IDS } from "@ui8kit/blocks";
  import { Box, Button } from "@ui8kit/kit";
  import { galleryText } from "./content/gallery";
  import { themeText } from "./content/theme";
  import { themeCtl } from "./theme/ctl.svelte";
  import { setView, view } from "./view.svelte";
</script>

<Box tag="header" class="ui8-header" data-testid="app-header">
  <Group gap="4" justify="between" class="ui8-header-bar">
    <Group gap="4">
      <Group gap="2" role="group" aria-label={galleryText.modeLabel}>
        {#each MODES as mode (mode)}
          <Button class="ui8-seg-btn" pressed={view.mode === mode} onclick={() => setView({ mode })} data-testid={"mode-" + mode}>
            {galleryText.modes[mode]}
          </Button>
        {/each}
      </Group>
      {#if view.mode === "page"}
        <Group gap="2" role="group" aria-label={galleryText.sampleLabel}>
          {#each SAMPLE_IDS as sample (sample)}
            <Button class="ui8-seg-btn" pressed={view.sample === sample} onclick={() => setView({ sample })} data-testid={"sample-" + sample}>
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
