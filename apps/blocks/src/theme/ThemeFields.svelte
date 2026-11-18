<script lang="ts">
  import { Box, Button, Label, Radio, Select, Text } from "@ui8kit/kit";
  import { Stack } from "@ui8kit/blocks";
  import { DENSITIES, RADII, SECTION_PADDINGS, SKIN_IDS } from "@ui8kit/theme";
  import { paletteText, skinLabels, themeText } from "../content/theme";
  import { appTheme, themeCtl } from "./ctl.svelte";

  const t = $derived(appTheme.state.theme);
  const custom = $derived(!!t.palette);
  const skinValue = $derived(custom ? "custom" : (t.skin ?? ""));
  const densityLabels: Record<string, string> = {
    compact: "Compact",
    default: "Default",
    comfortable: "Comfortable",
  };
  const sectionPaddingLabels: Record<string, string> = {
    compact: "Compact · 32 / 64 px",
    default: "Default · 64 / 128 px",
    spacious: "Spacious · 96 / 160 px",
  };

  function onSkin(raw: string): void {
    if (raw === "custom") return;
    themeCtl.setField("skin", raw === "" ? null : raw);
  }
</script>

<Stack gap="4" class="ui8-theme-fields" data-testid="theme-fields">
  <Box class="ui8-theme-field">
    <Label for="theme-skin">{themeText.skin}</Label>
    <Select
      id="theme-skin"
      value={skinValue}
      onchange={(e: Event) => onSkin((e.currentTarget as HTMLSelectElement).value)}
      options={[
        ...(custom ? [{ value: "custom", label: paletteText.custom }] : []),
        { value: "", label: themeText.default },
        ...SKIN_IDS.map((id) => ({ value: id, label: skinLabels[id] ?? id })),
      ]}
    />
  </Box>
  <Box class="ui8-theme-fields-palette">
    <Button
      class="ui8-theme-btn ui8-theme-fields-palette-open"
      onclick={() => (appTheme.wide = appTheme.wide === "palette" ? null : "palette")}
      data-testid="palette-open"
    >
      {paletteText.open}
    </Button>
  </Box>
  <Box class="ui8-theme-field">
    <Label for="theme-radius">{themeText.radius}</Label>
    <Select
      id="theme-radius"
      value={t.radius === null ? "" : String(t.radius)}
      onchange={(e: Event) => {
        const raw = (e.currentTarget as HTMLSelectElement).value;
        themeCtl.setField("radius", raw === "" ? null : Number(raw));
      }}
      options={[
        { value: "", label: themeText.default },
        ...RADII.map((r) => ({ value: String(r), label: `${r} px` })),
      ]}
    />
  </Box>
  {#if t.radius !== null}
    <Box class="ui8-theme-panel-radius">
      <Button class="ui8-theme-btn" onclick={() => themeCtl.setTheme({ radius: null })} data-testid="theme-radius-reset">
        {themeText.resetRadius}
      </Button>
    </Box>
  {/if}
  <Box class="ui8-theme-field">
    <Text tag="span" class="ui8-palette-label" id="theme-density-legend">{themeText.density}</Text>
    <Box class="ui8-palette-contrast-row" role="radiogroup" aria-labelledby="theme-density-legend">
      {#each DENSITIES as d (d)}
        <Label class="ui8-palette-choice">
          <Radio
            name="theme-density"
            value={d}
            checked={t.density === d}
            onchange={() => themeCtl.setField("density", d)}
          />
          <Text tag="span">{densityLabels[d]}</Text>
        </Label>
      {/each}
    </Box>
  </Box>
  <Box class="ui8-theme-field">
    <Text tag="span" class="ui8-palette-label" id="theme-section-padding-legend">{themeText.sectionPadding}</Text>
    <Box class="ui8-palette-contrast-row" role="radiogroup" aria-labelledby="theme-section-padding-legend" data-testid="theme-section-padding">
      {#each SECTION_PADDINGS as p (p)}
        <Label class="ui8-palette-choice">
          <Radio
            name="theme-section-padding"
            value={p}
            checked={t.sectionPadding === p}
            onchange={() => themeCtl.setField("sectionPadding", p)}
          />
          <Text tag="span">{sectionPaddingLabels[p]}</Text>
        </Label>
      {/each}
    </Box>
  </Box>
</Stack>
