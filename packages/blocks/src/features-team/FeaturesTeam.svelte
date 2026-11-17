<script lang="ts">
  import { Block, Container, Grid, Stack } from "../layout";
  import { Avatar, Heading, TextLine } from "../shapes";
  import { ui } from "../content/en";

  let {
    count = 3,
    label = ui.featuresTeam.label,
  }: {
    count?: number;
    label?: string;
  } = $props();

  const members = $derived(Array.from({ length: count }, (_, index) => index));
</script>

<Block tag="section" py="16" aria-label={label}>
  <Container>
    <Stack gap="8" align="center">
      <Heading width="1/3" size="lg" />
      <Grid cols={3} gap="8">
        {#each members as member (member)}
          <Stack gap="4" align="center">
            <Avatar size="md" />
            <Heading width="1/2" />
            <TextLine width="3/4" />
            <TextLine width="1/2" />
          </Stack>
        {/each}
      </Grid>
    </Stack>
  </Container>
</Block>
