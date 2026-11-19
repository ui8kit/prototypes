# 0002. `align` is a block setting

- Status: accepted (UPC-6 plan), implemented (UPC-6 Stage C: codegen-x `a513d18`, ui8px-cli `7a6a7d1` / `05f4a3e`, this repo).

## Context

Hero and team blocks need start / centered / end compositions. As a variant axis, alignment would multiply every
block's variants (each layout × each alignment) and the catalog feed with it, though it changes no structure, only the
cross-axis alignment of one stack and the text alignment of its bars. Physical `text-left` / `text-right` also break in
right-to-left pages.

## Decision

- `align` is a setting next to `level` / `padding` (in `props`, ADR 0001): `start` | `center` | `end`, default `start`,
  one value per block.
- It renders with logical classes only: `items-start|center|end` on the block's content stack (team: the head, placed with `self-*`, and each member; the
  outer stack stays `items-stretch` so the grid keeps the full width),
  `text-start|center|end` on the text shapes (`ShapeText` takes an `align` prop). `start` / `end` follow `dir`.
- ui8px denies `text-left` / `text-right` with the suggestion `text-start` / `text-end`.
- The values are codegen-x `TEXT_ALIGN` / `ALIGN` in `generated/classes.json` (one source).
- A variant may set its own default (UPC-7): the centred composition starts centred. Today only HeroSimple `mediaTop`
  (the wide picture on top, the copy under it) has `align: "center"`; every other variant starts at `start`. It is the
  variant's `props` in codegen-x (`blocks-simple.ts`), `variants[].settings` in the contract, `variantSettings()` here;
  a saved block's `props.align` overrides it. align stays a setting: the feed does not grow.
- The Theme panel has a writing direction (LTR / RTL, `theme.direction`, saved with the theme) that sets `dir` on the
  feed, so start / end can be checked in both directions.
- Tests per value in the wireframes and in every clean runtime, a `dir="rtl"` DOM check and axe.

## Consequences

- Variants stay layout-only (media side, columns, surface); the feed does not grow.
- The registry's clean blocks gain the same prop; the registry is repacked from ui8kit/site when they change.
