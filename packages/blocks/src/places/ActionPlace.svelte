<!--
  Action place: TWO fields, one element. Wireframe: the CTA bar. Page: a link when label and href are both filled; the label
  as plain text when only the label is; nothing otherwise (a link without a name or a target is not drawn).
-->
<script lang="ts">
  import { Button, Text } from "@ui8kit/kit";
  import { page } from "../classes";
  import type { Mode } from "../manifest/types";
  import { filled } from "../model/validate";
  import CtaShape from "../shapes/CtaShape.svelte";

  let {
    mode,
    label,
    href,
    place,
    field,
  }: { mode: Mode; label?: string; href?: string; place: string; field: string } = $props();
</script>

{#if mode === "wireframe"}
  <CtaShape {place} {field} />
{:else if filled(label) && filled(href)}
  <Button {href} class={page.action} data-role="cta-primary" data-slot="button" data-place={place} data-field={field}>{label}</Button>
{:else if filled(label)}
  <Text tag="span" class={page.actionText} data-place={place} data-field={field}>{label}</Text>
{/if}
