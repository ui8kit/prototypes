<!--
  Builder-only: render a saved block `{ id, item, variant, options?, props }`. `mode="page"` must be passed explicitly;
  the default is the rectangle-only wireframe, the same as rendering the organism directly.
-->
<script lang="ts">
  import { CATALOG } from "../catalog";
  import type { BlockInstance, Mode } from "../manifest/types";
  import { provideMode } from "../places/mode";

  let { instance, mode = "wireframe" }: { instance: BlockInstance; mode?: Mode } = $props();

  provideMode(() => mode);
  const View = $derived(CATALOG[instance.item]);
</script>

{#if View}
  <View variant={instance.variant} content={instance.props} {...instance.options} />
{/if}
