# Adding a block

This repo is a visual prototype constructor. Each organism is a wireframe of
placeholder shapes, plus a typed **content contract** (the manifest). The
library grows so later we can unify typical fields for a real site constructor.

Follow `.cursor/skills/ui8kit-new-block`, adapted here (no Codex records yet).
Contract rules: `docs/content-contract.md`.

Directory name is the block `id` (`hero-split`, `features-team`).

## 1. Dictionary

Add `aria-label` (and any CTA name / href) to `packages/blocks/src/content/en.ts`.
Templates must not contain letters.

## 2. Manifest = content contract

Create `packages/blocks/src/<id>/<id>.block.ts` next to the organism:

```ts
import { ui } from "../content/en";
import type { BlockManifest } from "../manifest/types";

export const heroSplit: BlockManifest = {
  id: "hero-split",
  category: "hero",
  label: ui.heroSplit.label,
  content: [
    { id: "title", kind: "title", count: 1 },
    { id: "description", kind: "description", count: 2 },
    { id: "image", kind: "image", count: 1 },
    { id: "actionLabel", kind: "actionLabel", count: 1 },
    { id: "actionHref", kind: "actionHref", count: 1 },
  ],
  variants: [
    { id: "media-left", layout: { media: "left" } },
    { id: "media-right", layout: { media: "right" }, default: true },
    { id: "media-top", layout: { media: "top" } },
  ],
};
```

- `id` equals the directory name.
- `category` is one of `hero`, `features`, `team`, `cta`, `pricing`, `content`,
  `media`, `nav`, `footer`, `form`, `social`.
- **One `content` schema.** Named fields (`title`, `description`, `image`,
  `actionLabel`, `actionHref`, `avatar`). Repeating groups are `kind: "record"`
  with a named `record` type (`teamMember`, later `priceTier`) and nested
  fields. Do not invent a universal item.
- **Variants are layout.** Image left/right/top, column count, etc. live under
  `layout`. Exactly one variant is `default: true`. A variant must not add
  required fields, change types, or drop content.
- Mark each rendered slot with `data-field` matching the content path
  (`title`, `members.avatar`). One node may carry two fields
  (`actionLabel actionHref` on the CTA).
- **Field budget 5–10.** Every declared path counts as 1. An array counts as
  one field plus its item fields. Cardinality does not multiply. Tests fail
  above 10 or below 5.

Register it:

1. Import the manifest into `packages/blocks/src/manifest/registry.ts` and
   append it to `BLOCKS`.
2. Map `id` → component in `packages/blocks/src/catalog.ts`.
3. Re-export the component from `packages/blocks/src/index.ts` if it is new.
4. Add `src/<id>` to `packages/blocks/package.json` → `ui8kit.blockRoot`.
5. Add variant labels to `apps/blocks/src/content/gallery.ts` if the ids are new.

The gallery lists blocks by category. A studio preview is `#/block/<id>` or
`#/block/<id>/<variant>` (theme panel + light/dark frames + layout switcher).
Do not hardcode organisms in the app.

## 3. Test first

Create `packages/blocks/src/<id>/<Name>.test.ts`:

- named `region` (section + `aria-label`)
- default variant id on `data-variant`
- counts of `[data-shape=…]` and `[data-field~=…]`
- token classes present (`bg-muted`, `rounded`, `rounded-full`, …)
- `textContent` with whitespace stripped is `""`
- switching variant keeps the same content counts (layout class may change)

The shared tests already:

- flatten default content → `[data-shape]` (`render.test.ts`)
- **completeness:** every block × every variant renders every contract field
- every organism directory has a registered `*.block.ts`; variants are
  layout-only; field budget is 5–10 (`registry.node.test.ts`)

## 4. Markup

One file, one `Block tag="section"` with `aria-label={label}`.

Inside, only rectangles and text bars:

- `Container`, `Stack`, `Group`, `Grid` (`tag`, `gap`, `align`, `justify`, `cols`, `py`)
- `TextLine`, `Heading`, `CtaShape`, `Media`, `Dot`, `Avatar`

Do not import kit `Dialog`, `Select`, `Disclosure`, accordion, tabs, or carousel.
Those patterns are stacks/groups of the shapes above. The only kit control in
`packages/blocks` is `Button` inside `CtaShape`. Media is an `Image` inside a
rectangle. Avatars are squares (`h-N w-N`) with `rounded-full`.

Pass `field="…"` on every shape. Read the active variant with
`resolveVariant(manifest, variant)` and branch **presentation only**.

No `class="…"` on the organism. If a shell is missing a prop, add a map entry in
`classes.ts` and a prop on the shell — do not leak utilities into the block file.

Repeated landmarks go in their own file. `{#each}` may wrap shapes, never `Block`.

Default rendered shape counts **must** match `shapeCounts(manifest.content)`.

## 5. Field summary

```sh
bun run fields:summary
```

Rewrites `docs/fields.json` and `docs/fields.md`: which **content** kinds,
paths, and record types repeat, plus the 5–10 field-budget count per block
(variants are listed as layout, not as fields). Commit the generated files.
`bun run verify` regenerates them.

## 6. Checks

```sh
bun run verify
```

`check-blocks` must print `raw-utilities …: 0` for the new file, require the
sibling manifest, keep `blockRoot` in sync, and reject interactive kit widgets
(accordion, tabs, carousel, Dialog, Select, …). Only `CtaShape` may use `Button`.
ui8px extract picks up new strings from `classes.ts` only.
