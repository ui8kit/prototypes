<!-- Item place: the wrapper of one list item (a member). Carries the item binding; `cards` puts it on a Surface. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import Stack from "../layout/Stack.svelte";
  import Surface from "../shapes/Surface.svelte";

  let { cards = false, place, field, children }: { cards?: boolean; place: string; field: string; children?: Snippet } = $props();
</script>

{#if cards}
  <Surface data-place={place} data-field={field}>{@render children?.()}</Surface>
{:else}
  <Stack gap="4" data-place={place} data-field={field}>{@render children?.()}</Stack>
{/if}
