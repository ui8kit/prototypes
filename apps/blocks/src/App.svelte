<script lang="ts">
  import { onMount } from "svelte";
  import { Box } from "@ui8kit/kit";
  import AppHeader from "./AppHeader.svelte";
  import Gallery from "./Gallery.svelte";
  import { provideSectionPadding } from "@ui8kit/blocks";
  import { appTheme, loadTheme } from "./theme/ctl.svelte";
  import ThemeSheet from "./theme/ThemeSheet.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  // Every Block in the feed reads the theme's section padding (py-8/16/24, lg:py-16/32/40).
  provideSectionPadding(() => appTheme.state.theme.sectionPadding);

  onMount(loadTheme);
</script>

<Box class="ui8-app">
  <AppHeader />
  <Gallery />
  <ThemeSheet />
  <ThemeToggle />
</Box>
