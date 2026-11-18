<script lang="ts">
  import { Box } from "@ui8kit/kit";
  import { shape } from "../classes";

  /** Accent pill (eyebrow / tag). Its corner follows the theme's badge radius (`--radius-badge`; unset: the pill). */
  let { field }: { field?: string } = $props();
</script>

<Box class={shape.badge} data-shape="badge" data-role="badge" data-slot="badge" data-field={field}></Box>
