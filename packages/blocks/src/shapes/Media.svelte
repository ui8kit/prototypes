<script lang="ts">
  import { Box, Image } from "@ui8kit/kit";
  import { shape } from "../classes";
  import { ui } from "../content/en";
  import { MEDIA_DARK, MEDIA_LIGHT } from "./media";

  let { alt = ui.media.alt }: { alt?: string } = $props();
</script>

<Box tag="figure" class={shape.media} data-shape="media">
  <Image src={MEDIA_LIGHT} {alt} class={shape.mediaLight} />
  <Image src={MEDIA_DARK} {alt} class={shape.mediaDark} />
</Box>
