<script lang="ts">
  import { Box, Image } from "@ui8kit/kit";
  import { shape } from "../classes";
  import { ui } from "../content/en";
  import { MEDIA_DARK, MEDIA_LIGHT } from "./media";

  let { alt = ui.media.alt, field }: { alt?: string; field?: string } = $props();
</script>

<Box tag="figure" class={shape.media} data-shape="media" data-role="media" data-field={field}>
  <Image src={MEDIA_LIGHT} {alt} class={shape.mediaLight} />
  <Image src={MEDIA_DARK} {alt} class={shape.mediaDark} />
  <Box class={shape.mediaOverlay} aria-hidden="true">
    <Box class={shape.mediaMark}></Box>
  </Box>
</Box>
