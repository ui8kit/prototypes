# AGENTS

Wireframe constructor on top of `ui8kit/contract`. Copy `.cursor/rules` and `.cursor/skills` as-is. Details: rules `00`–`05`, `10-contract-package`, `ui8kit-primitives`.

## This repo

- **Layer:** prototypes (blocks) + a thin showcase app. No layouts package.
- **Runtime:** Svelte 5 only. The eight-runtime identity rule is a contract target, not generated here.
- **Kit:** `packages/kit/src` from `npx ui8kit@3 add --all` (Svelte, registry 3.4.0). Never hand-edit those files. `ui8kit.lock.json` pins sha256 of every installed path. Reinstall: `bun run kit:install` (`docs/kit.md`).
- **Blocks:** `packages/blocks`. Layout shells wrap kit `Box` because UI8Kit v3 has no `Block` / `Container` / `Stack` / `Grid` primitives. Semantic `tag`, `gap`, `align`, `justify`, `cols`, `py` live on those shells. Each organism has a sibling `*.block.ts` **content contract** (id, category, named fields, layout-only variants). `src/manifest/registry.ts` exports every manifest; `src/catalog.ts` maps id → component. Rules: `docs/content-contract.md` — simple content, interchangeable variants, full rendering.
- **Utilities:** `packages/blocks/src/classes.ts` is the only home for raw Tailwind strings in the constructor. `scripts/check-blocks.py` fails a block `.svelte` file that embeds more than **0** utility tokens, and requires a matching `*.block.ts`.
- **Shapes:** `TextLine`, `Heading`, `Badge`, `CtaShape`, `Media`, `Dot`, `Avatar`, `Surface`. Organisms import these and the layout shells only. Everything is a rectangle or a text bar. Image/video = `Media` (image inside a rectangle). Avatar = square + `rounded-full`. Accordion, tabs, carousel and other interactive kit widgets are **not** implemented — they are stacks/groups of rectangles. The only kit control allowed in `packages/blocks` is `Button` on `CtaShape`.
- **Field budget:** each content contract is **5–10** fields. An array counts as one field; its item fields count too. Cardinality does not multiply. Tests fail above 10 (and below 5). Counts: `docs/fields.md`.
- **App:** `apps/blocks` is one vertical feed: every registered block in every variant, full width, one after another (no switcher, no categories yet). The header has only a **Theme** button that opens the Theme sheet (kit `Dialog` docked right, as in `codegen-x/ui8kit` `apps/stock`). Light/dark is the standard `dark` class on `<html>` from the fixed bottom-right `ThemeToggle` (localStorage `ui8kit-theme`). Fonts are not part of the constructor.
- **Roles:** token + height per meaning (`docs/blocks.md` → Roles). Do not add a role without a row there and a case in `shapes/roles.test.ts`.
- **Theme:** `packages/theme` (palette, skins, density, section padding, CSS/JSON). Details: `docs/theme.md`. Density remaps existing 8+4 utilities; it must not change `--spacing`. Section padding is a real class pair on `Block` (`py-8 lg:py-16` / `py-16 lg:py-32` / `py-24 lg:py-40`, all multiples of 8px; ui8px layout spacing lists 32 and 40). Radius per element (badge, button, card, media): shapes keep plain `rounded` + `data-slot`, `packages/blocks/src/radius.css` reads `--radius-<element>`.

## Checks (zero baseline)

| Command | What |
| --- | --- |
| `python3 scripts/check-blocks.py` | Block root, no nested/looped Block, no bare HTML, no literal copy, no inline style, forbidden radius/shadow/palette, max raw utilities = 0, sibling `*.block.ts`, `blockRoot` in sync, no interactive kit except `CtaShape` `Button` |
| `node scripts/ui8px-gate.mjs` | Extract class maps from `classes.ts`, `ui8px lint`, `validate grid`, `validate patterns`, `validate aria`. Gate `max: 0`, blocking `UI8PX001`, `UI8PX003`, `UI8PX005`, `GRID` |
| `node --experimental-strip-types --test packages/theme/src/*.test.ts packages/blocks/src/manifest/*.node.test.ts` | Palette WCAG, density 8+4, CSS/JSON export; every organism has a registered content contract; variants are layout-only; field budget 5–10; avatars are square |
| `bun run fields:summary` | Aggregate content contracts → `docs/fields.json` + `docs/fields.md` (field budget 5–10, which fields and record types repeat) |
| `vitest run` | Organism structure, token classes, empty text content, flattened counts match `[data-shape]`, **completeness** (every field in every variant). `vitest.config.ts` pins `resolve.conditions: ["browser"]` so Svelte's client `mount` is used |

Kit sources are not extracted: control recipes (`size-3`, `pr-2`) would trip layout 8+4.

## Contract gaps

- `@ui8kit/contract` Codex v0.4 / `codex:validate` is not wired. There are no records yet; dictionary keys live in `packages/blocks/src/content/en.ts`.
- `codegen-x/ui8kit` `packages/tooling` and `packages/ui-gates` are private and not copied. `check-blocks.py` is the local structural stand-in.
- Official `npx ui8kit@3` loads `@ui8kit/registry` from npm via CDN (unpkg → jsDelivr). Retry with `--retry` / `--registry-url`; do not copy primitives by hand (`docs/kit.md`).
- `ui8px` is a devDependency (`^0.2.5`). Run it via `bun` / `npx` (`scripts/ui8px.mjs`). Do not vendor it.

## Do not

- Edit `packages/kit/**` by hand.
- Put Tailwind class strings in organism `.svelte` files.
- Add `rounded-lg` / `rounded-md` / `rounded-xl`, shadows, gradients, or palette colors.
- Put visible words in templates. `aria-label` comes from props or `content/en.ts`.
- Import interactive kit widgets (`Dialog`, `Select`, `Disclosure`, …) into `packages/blocks`. Draw them as rectangles.
- Open a PR for constructor work: commits on `main` as **Grok Bot** `<grokbot@users.noreply.github.com>`.

## Add a block

See `docs/adding-a-block.md` and `docs/content-contract.md`. Short path: dictionary → one content schema + layout variants in `*.block.ts` + registry + catalog → failing test (including completeness across variants) → organism of shapes with `data-field` → `bun run fields:summary` → `bun run verify`.

Do not fork a block because the image moved or the column count changed. Do not hide a filled field in a variant. Do not implement accordion/tabs/carousel as kit widgets. Keep the contract inside 5–10 fields.
