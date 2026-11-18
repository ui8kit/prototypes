<!-- Design system specimen (codegen-x apps/stock): the current theme as text-free rectangles. Tokens, radii, buttons, badges,
     cards and media use the constructor's own shapes, so every theme setting shows here first. -->
<script lang="ts">
  import { Box, Button, Text } from "@ui8kit/kit";
  import { Badge, Grid, Group, Heading, Media, Stack, Surface, TextLine, shape } from "@ui8kit/blocks";
  import { designText, themeText } from "../content/theme";
  import { appTheme } from "./ctl.svelte";

  const T = designText;
  const TOKENS = ["background", "foreground", "primary", "secondary", "muted", "accent", "card", "border", "destructive", "ring"] as const;
  const RADII = ["badge", "button", "card", "media"] as const;
</script>

<Stack gap="0" class="ui8-palette-panel ui8-wide-panel" data-testid="picker-design">
  <Box class="ui8-theme-head">
    <Group gap="2" align="center">
      <Button class="ui8-theme-btn" onclick={() => (appTheme.wide = null)} data-testid="picker-back">{themeText.back}</Button>
      <Text tag="h2" class="ui8-theme-title">{T.title}</Text>
    </Group>
    <Text class="ui8-theme-note">{T.note}</Text>
  </Box>
  <Stack gap="6" class="ui8-theme-body ui8-specimen" data-testid="design-specimen">
    <Box class="ui8-specimen-section">
      <Text tag="h3" class="ui8-palette-label">{T.tokens}</Text>
      <Box class="ui8-swatch-grid">
        {#each TOKENS as tk (tk)}
          <Box class="ui8-swatch-cell">
            <Box class="ui8-swatch" data-token={tk}></Box>
            <Text tag="span" class="ui8-pick-label">{T.tokenNames[tk]}</Text>
          </Box>
        {/each}
      </Box>
    </Box>
    <Box class="ui8-specimen-section">
      <Text tag="h3" class="ui8-palette-label">{T.radii}</Text>
      <Box class="ui8-swatch-grid ui8-swatch-grid-4">
        {#each RADII as e (e)}
          <Box class="ui8-swatch-cell">
            <Box class="ui8-radius-sample" data-radius-of={e}></Box>
            <Text tag="span" class="ui8-pick-label">{themeText.elements[e]}</Text>
          </Box>
        {/each}
      </Box>
    </Box>
    <Box class="ui8-specimen-section">
      <Text tag="h3" class="ui8-palette-label">{T.buttons}</Text>
      <Group gap="4">
        <Box class={shape.cta} data-shape="cta" data-slot="button"></Box>
        <Box class={shape.ctaSecondary} data-shape="cta" data-slot="button"></Box>
      </Group>
    </Box>
    <Box class="ui8-specimen-section">
      <Text tag="h3" class="ui8-palette-label">{T.badges}</Text>
      <Group gap="4"><Badge /><Badge /><Badge /></Group>
    </Box>
    <Box class="ui8-specimen-section">
      <Text tag="h3" class="ui8-palette-label">{T.cards}</Text>
      <Grid cols={2} gap="4">
        {#each [0, 1] as i (i)}
          <Surface>
            <Stack gap="4">
              <Badge />
              <Heading width="3/4" />
              <TextLine width="full" />
              <TextLine width="2/3" />
            </Stack>
          </Surface>
        {/each}
      </Grid>
    </Box>
    <Box class="ui8-specimen-section">
      <Text tag="h3" class="ui8-palette-label">{T.media}</Text>
      <Media ratio="video" />
    </Box>
  </Stack>
</Stack>
