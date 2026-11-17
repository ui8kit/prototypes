<script lang="ts">
  import { Box, Text } from "@ui8kit/kit";
  import { FeaturesTeam, HeroSplit } from "@ui8kit/blocks";
  import type { GlobalTheme, Mode } from "@ui8kit/theme";
  import { previewStyle } from "./ctl.svelte";

  let { mode, theme, label }: { mode: Mode; theme: GlobalTheme; label: string } = $props();
  const style = $derived(previewStyle(theme, mode));
</script>

<Box class="ui8-preview" data-mode={mode} data-density={theme.density} data-section-padding={theme.sectionPadding} {style} data-testid={"preview-" + mode}>
  <Text tag="h2" class="ui8-preview-label">{label}</Text>
  <FeaturesTeam />
  <HeroSplit />
</Box>
