# Blocks

Organisms in `packages/blocks`. Each file opens on one `Block`. Inside: layout shells + placeholder shapes. No copy.

## Sketch mapping

Typical marketing markup:

```html
<section class="w-full py-16 lg:py-32">
  <div class="container mx-auto px-4 md:px-6 lg:px-8">
    <div class="flex flex-col text-center gap-8 items-center">
      …
    </div>
  </div>
</section>
```

Absorbed as:

```svelte
<Block tag="section" py="16">
  <Container>
    <Stack gap="8" align="center">
      …
    </Stack>
  </Container>
</Block>
```

`lg:py-32` is dropped (`32` is off the layout scale). Container padding is `px-8` (even step). `text-center` is unnecessary: there is no text.

| Sketch | Block | Structure |
| --- | --- | --- |
| Team / features row | `FeaturesTeam` | `Block` → `Container` → `Stack` → title `Heading` + `Grid cols={3}` of `Avatar` + `Heading` + two `TextLine`s |
| Split hero | `HeroSplit` | `Block` → `Container` → `Grid cols={2}` of copy `Stack` (`Heading`, `TextLine`s, `CtaShape`) and `Media` |

## Shapes

| Shape | Token look |
| --- | --- |
| `TextLine` | `bg-muted rounded h-2` + width |
| `Heading` | `bg-secondary rounded h-4` or `h-6` |
| `CtaShape` | `Button` `bg-primary rounded h-10 w-24`, named via `aria-label` |
| `Media` | muted frame, `aspect-video`, light/dark hatched data-URI `Image` |
| `Avatar` / `Dot` | `rounded-full bg-accent` (accent is allowed only here) |

## Utilities

All raw class strings: `packages/blocks/src/classes.ts`. Layout/shape components read maps. Organism files must report **0** raw utilities (`scripts/check-blocks.py`).

Density in `apps/blocks` remaps `py-16`, `gap-8`, `h-10`, `w-24`, and `h-4` under `[data-density]`. Block class names do not change. See `docs/theme.md`.
