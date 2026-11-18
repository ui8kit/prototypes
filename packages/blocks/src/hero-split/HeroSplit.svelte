<script lang="ts">
  import { Block, Container, Grid, Stack } from "../layout";
  import { Badge, CtaShape, Heading, Media, TextLine } from "../shapes";
  import { ui } from "../content/en";
  import { resolveVariant } from "../manifest/types";
  import { heroSplit } from "./hero-split.block";

  let {
    variant,
    label = ui.heroSplit.label,
    cta = ui.heroSplit.cta,
    href = ui.heroSplit.href,
  }: {
    variant?: string;
    label?: string;
    cta?: string;
    href?: string;
  } = $props();

  const resolved = $derived(resolveVariant(heroSplit, variant));
  const layout = $derived(resolved.layout.media);
</script>

{#snippet copy()}
  <Stack gap="8">
    <Stack gap="4" align="start">
      <Badge field="badge" />
      <Heading field="title" width="3/4" size="lg" />
      <TextLine field="description" size="lead" width="full" />
      <TextLine field="description" size="lead" width="2/3" />
    </Stack>
    <CtaShape field="actionLabel actionHref" label={cta} {href} />
  </Stack>
{/snippet}

<Block tag="section" aria-label={label} data-variant={resolved.id}>
  <Container>
    {#if layout === "top"}
      <Stack gap="8">
        <Media field="image" ratio="21/9" />
        {@render copy()}
      </Stack>
    {:else if layout === "left"}
      <Grid cols={2} gap="8" align="center">
        <Media field="image" />
        {@render copy()}
      </Grid>
    {:else}
      <Grid cols={2} gap="8" align="center">
        {@render copy()}
        <Media field="image" />
      </Grid>
    {/if}
  </Container>
</Block>
