# prototypes

**8px wireframe catalog, enforced by [ui8px](https://github.com/ui8kit/ui8px-cli).** Every block of [UI8Kit](https://github.com/ui8kit) in every layout variant, drawn as rectangles only, on an 8px layout grid (4px only for control steps), with shadcn tokens only. `bun run verify` fails the build on any off-grid value in the rendered DOM, the class tables or the compiled CSS (ui8px gate, `.ui8px/gate.json`, max 0).

Bun workspaces, Vite, Svelte 5 runes, TypeScript. Not a marketing site and not an idea dump.

## Packages

| Path | Role |
| --- | --- |
| `packages/kit` | Official UI8Kit Svelte primitives (`npx ui8kit@3 add --all`). Do not edit by hand. |
| `packages/blocks` | Generated organisms `HeroSimple` / `TeamSimple` with their contracts and models (`src/generated`, synced from codegen-x/ui8kit, pinned by `codegen.lock.json`), the registry over them, and the layout shells / shapes of the theme panels. Wireframes only: no clean block, composition or recipe. |
| `packages/theme` | codegen-x `magazine-theme` v2 model: exact skins, palette, radius / density / shadow per element, presets, CSS/JSON. Fonts carried, not drawn. |
| `apps/blocks` | Feed of every block × every variant; header Theme button → Theme sheet; dark toggle. |

## Constructor rules

- Organisms are generated in codegen-x/ui8kit (`packages/prototypes`) and synced; never edited here.
- A saved block is page-spec v2 of `@ui8kit/contract`: `{ id, item, variant, props }`, the settings (`level`, `padding`, `align`, `landmarkLabel`) inside `props` (`docs/adr/0001-settings-in-props.md`).
- No bare HTML in composition. Retag with `tag` on kit primitives / layout shells.
- No copy, no raster images, no unique colors or gradients. Media is a hatched data-URI `Image`.
- Wireframes are rectangles and text bars only. Accordion, tabs, carousel: stacks of rectangles, not kit widgets.
- Content models are 5–10 fields (`docs/content-contract.md`).
- Remaining Tailwind utilities live in `packages/blocks/src/classes.ts`; the shared ones (roles, align, justify, padding, container) are read from codegen-x (`src/generated/classes.json`).
- Structural check: **0 raw utility classes per hand-written `.svelte` file** (`scripts/check-blocks.ts`).

## Commands

```sh
bun install
bun run verify          # scripts/verify.mjs: the named, timed steps below; what CI runs (Bun 1.2.21 and 1.4.4)
bun run check:codegen   # src/generated == codegen.lock.json == codegen-x at the pin (sha256)
bun run check:rules     # .cursor/rules + skills == ui8kit/contract at rules.lock.json (sha256)
bun run check:blocks    # hand-written .svelte: 0 raw utilities, primitives only
bun run catalog:build   # the embeddable catalog bundle; fails on tailwind-merge or over the gzip budget
bun run px              # ui8px gate: lint the DOM snapshot + class tables, validate grid / patterns / aria
bun run px:extract      # write .ui8px/extract (class tables, density steps) only
bun run px:cli -- ...   # the ui8px CLI itself
bun run test:node       # registry, page-spec v2, one source, theme (node --test)
bun run sync:codegen    # re-sync src/generated (-- --update <commit> to move the pin)
bun run dev             # gallery + theme constructor
bun run kit:install     # npx ui8kit@3 add --all (Svelte; CDN fallback in docs/kit.md)
```

Decisions: `docs/adr/`.

## Theme

The constructor in `apps/blocks` renders every block from the registry in every layout variant, one after another, full width. Each block type (item) has one content model (`hero@1`, `team@1`, shared by every variant), places bound to JSON pointers, and interchangeable layout variants; every block draws as a wireframe only (rectangles; the real blocks are the registry's). A builder saves `{ id, item, variant, props }` (page-spec v2, settings in props); the machine-readable contracts and models are generated (`packages/blocks/src/generated/contracts`, `models`; published at `https://registry.buildy.tw/contracts/` and `/models/`; `docs/content-contract.md`). Skins (exact codegen-x tokens, picked from 4:3 cards drawn in their own skin), brand presets (taste-data row 1), a colour wheel (9 harmonies, 16 presets, AA/AAA), radius (0–16px) and radius / density / shadow per element (badge, button, card, media), section padding (`compact` / `standard` / `spacious`, the blocks' `padding` setting, even 8px including the lg step), the writing direction of the preview (LTR / RTL) and a design-system specimen live in `packages/theme` and the Theme sheet. Export / import JSON in the codegen-x/ui8kit format (`magazine-theme` v2: made in apps/stock, applied here, and back) or CSS variables. Fonts are carried in the config but not drawn.

Storage: `prototypes:v1:theme` and `ui8kit-theme` (light/dark). Dark mode is the `dark` class on `<html>`; `Media` swaps its light/dark hatch with `dark:hidden` / `dark:block`. Semantic roles (token + height): `docs/blocks.md`. See `docs/theme.md`.
