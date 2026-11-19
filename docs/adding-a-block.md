# Adding a block

Blocks are not written in this repo. A new block (or a variant) is authored in codegen-x/ui8kit and synced here; nothing
in `prototypes` names a block by hand, so **a new block needs no manual code edit here**.

1. codegen-x/ui8kit: add or reuse a content model in `packages/compose-gen/specs/models`, author the organism and block
   spec (`line: "simple"`, `model: "<id>@<n>"`, layout-only variants), run `bun run build` and `bun run check`;
   `packages/prototypes` regenerates `out/`: svelte, contracts, models, and the registries `registry.ts` (`CONTRACTS`,
   `CATEGORIES`, `MODELS`), `catalog.ts` (`CATALOG`, each wireframe by organism name) and `models/index.ts` (content
   types), with sha256 per file in `manifest.json`. Push to `main` and run its CI (`gh workflow run ci`).
2. Here: `bun run sync:codegen -- --update <commit>` (sparse clone of `packages/prototypes/out` at that commit, sha256
   verified, copied into `packages/blocks/src/generated`, `codegen.lock.json` updated). `BLOCKS`, `MODELS`, `CATALOG`
   and the package exports (`HeroSimple`, `HeroContent`, …) pick the block up through the thin re-exports
   (`src/manifest/registry.ts`, `src/catalog.ts`, `src/index.ts`).
3. `bun run verify`. The tests are data-driven (they iterate `BLOCKS` and build content from each model,
   `src/manifest/fixtures.ts`), so they cover the block as is. The first local `bun run test` writes the new block's DOM
   snapshot `packages/blocks/catalog/snapshots/<item>.snap.html`: review it and commit it with the sync (in CI a missing
   snapshot fails, and a snapshot of a removed block fails as stale).

Manual steps in this repo: **0 code edits**; one command (`sync:codegen`) and one commit (sync + snapshot). The catalog
category is the id of the block's model (`hero@1` → `hero`) and must be one of `BLOCK_CATEGORIES`
(`src/manifest/types.ts`); a new kind of section adds its id there (that is the only hand edit, and only for a new
category).

Do not edit `packages/blocks/src/generated` by hand (`--check` fails on any byte). Do not fork a block because the image
moved or the column count changed: that is a variant. Keep each model inside 5–10 fields.
