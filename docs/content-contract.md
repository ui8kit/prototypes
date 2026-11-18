# Content contract

Principle, taken from the site constructor in [buildytech/chat](https://github.com/buildytech/chat):
**simple content, interchangeable variants, full rendering of the contract.**

The manifest next to each organism (`*.block.ts`) **is** that contract. It is not a sketch of Tailwind classes.

## Simple content

One schema per block. Fields are named for what a real constructor would bind:

```ts
content: [
  { id: "title", kind: "title", count: 1 },
  { id: "description", kind: "description", count: 2 },
  { id: "image", kind: "image", count: 1 },
  { id: "actionLabel", kind: "actionLabel", count: 1 },
  { id: "actionHref", kind: "actionHref", count: 1 },
]
```

Repeated content is a **typed array of records**. The record has a name (`teamMember`). Later, price and duration are different record types with their own fields — never a universal `item` bag.

Cardinality (`count`, or `{ min, max, default }`) is content, not layout. Switching a variant must not change how many records are filled.

## Interchangeable variants

Layout differences are variants of the **same** block, selected with a `variant` prop:

| Block | Variants |
| --- | --- |
| `hero-split` | `media-left`, `media-right` (default), `media-top` |
| `features-team` | `columns-2`, `columns-3` (default), `columns-4` |

A variant:

- never adds required fields
- never changes field types
- never drops or transforms content
- stores only `layout` axes (media side, column count)

Presentation `{#if}` stays inside the view. It must not become an inter-field dependency (no “if media-top then hide the CTA”).

Do not split `hero-split` into three blocks, and do not make column count a second organism.

## Full rendering

Schema validity is not enough. Every filled field must have a DOM rendering in **every** variant.

Organisms mark contract slots with `data-field` (space-separated when one node renders two fields, e.g. the CTA is `actionLabel actionHref`). Completeness tests in `packages/blocks/src/manifest/render.test.ts` render each block × each variant and assert `[data-field~=path]` counts from `fieldRenderCounts`.

`bun run fields:summary` lists content kinds, paths, and record types — not layout variants as if they were fields.
