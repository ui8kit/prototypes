# 0001. Block settings live in `props`

- Status: accepted (owner, UPC-5 review: «Настройки в props, contract не меняем»), implemented in UPC-6 Stage B.
- Scope: ui8kit/prototypes `packages/blocks/src/manifest`, the gallery, docs.

## Context

A saved block was `{ id, item, variant, options?, props }`: `options` held the contract `settings` (`level`, `padding`,
`landmarkLabel`), `props` the content. `@ui8kit/contract` page-spec v2 (the page format of BuildY and the registry)
defines a block as `{ id, item, variant, props }` with `additionalProperties: false`: `props` are exactly the props of
the item's component, and the generated organisms already take `level` / `padding` / `landmarkLabel` as props. A page
saved here with `options` was not a valid page-spec v2 document.

## Decision

- Settings are props. A saved block is `{ id, item, variant, props }`; a `props` key that the contract lists under
  `settings` (minus `id`, which is the block's own `id`) is a setting, every other key is content.
- The contract does not change (no `options` / `settings` field is added to page-spec).
- `splitProps(block, props)` separates them; `validateInstance()` checks a setting's value at `/props/<setting>`
  (`settingValue`) and validates the rest against the content model (an unknown key is the model's `unknown field`).
- `wireframeProps(block, variant, props)` reads `padding` from the props.
- `BlockOptions` / `options` and the codes `unknownOption` / `optionValue` are removed (no compatibility shim: nothing
  stored saved blocks yet).
- `manifest/page-spec.node.test.ts` validates a saved page against the published `page-spec-v2.schema.json` and
  checks that the old `options` field is rejected.

## Consequences

- A setting name and a content field name must never collide; codegen-x owns both lists (`SETTINGS` in compose-gen
  model, the content models) and the contract keeps them apart.
- The schema comes from `@ui8kit/contract` pinned to a ui8kit/contract commit: the npm release 0.3.0 does not ship
  `page-spec*.schema.json`. Switch to the npm range once a release ships them.
