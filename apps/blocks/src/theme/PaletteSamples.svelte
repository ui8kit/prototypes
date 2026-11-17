<script lang="ts">
  import { Box, Text } from "@ui8kit/kit";
  import type { PaletteText } from "../content/theme";

  let { text }: { text: PaletteText["samples"] } = $props();
  const chips = $derived([
    { id: "primary", label: text.primary, bg: "var(--primary)", fg: "var(--primary-foreground)" },
    { id: "secondary", label: text.secondary, bg: "var(--secondary)", fg: "var(--secondary-foreground)" },
    { id: "accent", label: text.accent, bg: "var(--accent)", fg: "var(--accent-foreground)" },
    { id: "muted", label: text.muted, bg: "var(--muted)", fg: "var(--muted-foreground)" },
  ]);
  const bars = [
    "ui8-palette-bar ui8-palette-bar-1",
    "ui8-palette-bar ui8-palette-bar-2",
    "ui8-palette-bar ui8-palette-bar-3",
    "ui8-palette-bar ui8-palette-bar-4",
    "ui8-palette-bar ui8-palette-bar-5",
  ] as const;
</script>

<Box class="ui8-palette-samples" data-testid="palette-samples">
  {#each chips as chip (chip.id)}
    <Box class="ui8-palette-chip" style={`background:${chip.bg};color:${chip.fg}`}>
      <Text tag="span">{chip.label}</Text>
    </Box>
  {/each}
  <Box class="ui8-palette-chart-wrap">
    <Text tag="span" class="ui8-palette-muted">{text.chart}</Text>
    <Box class="ui8-palette-chart" aria-hidden="true">
      {#each bars as bar, i (i)}
        <Box class={bar}></Box>
      {/each}
    </Box>
  </Box>
</Box>
