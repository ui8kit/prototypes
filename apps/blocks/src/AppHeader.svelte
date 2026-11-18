<!-- The header: only the Theme button that opens the Theme sheet (as in codegen-x/ui8kit apps/stock). -->
<script lang="ts">
  import { Group } from "@ui8kit/blocks";
  import { Box, Button } from "@ui8kit/kit";
  import { themeText } from "./content/theme";
  import { themeCtl } from "./theme/ctl.svelte";
</script>

<Box tag="header" class="ui8-header" data-testid="app-header">
  <Group gap="4" justify="end" class="ui8-header-bar">
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
