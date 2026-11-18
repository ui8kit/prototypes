<!-- The header: the catalog title and the Theme button. -->
<script lang="ts">
  import { Group } from "@ui8kit/blocks";
  import { Box, Button, Text } from "@ui8kit/kit";
  import { galleryText } from "./content/gallery";
  import { themeText } from "./content/theme";
  import { themeCtl } from "./theme/ctl.svelte";
</script>

<Box tag="header" class="ui8-header" data-testid="app-header">
  <Group gap="4" justify="between" class="ui8-header-bar">
    <Text tag="span" class="ui8-header-title">{galleryText.title}</Text>
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
