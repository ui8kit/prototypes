<script lang="ts">
  import { Button } from "@ui8kit/kit";
  import { shape } from "../classes";
  import { ui } from "../content/en";

  let {
    label = ui.heroSplit.cta,
    href = ui.heroSplit.href,
    field,
  }: {
    label?: string;
    href?: string;
    field?: string;
  } = $props();
</script>

<Button class={shape.cta} aria-label={label} {href} data-shape="cta" data-field={field}></Button>
