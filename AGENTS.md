# AGENTS

Wireframe constructor on top of `ui8kit/contract`. Copy `.cursor/rules` and `.cursor/skills` as-is. Details: rules `00`–`05`, `10-contract-package`, `ui8kit-primitives`.

## This repo

- **Layer:** prototypes (blocks) + a thin showcase app. No layouts package.
- **Runtime:** Svelte 5 only. The eight-runtime identity rule is a contract target, not generated here.
- **Kit:** `packages/kit/src` from registry `3.4.0` via `scripts/install-kit.py`. Never hand-edit those files. `ui8kit.lock.json` pins sha256 of every installed path.
- **Blocks:** `packages/blocks`. Layout shells wrap kit `Box` because UI8Kit v3 has no `Block` / `Container` / `Stack` / `Grid` primitives. Semantic `tag`, `gap`, `align`, `justify`, `cols`, `py` live on those shells.
- **Utilities:** `packages/blocks/src/classes.ts` is the only home for raw Tailwind strings in the constructor. `scripts/check-blocks.py` fails a block `.svelte` file that embeds more than **0** utility tokens.
- **Shapes:** `TextLine`, `Heading`, `CtaShape`, `Media`, `Dot`, `Avatar`. Organisms import these and the layout shells only.
- **App:** `apps/blocks` mounts the organisms, the theme constructor panel, dual light/dark previews, and the theme toggle. Fonts are not part of the constructor.
- **Theme:** `packages/theme` (palette, skins, density, section padding, CSS/JSON). Details: `docs/theme.md`. Density and section padding remap existing 8+4 utilities; they must not change `--spacing`. Section padding steps are multiples of 8px.

## Checks (zero baseline)

| Command | What |
| --- | --- |
| `python3 scripts/check-blocks.py` | Block root, no nested/looped Block, no bare HTML, no literal copy, no inline style, forbidden radius/shadow/palette, max raw utilities = 0 |
| `node scripts/ui8px-gate.mjs` | Extract class maps from `classes.ts`, `ui8px lint`, `validate grid`, `validate patterns`, `validate aria`. Gate `max: 0`, blocking `UI8PX001`, `UI8PX003`, `UI8PX005`, `GRID` |
| `node --experimental-strip-types --test packages/theme/src/*.test.ts` | Palette WCAG, density 8+4, CSS/JSON export |
| `vitest run` | Organism structure, token classes, empty text content |

Kit sources are not extracted: control recipes (`size-3`, `pr-2`) would trip layout 8+4.

## Contract gaps

- `@ui8kit/contract` Codex v0.4 / `codex:validate` is not wired. There are no records yet; dictionary keys live in `packages/blocks/src/content/en.ts`.
- `codegen-x/ui8kit` `packages/tooling` and `packages/ui-gates` are private and not copied. `check-blocks.py` is the local structural stand-in.
- Official `npx ui8kit@3` needs `registry.buildy.tw` + npm. The installer falls back to GitHub `ui8kit/registry` JSON (same files).
- `ui8px` is a devDependency; `tools/ui8px` is a MIT-vendored 0.2.5 fallback for environments that cannot reach npm.

## Do not

- Edit `packages/kit/**` by hand.
- Put Tailwind class strings in organism `.svelte` files.
- Add `rounded-lg` / `rounded-md` / `rounded-xl`, shadows, gradients, or palette colors.
- Put visible words in templates. `aria-label` comes from props or `content/en.ts`.
- Open a PR for constructor work: commits on `main` as **Grok Bot** `<grokbot@users.noreply.github.com>`.
