<!-- Badge place: a pill shape in the wireframe; the badge text on the page. Empty on the page: no element at all. -->
<script lang="ts">
  import { Text } from "@ui8kit/kit";
  import { page } from "../classes";
  import type { Mode } from "../manifest/types";
  import { filled } from "../model/validate";
  import Badge from "../shapes/Badge.svelte";

  let { mode, value, place, field }: { mode: Mode; value?: string; place: string; field: string } = $props();
</script>

{#if mode === "wireframe"}
  <Badge {place} {field} />
{:else if filled(value)}
  <Text tag="span" class={page.badge} data-role="badge" data-slot="badge" data-place={place} data-field={field}>{value}</Text>
{/if}
