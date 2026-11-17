# prototypes

Strict wireframe block constructor for [UI8Kit](https://github.com/ui8kit). Bun workspaces, Vite, Svelte 5 runes, TypeScript.

This is not a marketing site and not an idea dump. Blocks are organisms of rectangles and circles on the 8+4 grid, using shadcn tokens only.

## Packages

| Path | Role |
| --- | --- |
| `packages/kit` | Official UI8Kit Svelte primitives (CLI/registry). Do not edit by hand. |
| `packages/blocks` | Layout shells, placeholder shapes, and organism blocks. |
| `packages/theme` | Palette, skins, density, radius, CSS/JSON. No fonts. |
| `apps/blocks` | Showcase, theme constructor panel, dual light/dark block preview. |

## Constructor rules

- One `Block` per organism file. Never nest or loop `Block` in that file.
- No bare HTML in composition. Retag with `tag` on kit primitives / layout shells.
- No copy, no raster images, no unique colors or gradients. Media is a hatched data-URI `Image`.
- Blocks render **only** `TextLine`, `Heading`, `CtaShape`, `Media`, `Dot` / `Avatar`.
- Remaining Tailwind utilities live in `packages/blocks/src/classes.ts`. Organisms pass `tag`, `gap`, `align`, `justify`, `cols`, `py` on `Block` / `Container` / `Stack` / `Group` / `Grid`.
- Structural check: **0 raw utility classes per block `.svelte` file**.

## Commands

```sh
bun install
bun run verify          # check-blocks + ui8px gate + tests
bun run dev             # showcase
bun run kit:install     # reinstall primitives (CLI, else GitHub registry)
```

`verify` is what CI runs. ui8px extract + lint + validate grid / patterns / aria are inside `bun run lint:px`.

## Theme

The constructor in `apps/blocks` live-previews both blocks in light and dark. Skins, a colour wheel (9 harmonies, 16 presets, AA/AAA), radius (0–16px), and density (`compact` / `default` / `comfortable` on the 8+4 grid) live in `packages/theme`. Export JSON (`prototypes-theme` v1) or CSS variables. Fonts are excluded.

Storage: `prototypes:v1:theme` and `ui8kit-theme` (chrome mode). `Media` swaps hatches with `dark:` utilities scoped to `[data-mode="dark"]` on each preview frame. See `docs/theme.md`.
