<script lang="ts">
  import { Button } from "@ui8kit/kit";
  import { shape } from "../classes";
  import { ui } from "../content/en";

  let { label = ui.heroSplit.cta }: { label?: string } = $props();
</script>

<Button class={shape.cta} aria-label={label} data-shape="cta"></Button>
