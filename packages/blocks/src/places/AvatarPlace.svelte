<!-- Avatar place: a circle in the wireframe; the round photo on the page. No src: nothing. -->
<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { page, shape, type AvatarSize } from "../classes";
  import type { Mode } from "../manifest/types";
  import type { ImageValue } from "../model/types";
  import { hasImage } from "../model/validate";
  import Avatar from "../shapes/Avatar.svelte";
  import ThemedImage from "./ThemedImage.svelte";

  const sizeClass = { sm: shape.avatarSm, md: shape.avatarMd, lg: shape.avatarLg } as const;

  let { mode, image, place, field, size = "lg" }: { mode: Mode; image?: ImageValue; place: string; field: string; size?: AvatarSize } = $props();
</script>

{#if mode === "wireframe"}
  <Avatar {size} {place} {field} />
{:else if hasImage(image)}
  <Box class={cn(page.avatar, sizeClass[size])} data-role="avatar" data-place={place} data-field={field}>
    <ThemedImage {image} />
  </Box>
{/if}
