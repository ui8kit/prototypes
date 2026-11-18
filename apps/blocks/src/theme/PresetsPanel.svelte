<!-- Brand presets: one-click starting points (skin + radius + density + shadow) from codegen-x taste-data, each card in its own theme. -->
<script lang="ts">
  import { Box, Button, Text } from "@ui8kit/kit";
  import { Group, Stack } from "@ui8kit/blocks";
  import { densityOf, presetTheme, PRESETS_ROW1, scopedCss, type Preset } from "@ui8kit/theme";
  import { presetsText, skinLabels, themeText } from "../content/theme";
  import { appTheme, themeCtl } from "./ctl.svelte";
  import MiniPage from "./MiniPage.svelte";
  import ScopedStyles from "./ScopedStyles.svelte";

  const T = presetsText;
  const css = PRESETS_ROW1.map((p) => scopedCss(`[data-preset-card="${p.id}"]`, presetTheme(p))).join("\n");
  const caption = (p: Preset): string => {
    const d = densityOf(p.tokens) ?? "default";
    const sh = String(p.tokens["shadow-card"] ?? "none");
    return `${skinLabels[p.skin] ?? p.skin} · ${p.radius} px · ${themeText.densities[d as "default"]} · ${themeText.shadows[sh as "none"]}`;
  };
  const same = (p: Preset): boolean => {
    const t = appTheme.state.theme;
    return t.skin === p.skin && t.radius === p.radius && !t.palette && JSON.stringify(t.tokens) === JSON.stringify(presetTheme(p).tokens);
  };
</script>

<ScopedStyles {css} />
<Stack gap="0" class="ui8-palette-panel ui8-wide-panel" data-testid="picker-presets">
  <Box class="ui8-theme-head">
    <Group gap="2" align="center">
      <Button class="ui8-theme-btn" onclick={() => (appTheme.wide = null)} data-testid="picker-back">{themeText.back}</Button>
      <Text tag="h2" class="ui8-theme-title">{T.title}</Text>
    </Group>
    <Text class="ui8-theme-note">{T.note}</Text>
  </Box>
  <Box class="ui8-theme-body">
    <Box class="ui8-card-grid">
      {#each PRESETS_ROW1 as p (p.id)}
        <Button class="ui8-pick-card" aria-pressed={same(p)} onclick={() => themeCtl.applyPreset(p)} data-testid={"preset-card-" + p.id}>
          <Box class="ui8-pick-frame" data-preset-card={p.id}><MiniPage /></Box>
          <Text tag="span" class="ui8-pick-label">{caption(p)}</Text>
        </Button>
      {/each}
    </Box>
  </Box>
</Stack>
