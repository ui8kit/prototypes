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

`py-16 lg:py-32` is the theme's section padding (Standard); `Block` gets the step from the theme, organisms pass no padding. Container padding is `px-8` (even step). `text-center` is unnecessary: there is no text.

| Sketch | Block | Content contract | Variants (layout) | Structure |
| --- | --- | --- | --- | --- |
| Team / features row | `FeaturesTeam` | title, description × 2 + `teamMember[]` (avatar, title, description × 2) | `columns-2` / `columns-3` / `columns-4` / `cards-3` (members on `Surface`) | `Block` → `Container` → `Stack` → centred intro (`Heading` lg + two lead `TextLine`s) + `Grid` of centred `Avatar` + `Heading` + two `TextLine`s |
| Split hero | `HeroSplit` | badge, title, description × 2, image, actionLabel, actionHref | `media-left` / `media-right` / `media-top` | `Block` → `Container` → `Grid` (2 cols, vertically centred) or `Stack` of copy (`Heading` lg, two lead `TextLine`s, gap, `CtaShape`) and `Media` (4:3 with a centred circle) |

The registry (`packages/blocks/src/manifest/registry.ts`) is the gallery source. Content contract: `docs/content-contract.md`. Field budget (5–10) and repetition: `docs/fields.md`. Adding a block: `docs/adding-a-block.md`.

## Roles

A wireframe has no words, so meaning is carried by **token + height**. Every role is one shadcn token and (for bars) one height. Source of truth: `role` in `packages/blocks/src/classes.ts`; enforced by `packages/blocks/src/shapes/roles.test.ts` (one token per role, plain `rounded`, bar roles differ by token or height, each shape renders its role and `data-role`) and `packages/theme/src/roles.test.ts` (the default tokens `background`, `muted`, `secondary`, `accent`, `primary` differ by ≥ 0.04 oklch lightness in light **and** dark).

| Role | `data-role` | Shape | Token | Height | Notes |
| --- | --- | --- | --- | --- | --- |
| Body text line | `text` | `TextLine` | `bg-muted` | `h-2` (8px) | widths `1/4`…`full` |
| Lead / subtitle | `lead` | `TextLine size="lead"` | `bg-muted` | `h-2` (8px) | `h-3` is off the 8+4 layout grid (ui8px UI8PX001), so a lead is the same bar drawn **wider** (`full`, `2/3`, `1/2`) under a heading |
| Heading | `heading` | `Heading` | `bg-secondary` | `h-4` (16px) | card / item titles |
| Large heading (H1/H2) | `heading-lg` | `Heading size="lg"` | `bg-secondary` | `h-6` (24px) | section titles |
| Primary CTA | `cta-primary` | `CtaShape` (`data-slot="button"`) | `bg-primary` | `h-10` (40px, control step) | `w-24`, no text, `aria-label` from `content/en.ts` |
| Secondary CTA | `cta-secondary` | `CtaShape tone="secondary"` | `bg-secondary` | `h-10` | `w-24`, no text |
| Accent / emphasis | `accent` | `Avatar` / `Dot` | `bg-accent` | square `h-8`/`h-12`/`h-16` + `rounded-full` | accent only for emphasis (avatar, badge, highlighted item) |
| Badge | `badge` | `Badge` | `bg-accent` | `h-6` (24px), `w-16` | eyebrow / tag; `rounded-full` + `data-slot="badge"` (theme badge radius, unset: pill) |
| Media | `media` | `Media` | `bg-muted` | `ratio`: `4/3` (default), `video`, `21/9` (full-width rows, e.g. hero media-top) | base64 light / dark hatch (16px diagonal tiles, no stretching at any size), switched by `dark:hidden` / `dark:block`; centred `bg-background` circle; `data-slot="media-frame"` |
| Card surface | `surface` | `Surface` (`data-slot="card"`) | `bg-card` + `border border-border` | content | `p-8`; wraps other shapes, not a content field |

Default tokens (no skin, no palette) are wireframe-tuned in `packages/theme/src/css.ts` (`FALLBACK`): light muted 0.955 / secondary 0.90 / accent oklch(0.82 0.08 255) / primary 0.205; dark muted 0.25 / secondary 0.38 / accent oklch(0.45 0.09 255) / primary 0.922. Skins and custom palettes bring their own values.

## Utilities

All raw class strings: `packages/blocks/src/classes.ts`. Layout/shape components read maps. Organism files must report **0** raw utilities (`scripts/check-blocks.py`).

Density is per element (badge, button, card) and read by `packages/blocks/src/tokens.css` on the shapes only; shadow per element (card, media) too. Section padding is a real class pair on `Block` from the theme: compact `py-8 lg:py-16` (32/64), standard `py-16 lg:py-32` (64/128), spacious `py-24 lg:py-40` (96/160). Radius per element (badge, button, card, media) rides on `data-slot` + `tokens.css`. See `docs/theme.md`.
