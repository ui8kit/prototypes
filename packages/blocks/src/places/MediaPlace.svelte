<!-- Media place: the hatched frame in the wireframe; a figure with the image on the page. No src: no figure. -->
<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { page, shape, type MediaRatio } from "../classes";
  import type { Mode } from "../manifest/types";
  import type { ImageValue } from "../model/types";
  import { hasImage } from "../model/validate";
  import Media from "../shapes/Media.svelte";
  import ThemedImage from "./ThemedImage.svelte";

  let { mode, image, place, field, ratio = "4/3" }: { mode: Mode; image?: ImageValue; place: string; field: string; ratio?: MediaRatio } = $props();
</script>

{#if mode === "wireframe"}
  <Media {ratio} {place} {field} />
{:else if hasImage(image)}
  <Box tag="figure" class={cn(page.media, shape.mediaRatio[ratio])} data-role="media" data-slot="media-frame" data-place={place} data-field={field}>
    <ThemedImage {image} />
  </Box>
{/if}
