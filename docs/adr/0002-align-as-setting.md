# 0002. `align` is a block setting

- Status: accepted (UPC-6 plan), implemented in Stage C (codegen-x `packages/prototypes` + this repo).

## Context

Hero and team blocks need start / centered / end compositions. As a variant axis, alignment would multiply every
block's variants (each layout × each alignment) and the catalog feed with it, though it changes no structure, only the
cross-axis alignment of one stack and the text alignment of its bars. Physical `text-left` / `text-right` also break in
right-to-left pages.

## Decision

- `align` is a setting next to `level` / `padding` (in `props`, ADR 0001): `start` | `center` | `end`, default `start`,
  one value per block.
- It renders with logical classes only: `items-start|center|end` on the block's content stack (team: the outer stack),
  `text-start|center|end` on the text shapes (`ShapeText` takes an `align` prop). `start` / `end` follow `dir`.
- ui8px denies `text-left` / `text-right` with the suggestion `text-start` / `text-end`.
- The values are codegen-x `TEXT_ALIGN` / `ALIGN` in `generated/classes.json` (one source).
- Tests per value in the wireframes and in every clean runtime, a `dir="rtl"` DOM check and axe.

## Consequences

- Variants stay layout-only (media side, columns, surface); the feed does not grow.
- The registry's clean blocks gain the same prop; the registry is repacked from ui8kit/site when they change.
