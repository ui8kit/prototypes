<script lang="ts">
  import type { SectionPadding } from "../classes";
  import Block from "./Block.svelte";
  import SectionScope from "./SectionScope.svelte";

  let { padding }: { padding: SectionPadding } = $props();
</script>

<SectionScope {padding}>
  <Block tag="section" />
</SectionScope>
