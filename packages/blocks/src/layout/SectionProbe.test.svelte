<script lang="ts">
  import type { SectionPadding } from "../classes";
  import HeroSplit from "../hero-split/HeroSplit.svelte";
  import SectionScope from "./SectionScope.svelte";

  let { padding }: { padding: SectionPadding } = $props();
</script>

<SectionScope {padding}>
  <HeroSplit />
</SectionScope>
