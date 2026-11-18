<script lang="ts">
  import { Button } from "@ui8kit/kit";
  import { shape } from "../classes";
  import { ui } from "../content/en";

  let {
    label = ui.heroSplit.cta,
    href = ui.heroSplit.href,
    tone = "primary",
    field,
  }: {
    tone?: "primary" | "secondary";
    label?: string;
    href?: string;
    field?: string;
  } = $props();
</script>

<Button class={tone === "secondary" ? shape.ctaSecondary : shape.cta} aria-label={label} {href} data-shape="cta" data-role={"cta-" + tone} data-field={field}></Button>
