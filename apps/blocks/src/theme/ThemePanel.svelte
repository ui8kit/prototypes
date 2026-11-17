<script lang="ts">
  import { Box, Button, Text } from "@ui8kit/kit";
  import { Group, Stack } from "@ui8kit/blocks";
  import { isDefault } from "@ui8kit/theme";
  import { themeText } from "../content/theme";
  import { appTheme, themeCtl } from "./ctl.svelte";
  import PalettePanel from "./PalettePanel.svelte";
  import ThemeFields from "./ThemeFields.svelte";
  import ThemeIo from "./ThemeIo.svelte";

  const T = themeText;
  const atDefault = $derived(isDefault(appTheme.state.theme));
</script>

{#if appTheme.wide === "palette"}
  <PalettePanel />
{:else}
  <Stack gap="0" class="ui8-theme-panel" tag="aside" data-testid="theme-panel">
    <Box class="ui8-theme-head">
      <Text tag="h1" class="ui8-theme-title" id="theme-panel-title">{T.title}</Text>
      <Text class="ui8-theme-note">{T.note}</Text>
    </Box>
    <Stack gap="0" class="ui8-theme-body" data-testid="theme-body">
      <ThemeFields />
      <ThemeIo />
    </Stack>
    <Group gap="2" class="ui8-theme-foot">
      <Button class="ui8-theme-btn" disabled={atDefault} onclick={() => themeCtl.reset()} data-testid="theme-reset">
        {T.resetAll}
      </Button>
    </Group>
  </Stack>
{/if}
