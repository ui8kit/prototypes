# Adding a block

A block is a layout of **places** over a **content model**. The same component draws the wireframe (feed) and the page.
Rules: [content-contract.md](./content-contract.md). Directory name = item id (`hero-split`).

## 1. Content model (reuse first)

Reuse an existing model when the content is the same (a new hero layout is a variant or a new item over `hero@1`). A new
model only for new content: `packages/blocks/src/models/<id>.ts` with `defineModel({ id, version: 1, fields })`, add it to
`MODELS` in `models/index.ts`, and add every field `label` key to `ui.fields` in `content/en.ts`. Lists are named records
(`teamMember`), never a universal `item`. Keep 5–10 model paths.

## 2. Dictionary

Region `aria-label` and any other interface text in `packages/blocks/src/content/en.ts`. Content (titles, names, links)
never lives in code; sample content lives in `src/fixtures/samples.ts`.

## 3. Manifest

`packages/blocks/src/<item>/<item>.block.ts`:

```ts
export const heroSplit: BlockManifest<typeof heroModel> = {
  id: "hero-split",
  category: "hero",
  label: ui.heroSplit.label,
  model: heroModel,
  places: [
    { id: "badge", role: "badge", fields: ["/badge"] },
    { id: "title", role: "heading", fields: ["/title"] },
    { id: "description", role: "text", fields: ["/description"] },
    { id: "media", role: "media", fields: ["/image"] },
    { id: "action", role: "action", fields: ["/actionLabel", "/actionHref"] },
  ],
  variants: [
    { id: "media-left", layout: { media: "left" } },
    { id: "media-right", layout: { media: "right" }, default: true },
    { id: "media-top", layout: { media: "top" } },
  ],
};
```

- Every model path needs a place; a list item place has `each: "/members"` and `wireframe: <placeholder count>`.
- Variants are layout only, exactly one `default: true`.

Register: `BLOCKS` in `manifest/registry.ts`, `CATALOG` in `catalog.ts`, export in `index.ts`, `src/<item>` in
`packages/blocks/package.json` → `ui8kit.blockRoot`.

## 4. Organism

One file, one `Block tag="section" aria-label={label} data-variant data-mode`. Props: `{ variant?, mode?, content?, label? }`.

- Draw every place with a place component from `src/places` and spread its binding from the manifest:
  `<HeadingPlace {mode} value={c.title} size="lg" width="3/4" {...bind(heroSplit, "title")} />`.
  In a list: `{...bind(featuresTeam, "member.title", row.index)}`.
- Place components: `BadgePlace`, `HeadingPlace` (h2 / h3 via `level`), `TextPlace` (`bars` = wireframe widths),
  `ActionPlace`, `MediaPlace` (`ratio`), `AvatarPlace`. They draw the shape in the wireframe and the kit element on the page.
- `const c = $derived(mode === "wireframe" ? {} : (content ?? {}))`; wrap groups in `{#if}` so empty wrappers vanish, and
  let the remaining side take the row when a column is empty.
- No kit imports, no class strings, no literal text; `{#each}` may wrap places, never `Block`.

## 5. Tests

The shared tests pick the block up from the registry and fixtures: add filled and minimal content for the new item to
`src/fixtures/samples.ts` (`SAMPLES`). They check, for every variant: each filled value in its place (text, href, src,
alt), cleared optional values leave no element or empty wrapper, the wireframe of the same input is geometry only, and
the place counts. Add block-specific edge cases next to the existing ones in `manifest/render.test.ts`.

## 6. Generate and verify

```sh
bun run contract   # schemas/*.schema.json, contract.json, docs/fields.json, docs/fields.md
bun run verify
```

`check-blocks` rejects raw utilities, bare HTML, literal text, interactive kit outside places (Text in places, Button only
in `ActionPlace`), Image outside `Media.svelte` / `places/ThemedImage.svelte`, and places that do not branch on the mode.
