<!--
  Builder-only: render a saved block `{ id, item, variant, options?, props }` with the generated organism of its item.
  `mode="page"` must be passed explicitly; the default is the rectangle-only wireframe, as in the catalog.
-->
<script lang="ts">
  import { CATALOG } from "../catalog";
  import { BLOCK_BY_ID } from "../manifest/registry";
  import { instanceProps, type BlockInstance, type Mode } from "../manifest/types";

  let { instance, mode = "wireframe" }: { instance: BlockInstance<unknown>; mode?: Mode } = $props();

  const View = $derived(CATALOG[instance.item]);
  const block = $derived(BLOCK_BY_ID[instance.item]);
</script>

{#if View && block}
  <View {...instanceProps(block, instance, mode)} />
{/if}
