<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { shape, type AvatarSize } from "../classes";

  const sizeClass = {
    sm: shape.avatarSm,
    md: shape.avatarMd,
    lg: shape.avatarLg,
  } as const;

  let { size = "md", place, field }: { size?: AvatarSize; place?: string; field?: string } = $props();

  const cls = $derived(cn(shape.avatar, sizeClass[size]));
</script>

<Box class={cls} aria-hidden="true" data-shape="avatar" data-role="accent" data-place={place} data-field={field}></Box>
