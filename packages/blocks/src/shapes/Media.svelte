<script lang="ts">
  import { Box, cn, Image } from "@ui8kit/kit";
  import { shape, type MediaRatio } from "../classes";
  import { MEDIA_DARK, MEDIA_LIGHT } from "./media";

  /** Media frame (wireframe): the hatched placeholder in a rectangle; the page mode draws the real image (MediaPlace). */
  let {
    ratio = "4/3",
    place,
    field,
  }: { ratio?: MediaRatio; place?: string; field?: string } = $props();

  const cls = $derived(cn(shape.media, shape.mediaRatio[ratio]));
</script>

<Box class={cls} aria-hidden="true" data-shape="media" data-role="media" data-slot="media-frame" data-ratio={ratio} data-place={place} data-field={field}>
  <Image src={MEDIA_LIGHT} alt="" class={shape.mediaLight} />
  <Image src={MEDIA_DARK} alt="" class={shape.mediaDark} />
  <Box class={shape.mediaOverlay}>
    <Box class={shape.mediaMark}></Box>
  </Box>
</Box>
