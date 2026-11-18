# Field summary

Generated from `*.block.ts` content contracts by `scripts/fields-summary.mjs`.
Scoreboard for later unification: which **content** fields and record types repeat.
Variants are layout-only (same schema, full rendering in every variant). See
`docs/content-contract.md`.

Blocks: **2**. Content kinds in two or more blocks: `title`, `description`.
Shared field paths: `description`, `title`.
Shared record types: _none yet_.

## Field budget

Each contract is **5–10** fields. Counting rule:

- Every declared path counts as 1 (`title`, `members.avatar`, …).
- Cardinality does not multiply (`description` with `count: 2` is still one field).
- A record (array) counts as 1, plus each field of its item type (recursive).
- `actionLabel` and `actionHref` are two fields even when they render on one CTA.
- Layout variants do not count.

| Block | Fields | Budget | Paths |
| --- | --- | --- | --- |
| hero-split | 6 | 5–10 | `badge`, `title`, `description`, `image`, `actionLabel`, `actionHref` |
| features-team | 6 | 5–10 | `title`, `description`, `members`, `members.avatar`, `members.title`, `members.description` |

## Content kinds

Named fields of the contract (not layout). `totalDefault` is the sum of default
counts across the library.

| Kind | Blocks | Ids | totalDefault |
| --- | --- | --- | --- |
| badge | 1 | hero-split | 1 |
| title | 2 | features-team, hero-split | 3 |
| description | 2 | features-team, hero-split | 6 |
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
| badge | badge | 1 | hero-split | 1 |
| description | description | 2 | hero-split, features-team | 2 |
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
- Field budget: 6 / 10
- Variants (layout only): `media-left`, `media-right` (default), `media-top`
- Layout axes: media=left; media=right; media=top
- Flattened shapes: badge × 1, heading × 1, text-line × 2, cta × 1, media × 1

- `badge` (badge, 1)
- `title` (title, 1)
- `description` (description, 2)
- `image` (image, 1)
- `actionLabel` (actionLabel, 1)
- `actionHref` (actionHref, 1)

### `features-team`

- Category: `team`
- Label: Team
- Field budget: 6 / 10
- Variants (layout only): `columns-2`, `columns-3` (default), `columns-4`, `cards-3`
- Layout axes: columns=2; columns=3; columns=4; columns=3, cards=true
- Flattened shapes: heading × 4, text-line × 8, avatar × 3

- `title` (title, 1)
- `description` (description, 2)
- `members` (record, record teamMember, 1–6 (default 3))
- `members.avatar` (avatar, 1)
- `members.title` (title, 1)
- `members.description` (description, 2)
