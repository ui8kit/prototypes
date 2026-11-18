<!-- A text-free page in miniature, drawn with the constructor's own shapes so radius, density and shadow tokens apply. The
     parent scopes the theme (skin card, preset card) with a data attribute; ScopedStyles writes the rules. -->
<script lang="ts">
  import { Box } from "@ui8kit/kit";
  import { Badge, Grid, Group, Heading, Stack, Surface, TextLine, shape } from "@ui8kit/blocks";
</script>

<Box class="ui8-mini" aria-hidden="true">
  <Stack gap="4" class="ui8-mini-page">
    <Badge />
    <Heading size="lg" width="3/4" />
    <TextLine size="lead" width="full" />
    <TextLine width="2/3" />
    <Group gap="4">
      <Box class={shape.cta} data-shape="cta" data-slot="button"></Box>
      <Box class={shape.ctaSecondary} data-shape="cta" data-slot="button"></Box>
    </Group>
    <Grid cols={2} gap="4">
      <Surface>
        <Stack gap="4">
          <Heading width="1/2" />
          <TextLine width="full" />
        </Stack>
      </Surface>
      <Surface>
        <Stack gap="4">
          <Heading width="1/2" />
          <TextLine width="full" />
        </Stack>
      </Surface>
    </Grid>
  </Stack>
</Box>
