# Blocks

The organisms are **generated**: `HeroSimple` (`hero-simple`, model `hero@1`) and `TeamSimple` (`team-simple`, model
`team@1`) come from codegen-x/ui8kit `packages/prototypes` (the simple line) and are synced into
`packages/blocks/src/generated` by `scripts/sync-codegen.ts`, pinned by `codegen.lock.json`. Never edit them here.
**Rectangles only**: they are wireframes (the only mode) and take the variant axes and the padding and align settings, never
content: bars, pills, discs and frames on the kit `Box`, each shape with `data-place` / `data-field` for the builder's
inspector. No clean block, composition or recipe is in this repository: the real blocks are the registry's
(`https://registry.buildy.tw`). Data contract: [content-contract.md](./content-contract.md).

The hand-written part of `packages/blocks` is the layout shells and shapes used by the app's theme panels, the
manifest helpers over the generated contracts.

## Rectangles and text (wireframe)

In the wireframe everything is a **rectangle** or a **text bar** (`Heading`, `TextLine`), `aria-hidden`, without words.

| What | How |
| --- | --- |
| Copy | `Heading` / `TextLine` rectangles |
| Image or video | `Media`: hatched `Image` **inside** a muted rectangle |
| Avatar | Square (`h-N w-N` equal sides) with `rounded-full` |
| CTA | `ShapeCta` (generated): a bar (`data-slot="button"`), not interactive; the page draws the link |
| Accordion, tabs, carousel, dialog, form, select, … | **Not implemented.** Draw them as `Stack` / `Group` / `Grid` of rectangles |

`scripts/check-blocks.ts` forbids interactive kit primitives in the hand-written part of `packages/blocks`; `Image` only in `shapes/Media.svelte`. `src/generated` is checked by `scripts/sync-codegen.ts --check` (sha256 per file) and by the codegen-x gates.

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

a generated organism (codegen-x `packages/prototypes`): a `section` with the `padding` setting's class pair, the
container `mx-auto w-full max-w-6xl px-4` and a `Stack` with `gap` / `align`.

`py-16 lg:py-32` is the `padding` setting `standard` (the gallery passes the theme's section padding as that prop). The
container padding is `px-4` (16px, an 8px multiple), one value from codegen-x `CONTAINER` (`generated/classes.json`).
`text-center` is unnecessary: there is no text.

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
| Primary CTA | `cta-primary` | `ShapeCta` (generated; theme panels: `shape.cta`) (`data-slot="button"`) | `bg-primary` | `h-10` (40px, control step) | `w-24`, no text, `aria-hidden` |
| Secondary CTA | `cta-secondary` | `shape.ctaSecondary` (theme panels only) | `bg-secondary` | `h-10` | `w-24`, no text |
| Avatar | `avatar` | `ShapeAvatar` (generated) | `bg-accent` | square `h-16 w-16` + `rounded-full` | accent only for emphasis (avatar, badge) |
| Badge | `badge` | `Badge` | `bg-accent` | `h-6` (24px), `w-16` | eyebrow / tag; `rounded-full` + `data-slot="badge"` (theme badge radius, unset: pill) |
| Media | `media` | `Media` | `bg-muted` | `ratio`: `4/3` (default), `video`, `21/9` (full-width rows, e.g. hero media-top) | base64 light / dark hatch (16px diagonal tiles, no stretching at any size), switched by `dark:hidden` / `dark:block`; centred `bg-background` circle; `data-slot="media-frame"` |
| Card surface | `surface` | `Surface` (`data-slot="card"`) | `bg-card` + `border border-border` | content | `p-8`; wraps other shapes, not a content field |

Default tokens (no skin, no palette) are wireframe-tuned in `packages/theme/src/css.ts` (`FALLBACK`): light muted 0.955 / secondary 0.90 / accent oklch(0.82 0.08 255) / primary 0.205; dark muted 0.25 / secondary 0.38 / accent oklch(0.45 0.09 255) / primary 0.922. Skins and custom palettes bring their own values.

## Shape colours

Heading and text bars do not take `bg-secondary` / `bg-muted` (too pale in light mode) but `--shape-heading` /
`--shape-text` (`src/tokens.css`), mixed in CSS (oklab) from the skin's foreground over its background: heading 92%,
text 72%. Measured on all 16 skins and the default: light mode at least 4.76:1 (heading) and 3.24:1 (text) against the
background and the card (WCAG 1.4.11 asks 3:1), dark at least 7.21:1 and 4.81:1. A skin overrides either token per mode.

## Utilities

All raw class strings: `packages/blocks/src/classes.ts`. Layout/shape components read maps. Hand-written `.svelte` files must report **0** raw utilities (`scripts/check-blocks.ts`). The role table, `align` / `justify`, the `padding` presets and the container are codegen-x `ROLE` / `ALIGN` / `JUSTIFY` / `TEXT_ALIGN` / `PADDING` / `CONTAINER` (`src/generated/classes.json`); `classes.ts` reads them, `manifest/classes.node.test.ts` pins the rest.

Density is per element (badge, button, card) and read by `packages/blocks/src/tokens.css` on the shapes only; shadow per element (card, media) too. Section padding is a real class pair from the theme, passed to the generated blocks as their `padding` setting (`compact` / `standard` / `spacious`, the same names in the theme): compact `py-8 lg:py-16` (32/64), standard `py-16 lg:py-32` (64/128), spacious `py-24 lg:py-40` (96/160). Radius per element (badge, button, card, media) rides on `data-slot` + `tokens.css`. See `docs/theme.md`.
