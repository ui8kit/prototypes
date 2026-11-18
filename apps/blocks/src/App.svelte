<script lang="ts">
  import { onMount } from "svelte";
  import { Box } from "@ui8kit/kit";
  import AppHeader from "./AppHeader.svelte";
  import Gallery from "./Gallery.svelte";
  import { loadTheme } from "./theme/ctl.svelte";
  import ThemeSheet from "./theme/ThemeSheet.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  onMount(loadTheme);
</script>

<Box class="ui8-app">
  <AppHeader />
  <Gallery />
  <ThemeSheet />
  <ThemeToggle />
</Box>
