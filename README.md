# prototypes

Strict wireframe block constructor for [UI8Kit](https://github.com/ui8kit). Bun workspaces, Vite, Svelte 5 runes, TypeScript.

This is not a marketing site and not an idea dump. Blocks are organisms of rectangles and circles on the 8+4 grid, using shadcn tokens only.

## Packages

| Path | Role |
| --- | --- |
| `packages/kit` | Official UI8Kit Svelte primitives (CLI/registry). Do not edit by hand. |
| `packages/blocks` | Layout shells, placeholder shapes, organism blocks, and typed `*.block.ts` manifests. |
| `packages/theme` | Palette, skins, density, radius, CSS/JSON. No fonts. |
| `apps/blocks` | Gallery by category, single-block preview, theme constructor panel. |

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
bun run verify          # check-blocks + ui8px gate + tests + field summary
bun run fields:summary  # rewrite docs/fields.md from manifests
bun run dev             # gallery + theme constructor
bun run kit:install     # reinstall primitives (CLI, else GitHub registry)
```

`verify` is what CI runs. ui8px extract + lint + validate grid / patterns / aria are inside `bun run lint:px`.

## Theme

The constructor in `apps/blocks` lists blocks by category from the registry and live-previews one block at a time (`#/block/<id>`) in light and dark. Each organism has a sibling manifest of slots/fields so later unification can see which structures repeat (`docs/fields.md`, `bun run fields:summary`). Skins, a colour wheel (9 harmonies, 16 presets, AA/AAA), radius (0–16px), density (`compact` / `default` / `comfortable` on the 8+4 grid), and section padding (`compact` / `default` / `spacious`, even 8px including the lg step) live in `packages/theme`. Export JSON (`prototypes-theme` v1) or CSS variables. Fonts are excluded.

Storage: `prototypes:v1:theme` and `ui8kit-theme` (chrome mode). `Media` swaps hatches with `dark:` utilities scoped to `[data-mode="dark"]` on each preview frame. See `docs/theme.md`.
