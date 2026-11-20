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
{ id: "b1", item: "hero-simple", variant: "mediaEnd", props: { title: "…", …, level: 1, padding: "compact" } }
```

- `item`: the contract's `item`; `variant`: one of its `variants[].id` (layout axes only, never content).
This is a block of `@ui8kit/contract` page-spec v2 (`{ id, item, variant, props }`, no other key); a saved page is
`{ version: 2, slug, title, locale, blocks }` and `manifest/page-spec.node.test.ts` validates one with the published schema.

- `props`: the content, valid for the model, plus the contract's `settings` (`docs/adr/0001-settings-in-props.md`):
  `level` (heading level 1–3, default 2; list item titles one level below), `padding` (`compact` py-8 lg:py-16,
  `standard` py-16 lg:py-32 (default), `spacious` py-24 lg:py-40; a setting, not a variant axis), `align` (`start` (default; team-simple: `center`) | `center` | `end`, logical
  `items-*` / `text-*`, follows `dir`; a variant may carry its own default in `variants[].settings`, hero-simple
  `mediaTop` is `center`; `variantSettings(block, variant)` gives the start values; `docs/adr/0002-align-as-setting.md`) and `landmarkLabel`
  (replaces `aria-labelledby` with `aria-label`). `splitProps()` tells them apart; `validateInstance()` checks a
  setting's value at `/props/<setting>` and the rest against the model (issues carry JSON pointers such as
  `/props/members/1/id`; an unknown key is the model's `unknown field`).
- `id`: the instance; the heading id is `<id>-title`.

`wireframeProps(block, variant, props)` gives the props of a wireframe (the variant axes, `padding` and `align`; no content).
Prototypes never render `props`: a saved block is data the builder validates (`validateInstance()`) and hands to the
real block from the registry.

## Models

- `hero@1`: `badge`, `title` (required), `description`, `image`, `imageAlt`, `imageDark`, `actionLabel`, `actionHref`, `secondaryActionLabel`, `secondaryActionHref` (10 of 10: the second action is the secondary link, drawn only with a label and an address).
  In the clean block the action is a link (`a[href]`) drawn only when both label and href are set.
- `team@1`: `title` (required), `description`, `members` (1–12 `SimpleMember`: `id` (required), `avatar`, `title`
  (required), `description`). Members render as `ul` / `li`.

Field budget: 5–10 model paths per model (a list counts one plus its item fields), checked in
`manifest/registry.node.test.ts`.

## Mode

`wireframe` is the only mode: shapes only (`data-shape`), no words, no links, no images, no labelled landmark; lists
draw one placeholder per column of the variant (`wireItems`: the one whole-number axis, team-simple `cols`: cols2 2, cols3 3,
cols4 4, cards3 3; no such axis: `wireframe.items`, 3, which is also the default variant's count). Each shape carries `data-place` (place id) and `data-field` (concrete JSON
pointers, e.g. `/members/1/title`, as `bind()` gives them) for the builder's inspector. That every place of a contract
has its shape, and the clean blocks themselves (DOM, the action link, the team width), are tested in codegen-x
`packages/prototypes`.

## Tests

`manifest/wireframe.test.ts` (every item × variant: every place a shape with its binding, no words / images / links,
padding presets, team width) and `manifest/registry.node.test.ts` (registry = generated items,
layout-only variants, places ↔ model paths, field budget, saved instances).
