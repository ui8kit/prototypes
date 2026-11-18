<!--
  Hero split: a layout of places over `hero@1`. Rectangle-only by default (wireframe). The builder's preview draws the same
  composition from `content`; this file never reads the mode: `presence()` says which groups to draw, places draw them.
  Empty values render nothing, empty wrappers are dropped, and when the media or the copy side is empty the other side
  takes the whole row.
-->
<script lang="ts">
  import { Block, Container, Grid, Group, Stack } from "../layout";
  import { ActionPlace, BadgePlace, HeadingPlace, MediaPlace, TextPlace, presence } from "../places";
  import { ui } from "../content/en";
  import { bind, resolveVariant, type TitleLevel } from "../manifest/types";
  import type { HeroContent } from "../models/hero";
  import { heroSplit } from "./hero-split.block";

  let {
    variant,
    content,
    headingLevel = 2,
    label = ui.heroSplit.label,
  }: {
    variant?: string;
    /** the saved block's `props` */
    content?: Partial<HeroContent>;
    /** instance option: h1 when the hero opens the page; the look does not change */
    headingLevel?: TitleLevel;
    label?: string;
  } = $props();

  const at = {
    badge: bind(heroSplit, "badge"),
    title: bind(heroSplit, "title"),
    description: bind(heroSplit, "description"),
    media: bind(heroSplit, "media"),
    action: bind(heroSplit, "action"),
  };

  const draw = presence();
  const resolved = $derived(resolveVariant(heroSplit, variant));
  const side = $derived(resolved.layout.media);
  const c = $derived(draw.content(content));
  const head = $derived(draw.any(c.badge, c.title, c.description));
  const action = $derived(draw.any(c.actionLabel));
  const copy = $derived(head || action);
  const media = $derived(draw.any(c.image));
</script>

{#snippet copyColumn()}
  <Stack gap="8">
    {#if head}
      <Stack gap="4" align="start">
        <BadgePlace value={c.badge} {...at.badge} />
        <HeadingPlace value={c.title} level={headingLevel} size="lg" width="3/4" {...at.title} />
        <TextPlace value={c.description} size="lead" bars={["full", "2/3"]} {...at.description} />
      </Stack>
    {/if}
    {#if action}
      <Group>
        <ActionPlace label={c.actionLabel} href={c.actionHref} {...at.action} />
      </Group>
    {/if}
  </Stack>
{/snippet}

<Block tag="section" aria-label={label}>
  <Container>
    {#if side === "top" || !copy || !media}
      <Stack gap="8">
        {#if media}
          <MediaPlace image={c.image} ratio="21/9" {...at.media} />
        {/if}
        {#if copy}
          {@render copyColumn()}
        {/if}
      </Stack>
    {:else if side === "left"}
      <Grid cols={2} gap="8" align="center">
        <MediaPlace image={c.image} {...at.media} />
        {@render copyColumn()}
      </Grid>
    {:else}
      <Grid cols={2} gap="8" align="center">
        {@render copyColumn()}
        <MediaPlace image={c.image} {...at.media} />
      </Grid>
    {/if}
  </Container>
</Block>
