# AGENTS

Wireframe constructor on top of `ui8kit/contract`. **Prototypes are rectangle-only**: every block, rendered as it is (feed, catalog, tests, any render without a mode), draws shapes only: no images, no words, no icons. There is no page mode here: real content is drawn by the clean blocks of the registry, never by a prototype. Copy `.cursor/rules` and `.cursor/skills` as-is. Details: rules `00`–`05`, `10-contract-package`, `ui8kit-primitives`.

## This repo

- **Layer:** prototypes (blocks) + a thin showcase app. No layouts package.
- **Runtime:** Svelte 5 only. The eight-runtime identity rule is a contract target, not generated here.
- **Kit:** `packages/kit/src` from `npx ui8kit@3 add --all` (Svelte, registry 3.4.0). Never hand-edit those files. `ui8kit.lock.json` pins sha256 of every installed path. Reinstall: `bun run kit:install` (`docs/kit.md`).
- **Blocks:** `packages/blocks`. The organisms are **generated**: `HeroSimple` (`hero-simple`, `hero@1`) and `TeamSimple` (`team-simple`, `team@1`) from codegen-x/ui8kit `packages/prototypes`, synced into `packages/blocks/src/generated` (svelte, contracts, models, manifest with sha256 per file) by `scripts/sync-codegen.ts` and pinned by `codegen.lock.json` (repo, commit, path, manifest sha256). **Never edit `src/generated` by hand**; change codegen-x and re-sync (`bun run sync:codegen -- --update <commit>`). `src/manifest/registry.ts` builds `BLOCKS` from the generated `registry.ts` (`CONTRACTS` + `CATEGORIES`: the model id) and re-exports its `MODELS`; `src/catalog.ts` re-exports the generated `CATALOG` (item → component); `src/index.ts` re-exports every wireframe and content type. No hand-written file names a block. A builder saves `{ id, item, variant, props }` (@ui8kit/contract page-spec v2). Hand-written: layout shells and shapes (theme panels), `classes.ts`, manifest helpers. Rules: `docs/content-contract.md`.
- **Utilities:** `packages/blocks/src/classes.ts` is the only home for raw Tailwind strings in the hand-written part. `scripts/check-blocks.ts` fails a hand-written block `.svelte` file that embeds more than **0** utility tokens; it skips `src/generated` (checked byte for byte by `sync-codegen --check`, its rules run in codegen-x) and requires `blockRoot` = `src/generated/svelte/blocks` plus any hand-written organism dirs. One source per value: the role table, `align` / `justify` / `textAlign`, the `padding` presets and the container are codegen-x `generated/classes.json`; `classes.ts`, the `padding` setting and the theme's section padding read or are tested against it (`manifest/classes.node.test.ts`).
- **Mode:** `wireframe` only: the generated wireframes take the variant axes, `padding` and `align`, never content; shapes only, no words, no links, no images, no labelled landmark, 3 placeholder members; every shape carries `data-place` / `data-field` for the builder's inspector. Heading / text bars read `--shape-heading` / `--shape-text` (`tokens.css`, ≥ 3:1 on every skin, light and dark).
- **Settings are props:** a saved block is `{ id, item, variant, props }` (page-spec v2, `additionalProperties: false`, `docs/adr/0001-settings-in-props.md`); a `props` key the contract lists under `settings` is a setting, the rest is content: `level` 1–3 (default 2, list item titles one level below), `padding` (`compact` py-8 lg:py-16 | `standard` py-16 lg:py-32, default | `spacious` py-24 lg:py-40; the theme's section padding uses the same names and is passed as the `padding` prop; a stored theme `"default"` loads as `standard`), `align` (`start` default, team-simple `center` | `center` | `end`; logical `items-*` / `self-*` / `text-*` only; a variant may set its own default, contract `variants[].settings`, `variantSettings()`: hero-simple `mediaTop` is `center`; `docs/adr/0002-align-as-setting.md`) and `landmarkLabel`. `splitProps()` splits them, `validateInstance()` checks values at `/props/<setting>` and the rest against the model; `wireframeProps()` builds the wireframe props (axes + padding + align). `manifest/page-spec.node.test.ts` validates a saved page with the published schema.
- **Shapes:** hand-written `TextLine`, `Heading`, `Badge`, `Media`, `Surface` and the layout shells `Stack`, `Group`, `Grid` serve the theme panels (MiniPage, DesignPanel); the blocks use the generated shapes (`ShapeHeading`, `ShapeText`, `ShapeBadge`, `ShapeCta`, `MediaFramePlace`). Interactive kit widgets are **not** implemented in `packages/blocks`.
- **Binding:** `data-place` (place id) + `data-field` (space-separated concrete JSON pointers, `/members/1/title`), as `bind(manifest, place, index)` resolves them from the contract places. `data-slot` / `data-role` / `data-shape` are theme hooks only.
- **Field budget:** each content model is **5–10** paths. A list counts as one field; its item fields count too. `registry.node.test.ts` fails outside 5–10.
- **App:** `apps/blocks`: **Catalog** is one vertical feed of every registered block in every variant, full width, always rectangle-only (`wireframeProps`: no content). Plus a **Theme** button that opens the Theme sheet (kit `Dialog` docked right, as in `codegen-x/ui8kit` `apps/stock`). Light/dark is the standard `dark` class on `<html>` from the fixed bottom-right `ThemeToggle` (localStorage `ui8kit-theme`). Fonts are not part of the constructor.
- **Roles:** token + height per meaning (`docs/blocks.md` → Roles). Do not add a role without a row there and a case in `shapes/roles.test.ts`.
- **Theme:** `packages/theme`. Model and JSON config are codegen-x/ui8kit `magazine-theme` v2 (`theme.ts`, `design.ts`; fixtures + round-trip tests in `codegen-x.test.ts`); keep them compatible. Exact skin tokens (`skin-tokens.ts`, generated by `scripts/port-skins.mjs`); the app adds only the wireframe legibility floor. Per-element radius, density and shadow tokens: shapes keep plain classes + `data-slot` / `data-shape`, `packages/blocks/src/tokens.css` reads `--radius-*`, `--h-*` / `--w-*` / `--pad-card`, `--shadow-*`; never `--spacing`. Section padding is the blocks' `padding` setting (`py-8 lg:py-16` / `py-16 lg:py-32` / `py-24 lg:py-40`, all multiples of 8px). Details: `docs/theme.md`.

## Checks (zero baseline)

`bun run verify` (`scripts/verify.mjs`) runs these as named, timed steps, stops at the first failure and writes the table to the GitHub job summary.

| Command | What |
| --- | --- |
| `bun run check:codegen` (`scripts/sync-codegen.ts --check`) | `src/generated` = its manifest (sha256 per file, no extra file) = `codegen.lock.json` = codegen-x at the locked commit (sparse fetch; `--offline` skips it) |
| `bun run check:rules` (`scripts/check-rules.ts`) | `.cursor/rules` + `.cursor/skills` = ui8kit/contract at `rules.lock.json` (commit + sha256 per file; `--update <contract checkout>` re-pins); `ui8kit-primitives.mdc` is local |
| `bun run check:blocks` (`scripts/check-blocks.ts`) | Hand-written files: Block root, no nested/looped Block, no bare HTML, no literal copy, no inline style, forbidden radius/shadow/palette, max raw utilities = 0, sibling `*.block.ts`, `blockRoot` in sync, no interactive kit |
| `bun run catalog:build` (`scripts/catalog-size.mjs`) | The embeddable catalog bundle `packages/blocks/catalog/dist` (wireframes + contracts + tokens), kit `cn` aliased to the codegen `--cn join` output (`kitCn` in `codegen.lock.json`); fails on tailwind-merge and over the gzip budget (`BUDGET`: JS 32 KiB, CSS 3 KiB) |
| `bun run px` (`scripts/ui8px-gate.mjs`) | The ui8px gate over what the blocks really draw: `ui8px lint` of the rendered wireframes (`packages/blocks/catalog/snapshots/<item>.snap.html`, one file per block) and of the imported `classes.ts` strings (`scripts/px-extract.ts` → `.ui8px/extract/classes.html`); `validate grid` of the compiled `catalog/dist/catalog.css` (Tailwind output + `tokens.css`) and of every density step (`.ui8px/extract/density.css`): **8px in layout scope, 4px only in the `controls` scope (the badge)**; `validate patterns` (report), `validate aria`. Policy: `extends: "ui8kit"` + local deltas (`.ui8px/policy`). Gate `max: 0`, blocking `UI8PX001`, `UI8PX002`, `UI8PX003`, `UI8PX005`, `GRID` |
| `bun run test:node` | Palette WCAG, density 8+4, CSS/JSON export; registry = generated items; variants layout-only; places ↔ model paths; field budget 5–10; saved instances valid, issues by pointer; a saved page is valid page-spec v2; one source (classes.json = classes.ts = theme padding scale) |
| `bun run typecheck` | TS of apps, packages, scripts |
| `bun run test` (vitest) | Every item × variant as a wireframe: every place of the contract is a shape with `data-place` / `data-field`, no words / images / links, padding presets, team width; roles and tokens. `vitest.config.ts` pins `resolve.conditions: ["browser"]` and exact-match aliases |

Kit sources are not extracted: control recipes (`size-3`, `pr-2`) would trip layout 8+4.

## Contract gaps

- `@ui8kit/contract` Codex v0.4 / `codex:validate` is not wired here; it runs in codegen-x, where the models and organisms are generated. The page-spec v2 schemas are (devDependency pinned to a ui8kit/contract commit: the published 0.3.0 has no `page-spec*.schema.json`). `packages/blocks/src/content/en.ts` holds only the app's interface text.
- `codegen-x/ui8kit` `packages/tooling` and `packages/ui-gates` are private and not copied. `check-blocks.ts` is the local structural stand-in.
- Official `npx ui8kit@3` loads `@ui8kit/registry` from npm via CDN (unpkg → jsDelivr). Retry with `--retry` / `--registry-url`; do not copy primitives by hand (`docs/kit.md`).
- `ui8px` is a devDependency from npm (`ui8px@^0.3.0`, published with provenance); `@ui8kit/contract@^0.4.0` from npm (the page-spec/v2 and block-contract/v1 schemas). `scripts/ui8px.mjs` runs its `dist`. Do not vendor it. Install with `bun install --frozen-lockfile` (`bun.lock` is committed; CI runs Bun 1.2.21 and 1.4.4).

## Do not

- Edit `packages/kit/**` by hand.
- Put Tailwind class strings in hand-written organism `.svelte` files.
- Edit `packages/blocks/src/generated/**` by hand (re-sync from codegen-x instead).
- Add `rounded-lg` / `rounded-md` / `rounded-xl`, shadow utilities (`shadow-*`), gradients, or palette colors. Elevation is a theme token only (`shadow-card` / `shadow-media` → `tokens.css`).
- Put visible words in templates. `aria-label` and field labels come from `content/en.ts`; prototypes take no content.
- Look up places in the DOM to swap shapes for text (a second render path). Bind places directly in the organism.
- Import interactive kit widgets (`Dialog`, `Select`, `Disclosure`, …) into `packages/blocks`. Draw them as rectangles.
- Open a PR for constructor work: commits on `main` as **Grok Bot** `<grokbot@users.noreply.github.com>`.

## Add a block

See `docs/adding-a-block.md`. Short path: author the model, organism and block spec in codegen-x/ui8kit (`line: "simple"`) → push → `bun run sync:codegen -- --update <commit>` → `bun run verify` (writes the block's `catalog/snapshots/<item>.snap.html`; commit it with the sync). No hand registration: tests iterate `BLOCKS` with model-built fixtures (`src/manifest/fixtures.ts`); never name a block id in a test.

Do not fork a block because the image moved or the column count changed. Do not hide a filled field in a variant. Do not add a schema per variant. Keep the model inside 5–10 fields.
