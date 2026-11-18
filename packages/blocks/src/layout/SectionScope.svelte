<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SectionPadding } from "../classes";
  import { provideSectionPadding } from "./section";

  /** Gives every Block inside the same section padding (a page, a preview, a test). */
  let { padding, children }: { padding: SectionPadding; children?: Snippet } = $props();

  provideSectionPadding(() => padding);
</script>

{@render children?.()}
