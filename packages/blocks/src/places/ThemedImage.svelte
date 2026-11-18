<!--
  One image for both themes, or a light / dark pair when `srcDark` is set. The pair is two Image elements toggled by the
  `dark` class (the app's dark mode is a class on <html>, not the OS preference, so <picture media> cannot follow it). The
  DOM is the same in light and dark; the hidden one is display:none (out of the accessibility tree), the dark one loads lazily.
-->
<script lang="ts">
  import { Image } from "@ui8kit/kit";
  import { page } from "../classes";
  import type { ImageValue } from "../model/types";
  import { filled } from "../model/validate";

  let { image }: { image: ImageValue } = $props();
  const pair = $derived(filled(image.srcDark));
</script>

{#if pair}
  <Image src={image.src} alt={image.alt} class={page.imageLight} />
  <Image src={image.srcDark} alt={image.alt} class={page.imageDark} loading="lazy" />
{:else}
  <Image src={image.src} alt={image.alt} class={page.image} />
{/if}
