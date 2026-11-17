# prototypes

Strict wireframe block constructor for [UI8Kit](https://github.com/ui8kit). Bun workspaces, Vite, Svelte 5 runes, TypeScript.

This is not a marketing site and not an idea dump. Blocks are organisms of rectangles and circles on the 8+4 grid, using shadcn tokens only.

## Packages

| Path | Role |
| --- | --- |
| `packages/kit` | Official UI8Kit Svelte primitives (CLI/registry). Do not edit by hand. |
| `packages/blocks` | Layout shells, placeholder shapes, and organism blocks. |
| `apps/blocks` | Showcase. Theme toggle lives here, not in blocks. |

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

`apps/blocks` toggles `dark` on `html` and stores `ui8kit-theme` in `localStorage`. Placeholder `Media` swaps light/dark hatches with `dark:` utilities from the shared class map.
