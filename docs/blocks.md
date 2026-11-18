# Blocks

The organisms are **generated**: `HeroSimple` (`hero-simple`, model `hero@1`) and `TeamSimple` (`team-simple`, model
`team@1`) come from codegen-x/ui8kit `packages/prototypes` (the simple line) and are synced into
`packages/blocks/src/generated` by `scripts/sync-codegen.ts`, pinned by `codegen.lock.json`. Never edit them here.
**Rectangle-only by default**: rendered as they are (`mode` defaults to `wireframe`: the catalog feed), they draw shapes
only (bars, pills, the decorative placeholder picture). The builder's preview (`BlockView mode="page"`) renders the
same organism from the saved block's `props`, with `data-place` / `data-field` on every place; it is not a second
version. Data contract: [content-contract.md](./content-contract.md).

The hand-written part of `packages/blocks` is the layout shells and shapes used by the app's theme panels, the
manifest helpers over the generated contracts, `BlockView` and the fixtures.

## Rectangles and text (wireframe)

In the wireframe everything is a **rectangle** or a **text bar** (`Heading`, `TextLine`), `aria-hidden`, without words.

| What | How |
| --- | --- |
| Copy | `Heading` / `TextLine` rectangles |
| Image or video | `Media`: hatched `Image` **inside** a muted rectangle |
| Avatar | Square (`h-N w-N` equal sides) with `rounded-full` |
| CTA | `CtaShape`: a bar (`data-slot="button"`), not interactive; the page draws the link |
| Accordion, tabs, carousel, dialog, form, select, … | **Not implemented.** Draw them as `Stack` / `Group` / `Grid` of rectangles |

`scripts/check-blocks.py` forbids interactive kit primitives in the hand-written part of `packages/blocks`; `Image` only in `shapes/Media.svelte`. `src/generated` is checked by `scripts/sync-codegen.ts --check` (sha256 per file) and by the codegen-x gates.

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
| Team row | `TeamSimple` (generated) | `team@1`: title, description, `members: SimpleMember[]` (id, avatar, title, description) | `cols3` / `cols2` / `cols4` / `cards3` (axes `cols`, `surface`) | `section` → container → heading + text → `ul` of `li` (portrait, name, line); the wireframe draws 3 members |
| Simple hero | `HeroSimple` (generated) | `hero@1`: badge, title, description, image, imageAlt, imageDark, actionLabel, actionHref | `mediaEnd` / `mediaStart` / `mediaTop` (axis `media`) | `section` → container → grid of copy (badge, heading, text, link) and the picture (4:3, 21:9 on top) |

The registry (`packages/blocks/src/manifest/registry.ts`, over `src/generated/contracts`) is the gallery source. Content contract: `docs/content-contract.md`. Adding a block: `docs/adding-a-block.md`.

## Roles

A wireframe has no words, so meaning is carried by **token + height**. Every role is one shadcn token and (for bars) one height. Source of truth: `role` in `packages/blocks/src/classes.ts`; enforced by `packages/blocks/src/shapes/roles.test.ts` (one token per role, plain `rounded`, bar roles differ by token or height, each shape renders its role and `data-role`) and `packages/theme/src/roles.test.ts` (the default tokens `background`, `muted`, `secondary`, `accent`, `primary` differ by ≥ 0.04 oklch lightness in light **and** dark).

| Role | `data-role` | Shape | Token | Height | Notes |
| --- | --- | --- | --- | --- | --- |
| Body text line | `text` | `TextLine` | `bg-muted` | `h-2` (8px) | widths `1/4`…`full` |
| Lead / subtitle | `lead` | `TextLine size="lead"` | `bg-muted` | `h-2` (8px) | `h-3` is off the 8+4 layout grid (ui8px UI8PX001), so a lead is the same bar drawn **wider** (`full`, `2/3`, `1/2`) under a heading |
| Heading | `heading` | `Heading` | `bg-secondary` | `h-4` (16px) | card / item titles |
| Large heading (H1/H2) | `heading-lg` | `Heading size="lg"` | `bg-secondary` | `h-6` (24px) | section titles |
| Primary CTA | `cta-primary` | `CtaShape` (`data-slot="button"`) | `bg-primary` | `h-10` (40px, control step) | `w-24`, no text, `aria-hidden` (page mode: the real link) |
| Secondary CTA | `cta-secondary` | `CtaShape tone="secondary"` | `bg-secondary` | `h-10` | `w-24`, no text |
| Accent / emphasis | `accent` | `Avatar` / `Dot` | `bg-accent` | square `h-8`/`h-12`/`h-16` + `rounded-full` | accent only for emphasis (avatar, badge, highlighted item) |
| Badge | `badge` | `Badge` | `bg-accent` | `h-6` (24px), `w-16` | eyebrow / tag; `rounded-full` + `data-slot="badge"` (theme badge radius, unset: pill) |
| Media | `media` | `Media` | `bg-muted` | `ratio`: `4/3` (default), `video`, `21/9` (full-width rows, e.g. hero media-top) | base64 light / dark hatch (16px diagonal tiles, no stretching at any size), switched by `dark:hidden` / `dark:block`; centred `bg-background` circle; `data-slot="media-frame"` |
| Card surface | `surface` | `Surface` (`data-slot="card"`) | `bg-card` + `border border-border` | content | `p-8`; wraps other shapes, not a content field |

Default tokens (no skin, no palette) are wireframe-tuned in `packages/theme/src/css.ts` (`FALLBACK`): light muted 0.955 / secondary 0.90 / accent oklch(0.82 0.08 255) / primary 0.205; dark muted 0.25 / secondary 0.38 / accent oklch(0.45 0.09 255) / primary 0.922. Skins and custom palettes bring their own values.

## Page mode classes

Page mode is drawn by the generated organisms with the codegen-x compose recipes (`src/generated/svelte/compose`);
`classes.ts` no longer has a `page` map.

## Utilities

All raw class strings: `packages/blocks/src/classes.ts`. Layout/shape components read maps. Organism files must report **0** raw utilities (`scripts/check-blocks.py`).

Density is per element (badge, button, card) and read by `packages/blocks/src/tokens.css` on the shapes only; shadow per element (card, media) too. Section padding is a real class pair from the theme: on the hand-written `Block` by context, on the generated blocks through their `padding` setting (`compact` / `standard` / `spacious`; the app maps the theme step with `paddingOf()`): compact `py-8 lg:py-16` (32/64), standard `py-16 lg:py-32` (64/128), spacious `py-24 lg:py-40` (96/160). Radius per element (badge, button, card, media) rides on `data-slot` + `tokens.css`. See `docs/theme.md`.
