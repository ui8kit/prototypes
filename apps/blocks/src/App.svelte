<script lang="ts">
  import { onMount } from "svelte";
  import { Box, Button, Text } from "@ui8kit/kit";
  import { BLOCK_BY_ID, CATALOG } from "@ui8kit/blocks";
  import { galleryText } from "./content/gallery";
  import { themeText } from "./content/theme";
  import Gallery from "./Gallery.svelte";
  import { parseHash, type Route } from "./route";
  import { appTheme, loadTheme } from "./theme/ctl.svelte";
  import PreviewFrame from "./theme/PreviewFrame.svelte";
  import ThemePanel from "./theme/ThemePanel.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  let route = $state<Route>(parseHash(typeof window === "undefined" ? "" : window.location.hash));

  onMount(() => {
    loadTheme();
    route = parseHash(window.location.hash);
    const onHash = () => {
      route = parseHash(window.location.hash);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  });

  const block = $derived(route.view === "block" ? BLOCK_BY_ID[route.id] : undefined);
  const View = $derived(block ? CATALOG[block.id] : undefined);
  const studio = $derived(Boolean(block && View));
</script>

<Box tag="main" class="ui8-app" data-wide={appTheme.wide ?? ""} data-view={studio ? "studio" : "gallery"}>
  {#if studio && block && View}
    <Box class="ui8-studio">
      <Box class="ui8-studio-bar">
        <Button class="ui8-theme-btn" href="#/" data-testid="gallery-back">{galleryText.back}</Button>
        <Text tag="h1" class="ui8-studio-title">{block.label}</Text>
      </Box>
      <Box class="ui8-previews">
        <PreviewFrame mode="light" theme={appTheme.state.theme} label={themeText.previewLight} view={View} />
        <PreviewFrame mode="dark" theme={appTheme.state.theme} label={themeText.previewDark} view={View} />
      </Box>
    </Box>
    <ThemePanel />
  {:else}
    <Gallery />
  {/if}
  <ThemeToggle />
</Box>
