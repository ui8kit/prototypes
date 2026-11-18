<script lang="ts">
  import { Box, cn } from "@ui8kit/kit";
  import { shape, type AvatarSize } from "../classes";

  const sizeClass = {
    sm: shape.avatarSm,
    md: shape.avatarMd,
    lg: shape.avatarLg,
  } as const;

  let { size = "md", field }: { size?: AvatarSize; field?: string } = $props();

  const cls = $derived(cn(shape.avatar, sizeClass[size]));
</script>

<Box class={cls} data-shape="avatar" data-field={field}></Box>
