<script lang="ts">
  import { Box, Label, Radio, Text } from "@ui8kit/kit";
  import { paletteTokens, PRESETS, samePalette, type Mode, type Palette } from "@ui8kit/theme";
  import type { PaletteText } from "../content/theme";

  let { current, mode, skin, onpick, text }: {
    current: Palette | null;
    mode: Mode;
    skin: string | null;
    onpick: (p: Palette) => void;
    text: PaletteText["presets"];
  } = $props();
  const titleId = "ui8-palette-presets-title";
  const CHARTS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const;
  const stripes = (p: Palette): string[] => {
    const t = paletteTokens(p, mode, skin);
    return CHARTS.map((c) => `background:${t[c]}`);
  };
</script>

<Box class="ui8-palette-presets-wrap" data-testid="palette-presets">
  <Text tag="span" class="ui8-palette-label" id={titleId}>{text.title}</Text>
  <Text class="ui8-palette-muted">{text.note}</Text>
  <Box class="ui8-palette-presets" role="radiogroup" aria-labelledby={titleId}>
    {#each PRESETS as pr (pr.id)}
      <Label class="ui8-palette-preset" data-testid={"preset-" + pr.id}>
        <Radio
          class="ui8-picker-input"
          name="ui8-palette-preset"
          value={pr.id}
          checked={samePalette(current, pr.palette)}
          onchange={() => onpick(pr.palette)}
        />
        <Box class="ui8-palette-stripes" aria-hidden="true">
          {#each stripes(pr.palette) as st, i (i)}
            <Box class="ui8-palette-stripe" style={st}></Box>
          {/each}
        </Box>
        <Text tag="span" class="ui8-palette-preset-name">{text.names[pr.id] ?? pr.id}</Text>
      </Label>
    {/each}
  </Box>
</Box>
