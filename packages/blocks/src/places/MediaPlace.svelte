<!-- Media place: the hatched frame in the wireframe; a figure with the image on the page. No src: no figure. -->
<script lang="ts">
  import { useMode } from "./mode";
  import { Box, cn } from "@ui8kit/kit";
  import { page, shape, type MediaRatio } from "../classes";
  import type { ImageValue } from "../model/types";
  import { hasImage } from "../model/validate";
  import Media from "../shapes/Media.svelte";
  import ThemedImage from "./ThemedImage.svelte";

  let { image, place, field, ratio = "4/3" }: { image?: ImageValue; place: string; field: string; ratio?: MediaRatio } = $props();

  const mode = useMode();
</script>

{#if mode() === "wireframe"}
  <Media {ratio} {place} {field} />
{:else if hasImage(image)}
  <Box tag="figure" class={cn(page.media, shape.mediaRatio[ratio])} data-role="media" data-slot="media-frame" data-place={place} data-field={field}>
    <ThemedImage {image} />
  </Box>
{/if}
