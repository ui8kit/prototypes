# prototypes

Strict wireframe block constructor for [UI8Kit](https://github.com/ui8kit). Bun workspaces, Vite, Svelte 5 runes, TypeScript.

This is not a marketing site and not an idea dump. Blocks are organisms of rectangles and circles on the 8+4 grid, using shadcn tokens only.

## Packages

| Path | Role |
| --- | --- |
| `packages/kit` | Official UI8Kit Svelte primitives (`npx ui8kit@3 add --all`). Do not edit by hand. |
| `packages/blocks` | Layout shells, placeholder shapes, organism blocks, and typed `*.block.ts` manifests. |
| `packages/theme` | codegen-x `magazine-theme` v2 model: exact skins, palette, radius / density / shadow per element, presets, CSS/JSON. Fonts carried, not drawn. |
| `apps/blocks` | Feed of every block × every variant; header Theme button → Theme sheet; dark toggle. |

## Constructor rules

- One `Block` per organism file. Never nest or loop `Block` in that file.
- No bare HTML in composition. Retag with `tag` on kit primitives / layout shells.
- No copy, no raster images, no unique colors or gradients. Media is a hatched data-URI `Image`.
- Blocks render **only** `TextLine`, `Heading`, `CtaShape`, `Media`, `Dot` / `Avatar` (rectangles and text bars). Accordion, tabs, carousel: stacks of rectangles, not kit widgets.
- Content contracts are 5–10 fields (`docs/fields.md`).
- Remaining Tailwind utilities live in `packages/blocks/src/classes.ts`. Organisms pass `tag`, `gap`, `align`, `justify`, `cols`, `py` on `Block` / `Container` / `Stack` / `Group` / `Grid`.
- Structural check: **0 raw utility classes per block `.svelte` file**.

## Commands

```sh
bun install
bun run verify          # check-blocks + ui8px gate + tests + field summary
bun run fields:summary  # rewrite docs/fields.md from manifests
bun run dev             # gallery + theme constructor
bun run kit:install     # npx ui8kit@3 add --all (Svelte; CDN fallback in docs/kit.md)
```

`verify` is what CI runs. ui8px extract + lint + validate grid / patterns / aria are inside `bun run lint:px`.

## Theme

The constructor in `apps/blocks` renders every block from the registry in every layout variant, one after another, full width. Each organism has one content schema and interchangeable layout variants (`docs/content-contract.md`). Later unification reads which fields repeat (`docs/fields.md`, `bun run fields:summary`). Skins (exact codegen-x tokens, picked from 4:3 cards drawn in their own skin), brand presets (taste-data row 1), a colour wheel (9 harmonies, 16 presets, AA/AAA), radius (0–16px) and radius / density / shadow per element (badge, button, card, media), section padding (`compact` / `default` / `spacious`, even 8px including the lg step) and a design-system specimen live in `packages/theme` and the Theme sheet. Export / import JSON in the codegen-x/ui8kit format (`magazine-theme` v2: made in apps/stock, applied here, and back) or CSS variables. Fonts are carried in the config but not drawn.

Storage: `prototypes:v1:theme` and `ui8kit-theme` (light/dark). Dark mode is the `dark` class on `<html>`; `Media` swaps its light/dark hatch with `dark:hidden` / `dark:block`. Semantic roles (token + height): `docs/blocks.md`. See `docs/theme.md`.
