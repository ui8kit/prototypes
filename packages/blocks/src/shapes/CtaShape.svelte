<script lang="ts">
  import { Box } from "@ui8kit/kit";
  import { shape } from "../classes";

  /** Call-to-action bar (wireframe): geometry only, not a link; the page mode draws the real link (ActionPlace). */
  let { tone = "primary", place, field }: { tone?: "primary" | "secondary"; place?: string; field?: string } = $props();
</script>

<Box
  class={tone === "secondary" ? shape.ctaSecondary : shape.cta}
  aria-hidden="true"
  data-shape="cta"
  data-role={"cta-" + tone}
  data-slot="button"
  data-place={place}
  data-field={field}
></Box>
