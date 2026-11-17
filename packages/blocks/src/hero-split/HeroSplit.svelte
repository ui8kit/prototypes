<script lang="ts">
  import { Block, Container, Grid, Stack } from "../layout";
  import { CtaShape, Heading, Media, TextLine } from "../shapes";
  import { ui } from "../content/en";

  let {
    label = ui.heroSplit.label,
    cta = ui.heroSplit.cta,
  }: {
    label?: string;
    cta?: string;
  } = $props();
</script>

<Block tag="section" py="16" aria-label={label}>
  <Container>
    <Grid cols={2} gap="8" align="center">
      <Stack gap="6">
        <Heading width="3/4" size="lg" />
        <TextLine width="full" />
        <TextLine width="2/3" />
        <CtaShape label={cta} />
      </Stack>
      <Media />
    </Grid>
  </Container>
</Block>
