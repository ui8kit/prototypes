<script lang="ts">
  import { Box, Button, Input, Label, Radio, Text } from "@ui8kit/kit";
  import { Group, Stack } from "@ui8kit/blocks";
  import {
    contrastLevel,
    DEFAULT_PALETTE,
    withContrast,
    type ContrastLevel,
    type Palette,
  } from "@ui8kit/theme";
  import { paletteText, themeText } from "../content/theme";
  import { appTheme, themeCtl } from "./ctl.svelte";
  import PaletteHarmonies from "./PaletteHarmonies.svelte";
  import PaletteOptions from "./PaletteOptions.svelte";
  import PalettePresets from "./PalettePresets.svelte";
  import PaletteSamples from "./PaletteSamples.svelte";
  import PaletteWheel from "./PaletteWheel.svelte";

  const T = paletteText;
  const p = $derived(appTheme.state.theme.palette ?? DEFAULT_PALETTE);
  const set = (patch: Partial<Palette>): void => themeCtl.setTheme({ palette: { ...p, ...patch } });
  const RANGES = [
    { key: "h" as const, max: 359, unit: "°" },
    { key: "s" as const, max: 100, unit: "%" },
    { key: "l" as const, max: 100, unit: "%" },
  ];
  const rangeLabel = (k: "h" | "s" | "l"): string => (k === "h" ? T.hue : k === "s" ? T.saturation : T.lightness);
  const setLevel = (v: string): void => themeCtl.setTheme({ palette: withContrast(p, v as ContrastLevel) });
  const hasPalette = $derived(!!appTheme.state.theme.palette);
</script>

<Stack gap="0" class="ui8-palette-panel" data-testid="picker-palette">
  <Box class="ui8-theme-head">
    <Group gap="2" align="center">
      <Button class="ui8-theme-btn" onclick={() => (appTheme.wide = null)} data-testid="picker-back">{themeText.back}</Button>
      <Text tag="h2" class="ui8-theme-title">{T.title}</Text>
    </Group>
    <Text class="ui8-theme-note">{T.note}</Text>
  </Box>
  <Box class="ui8-theme-body" data-testid="palette-body">
    <PaletteSamples text={T.samples} />
    <Box class="ui8-palette-main">
      <Stack gap="6" class="ui8-palette-left">
        <PaletteWheel palette={p} onchange={(v) => themeCtl.setTheme({ palette: v })} label={T.wheel} />
        <PaletteOptions palette={p} onchange={(v) => themeCtl.setTheme({ palette: v })} text={T.options} />
      </Stack>
      <Stack gap="4" class="ui8-palette-controls">
        <PaletteHarmonies value={appTheme.state.theme.palette?.harmony ?? null} onchange={(harmony) => set({ harmony })} text={T} />
        {#each RANGES as r (r.key)}
          <Box class="ui8-palette-range">
            <Group gap="2" justify="between" align="center">
              <Label for={"ui8-palette-" + r.key} class="ui8-palette-label">{rangeLabel(r.key)}</Label>
              <Text tag="span" class="ui8-palette-muted" data-testid={"palette-value-" + r.key}>{p[r.key] + r.unit}</Text>
            </Group>
            <Input
              id={"ui8-palette-" + r.key}
              type="range"
              min="0"
              max={r.max}
              step="1"
              value={p[r.key]}
              oninput={(e: Event) => set({ [r.key]: Number((e.currentTarget as HTMLInputElement).value) })}
              data-testid={"palette-range-" + r.key}
            />
          </Box>
        {/each}
        <Box data-testid="palette-contrast">
          <Text tag="span" class="ui8-palette-label">{T.contrast.legend}</Text>
          <Group gap="4" class="ui8-palette-contrast-row">
            <Label class="ui8-palette-choice">
              <Radio name="ui8-palette-contrast" value="AA" checked={hasPalette && contrastLevel(p) === "AA"} onchange={() => setLevel("AA")} />
              <Text tag="span">{T.contrast.aa}</Text>
            </Label>
            <Label class="ui8-palette-choice">
              <Radio name="ui8-palette-contrast" value="AAA" checked={hasPalette && contrastLevel(p) === "AAA"} onchange={() => setLevel("AAA")} />
              <Text tag="span">{T.contrast.aaa}</Text>
            </Label>
          </Group>
          <Text class="ui8-palette-muted">{T.contrast.note}</Text>
        </Box>
        <Button class="ui8-theme-btn" disabled={!hasPalette} onclick={() => themeCtl.setTheme({ palette: undefined })} data-testid="palette-reset">
          {T.reset}
        </Button>
      </Stack>
    </Box>
    <PalettePresets
      current={appTheme.state.theme.palette ?? null}
      mode={appTheme.state.mode}
      skin={appTheme.state.theme.skin}
      onpick={(v) => themeCtl.setTheme({ palette: withContrast(v, contrastLevel(p)) })}
      text={T.presets}
    />
  </Box>
</Stack>
