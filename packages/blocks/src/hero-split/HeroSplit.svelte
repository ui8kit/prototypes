<!--
  Hero split. One composition for the feed (mode="wireframe": shapes only) and the page (mode="page": `content`).
  Places are bound directly (typed props → place components); data-place / data-field come from the manifest (bind).
  Page: empty optional fields render nothing, empty wrappers are dropped, and when the media or the copy side is empty the
  other side takes the whole row.
-->
<script lang="ts">
  import { Block, Container, Grid, Group, Stack } from "../layout";
  import { ActionPlace, BadgePlace, HeadingPlace, MediaPlace, TextPlace } from "../places";
  import { ui } from "../content/en";
  import { bind, resolveVariant, type Mode } from "../manifest/types";
  import type { HeroContent } from "../models/hero";
  import { filled, hasImage } from "../model/validate";
  import { heroSplit } from "./hero-split.block";

  let {
    variant,
    mode = "wireframe",
    content,
    label = ui.heroSplit.label,
  }: {
    variant?: string;
    mode?: Mode;
    /** the saved block's `props` (page mode); ignored by the wireframe */
    content?: Partial<HeroContent>;
    label?: string;
  } = $props();

  const at = {
    badge: bind(heroSplit, "badge"),
    title: bind(heroSplit, "title"),
    description: bind(heroSplit, "description"),
    media: bind(heroSplit, "media"),
    action: bind(heroSplit, "action"),
  };

  const resolved = $derived(resolveVariant(heroSplit, variant));
  const side = $derived(resolved.layout.media);
  const wire = $derived(mode === "wireframe");
  const c = $derived(wire ? {} : (content ?? {}));
  const head = $derived(wire || filled(c.badge) || filled(c.title) || filled(c.description));
  const action = $derived(wire || filled(c.actionLabel));
  const copy = $derived(head || action);
  const media = $derived(wire || hasImage(c.image));
</script>

{#snippet copyColumn()}
  <Stack gap="8">
    {#if head}
      <Stack gap="4" align="start">
        <BadgePlace {mode} value={c.badge} {...at.badge} />
        <HeadingPlace {mode} value={c.title} size="lg" width="3/4" {...at.title} />
        <TextPlace {mode} value={c.description} size="lead" bars={["full", "2/3"]} {...at.description} />
      </Stack>
    {/if}
    {#if action}
      <Group>
        <ActionPlace {mode} label={c.actionLabel} href={c.actionHref} {...at.action} />
      </Group>
    {/if}
  </Stack>
{/snippet}

<Block tag="section" aria-label={label} data-variant={resolved.id} data-mode={mode}>
  <Container>
    {#if side === "top" || !copy || !media}
      <Stack gap="8">
        {#if media}
          <MediaPlace {mode} image={c.image} ratio="21/9" {...at.media} />
        {/if}
        {#if copy}
          {@render copyColumn()}
        {/if}
      </Stack>
    {:else if side === "left"}
      <Grid cols={2} gap="8" align="center">
        <MediaPlace {mode} image={c.image} {...at.media} />
        {@render copyColumn()}
      </Grid>
    {:else}
      <Grid cols={2} gap="8" align="center">
        {@render copyColumn()}
        <MediaPlace {mode} image={c.image} {...at.media} />
      </Grid>
    {/if}
  </Container>
</Block>
