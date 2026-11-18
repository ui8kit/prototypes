<!-- Skin picker: 4:3 cards, each drawn in its own skin (codegen-x apps/stock skin picker). -->
<script lang="ts">
  import { Box, Button, Text } from "@ui8kit/kit";
  import { Group, Stack } from "@ui8kit/blocks";
  import { NO_THEME, scopedCss, SKIN_IDS } from "@ui8kit/theme";
  import { skinLabels, skinsText, themeText } from "../content/theme";
  import { appTheme, themeCtl } from "./ctl.svelte";
  import MiniPage from "./MiniPage.svelte";
  import ScopedStyles from "./ScopedStyles.svelte";

  const T = skinsText;
  const SKINS = [null, ...SKIN_IDS] as const;
  const key = (s: string | null): string => s ?? "default";
  const css = SKINS.map((s) => scopedCss(`[data-skin-card="${key(s)}"]`, { ...NO_THEME, skin: s })).join("\n");
  const current = $derived(appTheme.state.theme.palette ? "custom" : key(appTheme.state.theme.skin));
</script>

<ScopedStyles {css} />
<Stack gap="0" class="ui8-palette-panel ui8-wide-panel" data-testid="picker-skins">
  <Box class="ui8-theme-head">
    <Group gap="2" align="center">
      <Button class="ui8-theme-btn" onclick={() => (appTheme.wide = null)} data-testid="picker-back">{themeText.back}</Button>
      <Text tag="h2" class="ui8-theme-title">{T.title}</Text>
    </Group>
    <Text class="ui8-theme-note">{T.note}</Text>
  </Box>
  <Box class="ui8-theme-body">
    <Box class="ui8-card-grid">
      {#each SKINS as s (key(s))}
        <Button
          class="ui8-pick-card"
          aria-pressed={current === key(s)}
          onclick={() => themeCtl.setField("skin", s)}
          data-testid={"skin-card-" + key(s)}
        >
          <Box class="ui8-pick-frame" data-skin-card={key(s)}><MiniPage /></Box>
          <Text tag="span" class="ui8-pick-label">{s ? (skinLabels[s] ?? s) : T.default}</Text>
        </Button>
      {/each}
    </Box>
  </Box>
</Stack>
