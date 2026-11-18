# Adding a block

This repo is a visual prototype constructor. Each organism is a wireframe of
placeholder shapes, plus a typed **manifest** of its slots. The library grows
so later we can unify typical fields for a real site constructor.

Follow `.cursor/skills/ui8kit-new-block`, adapted here (no Codex records yet).

Directory name is the block `id` (`hero-split`, `features-team`).

## 1. Dictionary

Add `aria-label` (and any CTA name) to `packages/blocks/src/content/en.ts`.
Templates must not contain letters.

## 2. Manifest

Create `packages/blocks/src/<id>/<id>.block.ts` next to the organism:

```ts
import { ui } from "../content/en";
import type { BlockManifest } from "../manifest/types";

export const heroSplit: BlockManifest = {
  id: "hero-split",
  category: "hero",
  label: ui.heroSplit.label,
  slots: [
    { id: "heading", kind: "heading", count: 1 },
    { id: "lines", kind: "text-line", count: 2 },
    { id: "cta", kind: "cta", count: 1 },
    { id: "media", kind: "media", count: 1 },
  ],
  variants: [{ id: "default" }],
};
```

- `id` equals the directory name.
- `category` is one of `hero`, `features`, `team`, `cta`, `pricing`, `content`,
  `media`, `nav`, `footer`, `form`, `social`.
- Each slot has `id`, `kind`, and `count` (a number, or `{ min, max, default }`).
- Shape kinds: `heading`, `text-line`, `avatar`, `cta`, `media`, `dot`.
  `dot` is a small avatar (`[data-shape=avatar]`).
- Repeating groups use `kind: "item"` and nested `fields` (e.g. `avatar`,
  `title`, `lines` per member). Flattened counts multiply by the item default.
- `variants` are optional prop overlays the organism already accepts.

Register it:

1. Import the manifest into `packages/blocks/src/manifest/registry.ts` and
   append it to `BLOCKS`.
2. Map `id` → component in `packages/blocks/src/catalog.ts`.
3. Re-export the component from `packages/blocks/src/index.ts` if it is new.
4. Add `src/<id>` to `packages/blocks/package.json` → `ui8kit.blockRoot`.

The gallery in `apps/blocks` lists blocks by category from the registry.
A single-block preview is `#/block/<id>` (theme panel + light/dark frames).
Do not hardcode organisms in the app.

## 3. Test first

Create `packages/blocks/src/<id>/<Name>.test.ts`:

- named `region` (section + `aria-label`)
- counts of `[data-shape=…]`
- token classes present (`bg-muted`, `rounded`, `rounded-full`, …)
- `textContent` with whitespace stripped is `""`

The shared test in `packages/blocks/src/manifest/render.test.ts` already
asserts that flattened manifest slot counts match the default render.
`packages/blocks/src/manifest/registry.node.test.ts` asserts every organism
directory has a `*.block.ts` registered under that `id`.

## 4. Markup

One file, one `Block tag="section"` with `aria-label={label}`.

Inside, only:

- `Container`, `Stack`, `Group`, `Grid` (`tag`, `gap`, `align`, `justify`, `cols`, `py`)
- `TextLine`, `Heading`, `CtaShape`, `Media`, `Dot`, `Avatar`

No `class="…"` on the organism. If a shell is missing a prop, add a map entry in
`classes.ts` and a prop on the shell — do not leak utilities into the block file.

Repeated landmarks go in their own file. `{#each}` may wrap shapes, never `Block`.

Default rendered shape counts **must** match `shapeCounts(manifest.slots)`.

## 5. Field summary

```sh
bun run fields:summary
```

Rewrites `docs/fields.json` and `docs/fields.md`: which kinds and field paths
repeat across blocks. Commit the generated files. `bun run verify` regenerates
them.

## 6. Checks

```sh
bun run verify
```

`check-blocks` must print `raw-utilities …: 0` for the new file, require the
sibling manifest, and keep `blockRoot` in sync. ui8px extract picks up new
strings from `classes.ts` only.
