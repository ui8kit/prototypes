<script lang="ts">
  import { onMount } from "svelte";
  import { Box } from "@ui8kit/kit";
  import { themeText } from "./content/theme";
  import { appTheme, loadTheme } from "./theme/ctl.svelte";
  import PreviewFrame from "./theme/PreviewFrame.svelte";
  import ThemePanel from "./theme/ThemePanel.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  onMount(loadTheme);
</script>

<Box tag="main" class="ui8-app" data-wide={appTheme.wide ?? ""}>
  <Box class="ui8-previews">
    <PreviewFrame mode="light" theme={appTheme.state.theme} label={themeText.previewLight} />
    <PreviewFrame mode="dark" theme={appTheme.state.theme} label={themeText.previewDark} />
  </Box>
  <ThemePanel />
  <ThemeToggle />
</Box>
