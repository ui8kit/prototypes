<script lang="ts">
  import { Block, Container, Grid, Stack } from "../layout";
  import { Avatar, Heading, TextLine } from "../shapes";
  import { ui } from "../content/en";
  import type { GridColumns } from "../classes";
  import { resolveCount, resolveVariant } from "../manifest/types";
  import { featuresTeam } from "./features-team.block";

  const membersField = featuresTeam.content.find((field) => field.id === "members");
  const defaultCount = membersField ? resolveCount(membersField.count) : 3;

  let {
    variant,
    count = defaultCount,
    label = ui.featuresTeam.label,
  }: {
    variant?: string;
    count?: number;
    label?: string;
  } = $props();

  const resolved = $derived(resolveVariant(featuresTeam, variant));
  const columns = $derived(Number(resolved.layout.columns ?? 3) as GridColumns);
  const members = $derived(Array.from({ length: count }, (_, index) => index));
</script>

<Block tag="section" py="16" aria-label={label} data-variant={resolved.id}>
  <Container>
    <Stack gap="8">
      <Stack gap="4" align="center">
        <Heading field="title" width="1/3" size="lg" />
        <TextLine field="description" size="lead" width="1/2" />
        <TextLine field="description" size="lead" width="1/3" />
      </Stack>
      <Grid cols={columns} gap="8">
        {#each members as member (member)}
          <Stack gap="4" align="center">
            <Avatar field="members.avatar" size="lg" />
            <Heading field="members.title" width="1/2" />
            <TextLine field="members.description" width="3/4" />
            <TextLine field="members.description" width="1/2" />
          </Stack>
        {/each}
      </Grid>
    </Stack>
  </Container>
</Block>
