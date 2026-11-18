<!-- Theme rules scoped to a data attribute (skin cards, preset cards): one <style> in the head instead of inline style. -->
<script lang="ts">
  let { css }: { css: string } = $props();
  const tag = $derived(`<style data-ui8-scoped>${css.replaceAll("</", "<\\/")}</style>`);
</script>

<svelte:head>
  {@html tag}
</svelte:head>
