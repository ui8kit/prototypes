# Adding a block

Blocks are not written in this repo. A new block (or a variant) is authored in codegen-x/ui8kit and synced here:

1. codegen-x/ui8kit: add or reuse a content model in `packages/compose-gen/specs/models`, author the organism and block
   spec (`line: "simple"`, `model: "<id>@<n>"`, layout-only variants), run `bun run build` and `bun run check`;
   `packages/prototypes` regenerates `out/` (svelte, contracts, models, manifest with sha256 per file). Push to `main`.
2. Here: `bun run sync:codegen -- --update <commit>` (sparse clone of `packages/prototypes/out` at that commit, sha256
   verified, copied into `packages/blocks/src/generated`, `codegen.lock.json` updated).
3. Register the item: add its contract to `BLOCKS` (`src/manifest/registry.ts`, with a catalog category), its model to
   `MODELS`, and its organism to `CATALOG` (`src/catalog.ts`).
4. `bun run verify` (sync check, check-blocks, ui8px gate, node tests, tsc, vitest).

Do not edit `packages/blocks/src/generated` by hand (`--check` fails on any byte). Do not fork a block because the image
moved or the column count changed: that is a variant. Keep each model inside 5–10 fields.
