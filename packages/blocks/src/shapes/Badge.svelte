<script lang="ts">
  import { Box } from "@ui8kit/kit";
  import { shape } from "../classes";

  /** Accent pill (wireframe). Its corner follows the theme's badge radius (`--radius-badge`; unset: the pill). */
  let { place, field }: { place?: string; field?: string } = $props();
</script>

<Box class={shape.badge} aria-hidden="true" data-shape="badge" data-role="badge" data-slot="badge" data-place={place} data-field={field}></Box>
