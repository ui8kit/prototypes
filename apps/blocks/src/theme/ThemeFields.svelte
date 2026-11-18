<script lang="ts">
  import { Box, Button, Label, Radio, Select, Text } from "@ui8kit/kit";
  import { Stack } from "@ui8kit/blocks";
  import { DENSITIES, RADII, SECTION_PADDINGS, SHADOWS, SKIN_IDS } from "@ui8kit/theme";
  import { paletteText, skinLabels, themeText } from "../content/theme";
  import { appTheme, themeCtl, type WidePanel } from "./ctl.svelte";

  /** the elements this constructor draws (codegen-x alert tokens are kept from imports but have no shape here) */
  const RADIUS_SHOWN = ["badge", "button", "card", "media"] as const;
  const DENSITY_SHOWN = ["badge", "button", "card"] as const;
  const SHADOW_SHOWN = ["card", "media"] as const;
  const WIDE: Array<{ id: Exclude<WidePanel, null>; label: string }> = [
    { id: "skins", label: themeText.open.skins },
    { id: "palette", label: paletteText.open },
    { id: "presets", label: themeText.open.presets },
    { id: "design", label: themeText.open.design },
  ];

  const t = $derived(appTheme.state.theme);
  const custom = $derived(!!t.palette);
  const skinValue = $derived(custom ? "custom" : (t.skin ?? ""));
  const sectionPaddingLabels: Record<string, string> = {
    compact: "Compact · py-8 lg:py-16 · 32 / 64 px",
    default: "Standard · py-16 lg:py-32 · 64 / 128 px",
    spacious: "Spacious · py-24 lg:py-40 · 96 / 160 px",
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
  <Box class="ui8-theme-fields-wide">
    {#each WIDE as w (w.id)}
      <Button
        class="ui8-theme-btn ui8-theme-fields-wide-open"
        aria-pressed={appTheme.wide === w.id}
        onclick={() => (appTheme.wide = appTheme.wide === w.id ? null : w.id)}
        data-testid={w.id + "-open"}
      >
        {w.label}
      </Button>
    {/each}
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
  <Box class="ui8-theme-field" role="group" aria-labelledby="theme-element-radius-legend" data-testid="theme-element-radius">
    <Text tag="span" class="ui8-palette-label" id="theme-element-radius-legend">{themeText.elementRadius}</Text>
    <Text class="ui8-theme-note">{themeText.elementRadiusNote}</Text>
    {#each RADIUS_SHOWN as e (e)}
      <Box class="ui8-theme-subfield">
        <Label for={"theme-radius-" + e}>{themeText.elements[e]}</Label>
        <Select
          id={"theme-radius-" + e}
          value={t.tokens["radius-" + e] === undefined ? "" : String(t.tokens["radius-" + e])}
          onchange={(ev: Event) => {
            const raw = (ev.currentTarget as HTMLSelectElement).value;
            themeCtl.setField(`radius-${e}`, raw === "" ? null : Number(raw));
          }}
          options={[
            { value: "", label: e === "badge" ? themeText.pill : `${themeText.follow} (${t.radius ?? 4} px)` },
            ...RADII.map((r) => ({ value: String(r), label: `${r} px` })),
          ]}
          data-testid={"theme-radius-" + e}
        />
      </Box>
    {/each}
  </Box>
  <Box class="ui8-theme-field" role="group" aria-labelledby="theme-element-density-legend" data-testid="theme-element-density">
    <Text tag="span" class="ui8-palette-label" id="theme-element-density-legend">{themeText.elementDensity}</Text>
    <Text class="ui8-theme-note">{themeText.elementDensityNote}</Text>
    {#each DENSITY_SHOWN as e (e)}
      <Box class="ui8-theme-subfield">
        <Label for={"theme-density-" + e}>{themeText.elements[e]}</Label>
        <Select
          id={"theme-density-" + e}
          value={String(t.tokens["density-" + e] ?? "default")}
          onchange={(ev: Event) => themeCtl.setField(`density-${e}`, (ev.currentTarget as HTMLSelectElement).value)}
          options={DENSITIES.map((d) => ({ value: d, label: themeText.densities[d] }))}
          data-testid={"theme-density-" + e}
        />
      </Box>
    {/each}
  </Box>
  <Box class="ui8-theme-field" role="group" aria-labelledby="theme-element-shadow-legend" data-testid="theme-element-shadow">
    <Text tag="span" class="ui8-palette-label" id="theme-element-shadow-legend">{themeText.elementShadow}</Text>
    <Text class="ui8-theme-note">{themeText.elementShadowNote}</Text>
    {#each SHADOW_SHOWN as e (e)}
      <Box class="ui8-theme-subfield">
        <Label for={"theme-shadow-" + e}>{themeText.elements[e]}</Label>
        <Select
          id={"theme-shadow-" + e}
          value={String(t.tokens["shadow-" + e] ?? "none")}
          onchange={(ev: Event) => {
            const raw = (ev.currentTarget as HTMLSelectElement).value;
            themeCtl.setField(`shadow-${e}`, raw === "none" ? null : raw);
          }}
          options={SHADOWS.map((v) => ({ value: v, label: themeText.shadows[v] }))}
          data-testid={"theme-shadow-" + e}
        />
      </Box>
    {/each}
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
