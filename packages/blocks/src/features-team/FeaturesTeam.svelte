<!--
  Features team: a layout of places over `team@1`. Rectangle-only by default (wireframe: header + 3 member placeholders).
  The builder's preview draws one member per `content.members` item, in array order; this file never reads the mode.
  Member places are bound per instance (`/members/<index>/title`), so after a reorder a click maps to the new position.
  Member names are one level below the block title (h2 → h3; h1 → h2; h3 → h4).
-->
<script lang="ts">
  import { Block, Container, Grid, Stack } from "../layout";
  import { AvatarPlace, HeadingPlace, ItemPlace, TextPlace, presence, type Row } from "../places";
  import { ui } from "../content/en";
  import type { GridColumns, HeadingLevel } from "../classes";
  import { bind, placeOf, resolveVariant, type TitleLevel } from "../manifest/types";
  import type { TeamContent, TeamMember } from "../models/team";
  import { featuresTeam } from "./features-team.block";

  let {
    variant,
    content,
    headingLevel = 2,
    label = ui.featuresTeam.label,
  }: {
    variant?: string;
    /** the saved block's `props` */
    content?: Partial<TeamContent>;
    /** instance option: level of the block title; member names are one level below */
    headingLevel?: TitleLevel;
    label?: string;
  } = $props();

  const at = { title: bind(featuresTeam, "title"), description: bind(featuresTeam, "description") };
  const placeholders = placeOf(featuresTeam, "member").wireframe ?? 3;

  const draw = presence();
  const resolved = $derived(resolveVariant(featuresTeam, variant));
  const columns = $derived(Number(resolved.layout.columns ?? 3) as GridColumns);
  const cards = $derived(resolved.layout.cards === true);
  const c = $derived(draw.content(content));
  const header = $derived(draw.any(c.title, c.description));
  const rows = $derived(draw.rows<TeamMember>(c.members, placeholders));
  const memberLevel = $derived((headingLevel + 1) as HeadingLevel);
</script>

{#snippet person(row: Row<TeamMember>)}
  <Stack gap="4" align="center">
    <AvatarPlace image={row.item.avatar} size="lg" {...bind(featuresTeam, "member.avatar", row.index)} />
    <HeadingPlace value={row.item.title} level={memberLevel} width="1/2" center {...bind(featuresTeam, "member.title", row.index)} />
    <TextPlace value={row.item.description} bars={["3/4", "1/2"]} center {...bind(featuresTeam, "member.description", row.index)} />
  </Stack>
{/snippet}

<Block tag="section" aria-label={label}>
  <Container>
    <Stack gap="8">
      {#if header}
        <Stack gap="4" align="center">
          <HeadingPlace value={c.title} level={headingLevel} size="lg" width="1/3" center {...at.title} />
          <TextPlace value={c.description} size="lead" bars={["1/2", "1/3"]} center {...at.description} />
        </Stack>
      {/if}
      {#if rows.length > 0}
        <Grid cols={columns} gap="8">
          {#each rows as row (row.index)}
            <ItemPlace {cards} {...bind(featuresTeam, "member", row.index)}>{@render person(row)}</ItemPlace>
          {/each}
        </Grid>
      {/if}
    </Stack>
  </Container>
</Block>
