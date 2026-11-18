# Blocks

Organisms in `packages/blocks`. Each file opens on one `Block`. Inside: layout shells + placeholder shapes. No copy.

## Rectangles and text

Everything in a block is a **rectangle** or **text**. Text is a placeholder bar (`Heading`, `TextLine`), not kit `Text` with copy.

| What | How |
| --- | --- |
| Copy | `Heading` / `TextLine` rectangles |
| Image or video | `Media`: hatched `Image` **inside** a muted rectangle |
| Avatar | Square (`h-N w-N` equal sides) with `rounded-full` |
| CTA | The only interactive kit widget: `CtaShape` (`Button`) |
| Accordion, tabs, carousel, dialog, form, select, … | **Not implemented.** Draw them as `Stack` / `Group` / `Grid` of rectangles |

`scripts/check-blocks.py` forbids interactive kit primitives in `packages/blocks` except `Button` on `CtaShape.svelte`. Organisms never import `@ui8kit/kit`.

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

| Sketch | Block | Content contract | Variants (layout) | Structure |
| --- | --- | --- | --- | --- |
| Team / features row | `FeaturesTeam` | title + `teamMember[]` (avatar, title, description × 2) | `columns-2` / `columns-3` / `columns-4` | `Block` → `Container` → `Stack` → title `Heading` + `Grid` of `Avatar` + `Heading` + two `TextLine`s |
| Split hero | `HeroSplit` | title, description × 2, image, actionLabel, actionHref | `media-left` / `media-right` / `media-top` | `Block` → `Container` → `Grid` or `Stack` of copy (`Heading`, `TextLine`s, `CtaShape`) and `Media` |

The registry (`packages/blocks/src/manifest/registry.ts`) is the gallery source. Content contract: `docs/content-contract.md`. Field budget (5–10) and repetition: `docs/fields.md`. Adding a block: `docs/adding-a-block.md`.

## Shapes

| Shape | Token look |
| --- | --- |
| `TextLine` | `bg-muted rounded h-2` + width |
| `Heading` | `bg-secondary rounded h-4` or `h-6` |
| `CtaShape` | `Button` `bg-primary rounded h-10 w-24`, named via `aria-label` |
| `Media` | muted frame, `aspect-video`, light/dark hatched data-URI `Image` |
| `Avatar` / `Dot` | square (`h-8 w-8` / `h-12 w-12` / `h-16 w-16`) + `rounded-full bg-accent` (accent only here) |

## Utilities

All raw class strings: `packages/blocks/src/classes.ts`. Layout/shape components read maps. Organism files must report **0** raw utilities (`scripts/check-blocks.py`).

Density in `apps/blocks` remaps `gap-8`, `h-10`, `w-24`, and `h-4` under `[data-density]`. Section padding remaps Block `py-16` via `--theme-section-py` / `--theme-section-py-lg` (compact 32/64, default 64/128, spacious 96/160). Block class names do not change. See `docs/theme.md`.
