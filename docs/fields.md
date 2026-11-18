# Field summary

Generated from `*.block.ts` manifests by `scripts/fields-summary.mjs`.
This is the scoreboard for later unification: which slots and kinds repeat
across the prototype library.

Blocks: **2**. Kinds in two or more blocks: `heading`, `text-line`.
Shared field paths: `heading`.

## Kinds

How many blocks render each shape (flattened; item groups multiply nested fields).
`totalDefault` is the sum of default counts across the library.

| Kind | Blocks | Ids | totalDefault |
| --- | --- | --- | --- |
| heading | 2 | features-team, hero-split | 5 |
| text-line | 2 | features-team, hero-split | 8 |
| avatar | 1 | features-team | 3 |
| cta | 1 | hero-split | 1 |
| media | 1 | hero-split | 1 |
| item | 1 | features-team | 3 |

## Field paths

Dot-paths as declared on each manifest (`items.avatar` is a field inside the repeating group).

| Path | Kind | Blocks | Ids | Cardinality |
| --- | --- | --- | --- | --- |
| cta | cta | 1 | hero-split | 1 |
| heading | heading | 2 | hero-split, features-team | 1 |
| items | item | 1 | features-team | 1–6 (default 3) |
| items.avatar | avatar | 1 | features-team | 1 |
| items.lines | text-line | 1 | features-team | 2 |
| items.title | heading | 1 | features-team | 1 |
| lines | text-line | 1 | hero-split | 2 |
| media | media | 1 | hero-split | 1 |

## Per block

### `hero-split`

- Category: `hero`
- Label: Hero
- Variants: default
- Flattened shapes: heading × 1, text-line × 2, cta × 1, media × 1

- `heading` (heading, 1)
- `lines` (text-line, 2)
- `cta` (cta, 1)
- `media` (media, 1)

### `features-team`

- Category: `team`
- Label: Team
- Variants: default, pair
- Flattened shapes: heading × 4, text-line × 6, avatar × 3

- `heading` (heading, 1)
- `items` (item, 1–6 (default 3))
- `items.avatar` (avatar, 1)
- `items.title` (heading, 1)
- `items.lines` (text-line, 2)
