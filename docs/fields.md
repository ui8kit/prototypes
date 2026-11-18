# Field summary

Generated from `*.block.ts` content contracts by `scripts/fields-summary.mjs`.
Scoreboard for later unification: which **content** fields and record types repeat.
Variants are layout-only (same schema, full rendering in every variant). See
`docs/content-contract.md`.

Blocks: **2**. Content kinds in two or more blocks: `title`, `description`.
Shared field paths: `title`.
Shared record types: _none yet_.

## Content kinds

Named fields of the contract (not layout). `totalDefault` is the sum of default
counts across the library.

| Kind | Blocks | Ids | totalDefault |
| --- | --- | --- | --- |
| title | 2 | features-team, hero-split | 3 |
| description | 2 | features-team, hero-split | 4 |
| image | 1 | hero-split | 1 |
| actionLabel | 1 | hero-split | 1 |
| actionHref | 1 | hero-split | 1 |
| avatar | 1 | features-team | 1 |
| record | 1 | features-team | 3 |

## Field paths

Dot-paths as declared on each manifest (`members.avatar` is a field of the
`teamMember` record). Different entities (later: price vs duration) stay on
separate record types, not a universal item.

| Path | Kind | Blocks | Ids | Cardinality |
| --- | --- | --- | --- | --- |
| actionHref | actionHref | 1 | hero-split | 1 |
| actionLabel | actionLabel | 1 | hero-split | 1 |
| description | description | 1 | hero-split | 2 |
| image | image | 1 | hero-split | 1 |
| members | record (teamMember) | 1 | features-team | 1–6 (default 3) |
| members.avatar | avatar | 1 | features-team | 1 |
| members.description | description | 1 | features-team | 2 |
| members.title | title | 1 | features-team | 1 |
| title | title | 2 | hero-split, features-team | 1 |

## Record types

| Type | Blocks | Ids | Path | Fields |
| --- | --- | --- | --- | --- |
| teamMember | 1 | features-team | members | avatar, title, description |

## Per block

### `hero-split`

- Category: `hero`
- Label: Hero
- Variants (layout only): `media-left`, `media-right` (default), `media-top`
- Layout axes: media=left; media=right; media=top
- Flattened shapes: heading × 1, text-line × 2, cta × 1, media × 1

- `title` (title, 1)
- `description` (description, 2)
- `image` (image, 1)
- `actionLabel` (actionLabel, 1)
- `actionHref` (actionHref, 1)

### `features-team`

- Category: `team`
- Label: Team
- Variants (layout only): `columns-2`, `columns-3` (default), `columns-4`
- Layout axes: columns=2; columns=3; columns=4
- Flattened shapes: heading × 4, text-line × 6, avatar × 3

- `title` (title, 1)
- `members` (record, record teamMember, 1–6 (default 3))
- `members.avatar` (avatar, 1)
- `members.title` (title, 1)
- `members.description` (description, 2)
