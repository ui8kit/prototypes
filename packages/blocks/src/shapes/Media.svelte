<script lang="ts">
  import { Box, cn, Image } from "@ui8kit/kit";
  import { shape, type MediaRatio } from "../classes";
  import { ui } from "../content/en";
  import { MEDIA_DARK, MEDIA_LIGHT } from "./media";

  let {
    alt = ui.media.alt,
    ratio = "4/3",
    field,
  }: { alt?: string; ratio?: MediaRatio; field?: string } = $props();

  const cls = $derived(cn(shape.media, shape.mediaRatio[ratio]));
</script>

<Box tag="figure" class={cls} data-shape="media" data-role="media" data-slot="media-frame" data-ratio={ratio} data-field={field}>
  <Image src={MEDIA_LIGHT} {alt} class={shape.mediaLight} />
  <Image src={MEDIA_DARK} {alt} class={shape.mediaDark} />
  <Box class={shape.mediaOverlay} aria-hidden="true">
    <Box class={shape.mediaMark}></Box>
  </Box>
</Box>
