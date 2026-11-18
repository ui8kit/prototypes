# Content contract

A block type (item) is a generated organism plus a generated **contract** over a **content model**. Both come from
codegen-x/ui8kit (`packages/compose-gen/specs/models`, `packages/prototypes`), are synced into
`packages/blocks/src/generated` by `scripts/sync-codegen.ts` (pinned by `codegen.lock.json`, sha256 per file) and are
published on the registry:

| What | Here | Registry |
| --- | --- | --- |
| Content model (JSON Schema 2020-12, TS type, `validate()`) | `src/generated/models/<model>.schema.json`, `<model>.ts` | `https://registry.buildy.tw/models/<model>.schema.json` |
| Block contract (axes, variants, settings, modes, places) | `src/generated/contracts/<item>/<n>.json`, `contracts/v0.json` | `https://registry.buildy.tw/contracts/<item>/<n>.json` |
| Organism (Svelte 5) | `src/generated/svelte/blocks/<item>.svelte` | `https://registry.buildy.tw/svelte/blocks/<item>.json` (`meta.model`, `meta.contract`) |

Schemas grow with **content models**, not variants: every hero layout shares `hero@1`. A breaking model change is a new
version (`hero@2`).

## Saved block

```ts
{ id: "b1", item: "hero-simple", variant: "mediaEnd", options: { level: 1 }, props: { title: "…", … } }
```

- `item`: the contract's `item`; `variant`: one of its `variants[].id` (layout axes only, never content).
- `options`: the contract's `settings`: `level` (heading level 1–3, default 2; list item titles one level below),
  `padding` (`compact` py-8 lg:py-16, `standard` py-16 lg:py-32 (default), `spacious` py-24 lg:py-40; a setting, not a
  variant axis) and `landmarkLabel` (replaces `aria-labelledby` with `aria-label`).
- `props`: content valid for the model (`validateInstance()`; issues carry JSON pointers such as `/props/members/1/id`).
- `id`: the instance; the heading id is `<id>-title`.

`instanceProps(block, instance, mode)` turns a saved block into the organism's props (variant axes + options + content +
`id` + `mode`); `wireframeProps(block, variant)` gives a catalog tile (axes and an id, no content).

## Models

- `hero@1`: `badge`, `title` (required), `description`, `image`, `imageAlt`, `imageDark`, `actionLabel`, `actionHref`.
  The action is a link (`a[href]`, the `link-button` recipe, `data-slot="button"`) drawn only when both label and href are set; with no `image` a decorative placeholder is drawn
  (empty `alt`).
- `team@1`: `title` (required), `description`, `members` (1–12 `SimpleMember`: `id` (required), `avatar`, `title`
  (required), `description`). Members render as `ul` / `li`.

Field budget: 5–10 model paths per model (a list counts one plus its item fields), checked in
`manifest/registry.node.test.ts`.

## Modes

- `wireframe` (default; the catalog): shapes only (`data-shape`), no words, no links, no content images, no labelled
  landmark; lists draw `wireframe.items` (3) placeholders.
- `page` (builder preview, `BlockView mode="page"`): the same composition with real content; each place carries
  `data-place` (place id) and `data-field` (concrete JSON pointers, e.g. `/members/1/title`, from `bind()`). Empty
  optional values render nothing.

Without the builder attributes, page mode renders the same DOM as the clean block of the kit (parity test in codegen-x
`packages/prototypes`).

## Tests

`manifest/render.test.ts` (every item × variant: places bound, values drawn, cleared values gone, wireframe geometry,
level, landmark label, member swap, variant switch) and `manifest/registry.node.test.ts` (registry = generated items,
layout-only variants, places ↔ model paths, field budget, saved instances).
