<script lang="ts">
  import { onMount } from "svelte";
  import { Box, Button, Text } from "@ui8kit/kit";
  import { BLOCK_BY_ID, CATALOG, resolveVariant } from "@ui8kit/blocks";
  import { galleryText } from "./content/gallery";
  import { themeText } from "./content/theme";
  import Gallery from "./Gallery.svelte";
  import { blockHref, parseHash, type Route } from "./route";
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
  const variantId = $derived(
    block && route.view === "block" ? resolveVariant(block, route.variant).id : undefined,
  );
</script>

<Box tag="main" class="ui8-app" data-wide={appTheme.wide ?? ""} data-view={studio ? "studio" : "gallery"}>
  {#if studio && block && View}
    <Box class="ui8-studio">
      <Box class="ui8-studio-bar">
        <Button class="ui8-theme-btn" href="#/" data-testid="gallery-back">{galleryText.back}</Button>
        <Text tag="h1" class="ui8-studio-title">{block.label}</Text>
      </Box>
      <Box class="ui8-studio-variants" role="group" aria-label={galleryText.variant}>
        {#each block.variants as option (option.id)}
          <Button
            class="ui8-theme-btn"
            pressed={option.id === variantId}
            onclick={() => {
              window.location.hash = blockHref(block.id, option.id);
            }}
            data-testid={"variant-" + option.id}
          >
            {galleryText.variants[option.id] ?? option.id}
          </Button>
        {/each}
      </Box>
      <Box class="ui8-previews">
        <PreviewFrame mode="light" theme={appTheme.state.theme} label={themeText.previewLight} view={View} variant={variantId} />
        <PreviewFrame mode="dark" theme={appTheme.state.theme} label={themeText.previewDark} view={View} variant={variantId} />
      </Box>
    </Box>
    <ThemePanel />
  {:else}
    <Gallery />
  {/if}
  <ThemeToggle />
</Box>
