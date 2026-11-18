<!--
  Features team. One composition for the feed (mode="wireframe": header + `placeholders` member shapes) and the page
  (mode="page": one member per `content.members` item, in array order). Member places are bound per instance:
  data-field="/members/<index>/title" resolves from the render index, so after a reorder a click maps to the new position.
-->
<script lang="ts">
  import { Block, Container, Grid, Stack } from "../layout";
  import { Surface } from "../shapes";
  import { AvatarPlace, HeadingPlace, TextPlace } from "../places";
  import { ui } from "../content/en";
  import type { GridColumns } from "../classes";
  import { bind, placeOf, resolveVariant, type Mode } from "../manifest/types";
  import type { TeamContent, TeamMember } from "../models/team";
  import { filled, hasImage } from "../model/validate";
  import { featuresTeam } from "./features-team.block";

  let {
    variant,
    mode = "wireframe",
    content,
    placeholders = placeOf(featuresTeam, "member").wireframe ?? 3,
    label = ui.featuresTeam.label,
  }: {
    variant?: string;
    mode?: Mode;
    /** the saved block's `props` (page mode); ignored by the wireframe */
    content?: Partial<TeamContent>;
    /** member shapes the wireframe draws */
    placeholders?: number;
    label?: string;
  } = $props();

  const at = { title: bind(featuresTeam, "title"), description: bind(featuresTeam, "description") };

  const resolved = $derived(resolveVariant(featuresTeam, variant));
  const columns = $derived(Number(resolved.layout.columns ?? 3) as GridColumns);
  const cards = $derived(resolved.layout.cards === true);
  const wire = $derived(mode === "wireframe");
  const c = $derived(wire ? {} : (content ?? {}));
  const header = $derived(wire || filled(c.title) || filled(c.description));

  type Row = { index: number; member: Partial<TeamMember> };
  const shown = (m: Partial<TeamMember>) => hasImage(m.avatar) || filled(m.title) || filled(m.description);
  const rows: Row[] = $derived(
    wire
      ? Array.from({ length: placeholders }, (_, index) => ({ index, member: {} }))
      : (c.members ?? []).map((member, index) => ({ index, member })).filter((row) => shown(row.member)),
  );
</script>

{#snippet person(row: Row)}
  <Stack gap="4" align="center">
    <AvatarPlace {mode} image={row.member.avatar} size="lg" {...bind(featuresTeam, "member.avatar", row.index)} />
    <HeadingPlace {mode} value={row.member.title} level={3} width="1/2" center {...bind(featuresTeam, "member.title", row.index)} />
    <TextPlace {mode} value={row.member.description} bars={["3/4", "1/2"]} center {...bind(featuresTeam, "member.description", row.index)} />
  </Stack>
{/snippet}

<Block tag="section" aria-label={label} data-variant={resolved.id} data-mode={mode}>
  <Container>
    <Stack gap="8">
      {#if header}
        <Stack gap="4" align="center">
          <HeadingPlace {mode} value={c.title} size="lg" width="1/3" center {...at.title} />
          <TextPlace {mode} value={c.description} size="lead" bars={["1/2", "1/3"]} center {...at.description} />
        </Stack>
      {/if}
      {#if rows.length > 0}
        <Grid cols={columns} gap="8">
          {#each rows as row (row.index)}
            {@const item = bind(featuresTeam, "member", row.index)}
            {#if cards}
              <Surface data-place={item.place} data-field={item.field}>{@render person(row)}</Surface>
            {:else}
              <Stack gap="4" data-place={item.place} data-field={item.field}>{@render person(row)}</Stack>
            {/if}
          {/each}
        </Grid>
      {/if}
    </Stack>
  </Container>
</Block>
