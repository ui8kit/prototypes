# Content contract

Principle (site constructor): **simple content, interchangeable variants, full rendering**, and **one composition** for the
wireframe feed and the finished page. Everything below is machine-readable: `packages/blocks/contract.json` and
`packages/blocks/schemas/*.schema.json` are generated from the sources by `bun run contract`, and `bun run verify` fails when
they or `docs/fields.*` are stale.

## The three objects

| Object | Where | What |
| --- | --- | --- |
| Content model | `packages/blocks/src/models/<id>.ts` | Value schema of `props` (`hero@1`, `team@1`). Plain TS (`defineModel`), shared by every variant and by every block with the same content. Gives the TS type (`ContentOf`), `validate()` and JSON Schema 2020-12 (`toJsonSchema`). |
| Block manifest | `packages/blocks/src/<item>/<item>.block.ts` | Stable item id, category, label, `model`, `places` (field → place binding), `variants` (layout only). |
| Saved block | the builder's page | `{ id, item, variant, props }`: `id` = instance, `item` = manifest id, `variant` = a variant id, `props` = content valid for the model. `validateInstance()` checks all three. |

Schemas grow with **content models**, not variants: 250 hero layouts share one `hero@1`. A breaking model change is a new
version (`hero@2`) with its own schema file (`urn:ui8kit:content:hero:2`).

## Content model

Value types (`src/model/types.ts`):

| Type | Value | Notes |
| --- | --- | --- |
| `text` | string, `maxLength` | one line (badge, title, label) |
| `longText` | string, `maxLength` | one paragraph. **One value**, even when the wireframe draws two or three bars |
| `url` | string | link target; `javascript:` / `vbscript:` / `data:` rejected (validate + schema pattern) |
| `image` | `{ src, alt, srcDark? }` | one `src` for both themes, optional dark override; `alt: ""` = decorative |
| `list` | array of a **named** record (`teamMember`), `minItems` / `maxItems` | order is content; cardinality is content, not layout |

Rules: blank strings count as empty; `null` is a type error; unknown keys are rejected (`additionalProperties: false`);
`required` means a filled value. Field labels are dictionary keys (`ui.fields.<key>` in `content/en.ts`) and become the
schema `title`.

**Field budget 5–10.** Every model path counts once (`modelPaths`): a list counts 1 plus each item field; bar counts and
cardinality never multiply. `hero@1` = 6, `team@1` = 6.

```ts
export const heroModel = defineModel({
  id: "hero",
  version: 1,
  fields: {
    badge: { type: "text", maxLength: 40, label: "badge" },
    title: { type: "text", maxLength: 120, required: true, label: "title" },
    description: { type: "longText", maxLength: 400, label: "description" },
    image: { type: "image", label: "image" },
    actionLabel: { type: "text", maxLength: 40, label: "actionLabel" },
    actionHref: { type: "url", label: "actionHref" },
  },
});
```

## Places: field → place binding

A **place** is one spot of the composition. It binds one or more JSON-pointer templates (RFC 6901, `*` = list index):

| Case | Example | Wireframe | Page |
| --- | --- | --- | --- |
| one field → several shapes | `description` → `/description` | 2 bars (the variant's design) | one `<p>` |
| several fields → one element | `action` → `/actionLabel` + `/actionHref` | CTA bar | `<a href>` when both are filled; label alone → plain text; otherwise nothing |
| a place repeated in a list | `member.title` → `/members/*/title`, `each: "/members"` | 3 placeholders (`wireframe: 3`) | one per array item, in order |

Every model path has a place in **every** variant and every place points at existing paths (`registry.node.test.ts`).

### DOM binding attributes

| Attribute | Value | Purpose |
| --- | --- | --- |
| `data-place` | place id (`member.title`) | which spot this is |
| `data-field` | space-separated **concrete** pointers (`/members/1/title`, `/actionLabel /actionHref`) | which values it shows; select with `[data-field~="/members/1/title"]` |
| `data-slot`, `data-role`, `data-shape` | theme hooks | **styling only**, never bindings (`tokens.css`) |

Pointers are resolved from the render index (`bind(manifest, "member.title", i)`), so after a reorder a click on a member
maps to its new position. The inspector reads the pointer from the clicked element and edits `props` with `setAt`
(`src/model/pointer.ts`: `getAt`, `setAt`, `swapAt`, immutable).

Decision: bindings are **direct and typed in Svelte** (organism → place component with the value and the bound
attributes). There is no DOM lookup by `data-field` that swaps rectangles for text: that would be a second render path.

## Modes: one composition

Each organism takes `{ variant?, mode?, content? }`; the builder passes `props` as `content`.

- `mode="wireframe"` (default; the feed): draws every place as shapes, ignores `content`, list places draw
  `wireframe` placeholders. Shapes are static `aria-hidden="true"`; there is no text, no link, no content image.
- `mode="page"`: draws real elements from `content` through the same places: badge `<span>`, title `<h2>` (block) /
  `<h3>` (list item), text `<p>`, action `<a href>` (kit `Button`), media `<figure>` + kit `Image` with `src` / `alt`.
  Page elements keep `data-role` / `data-slot` for the theme, never `data-shape`.

Empty values on the page: an empty field renders **no element**; a wrapper with nothing inside is dropped; when the media
or the whole copy column of a hero is empty the other side takes the full row (no grid); a team without members has no
grid; a member with no filled value is skipped (the others keep their own index paths).

### Images and dark mode

`{ src, srcDark? }`. Without `srcDark`: one `Image`. With it: two `Image` elements toggled by `dark:hidden` /
`hidden dark:block` (the dark one `loading="lazy"`). Decision: not `<picture media="(prefers-color-scheme)">`, because
the app's dark mode is the `dark` class on `<html>`, which media queries cannot see. The DOM is the same in light and dark.

## Interchangeable variants

A variant stores only `layout` axes (media side, column count, cards). It never adds required fields, changes types,
drops content, or carries props. One `props` object renders fully in every variant of its item; switching the variant
never needs a refill.

| Block | Model | Variants |
| --- | --- | --- |
| `hero-split` | `hero@1` | `media-left`, `media-right` (default), `media-top` |
| `features-team` | `team@1` | `columns-2`, `columns-3` (default), `columns-4`, `cards-3` |

## Proof (tests)

`packages/blocks/src/manifest/render.test.ts` (every item × variant, same object), `pilot.test.ts` (edit by pointer,
switch variant, swap members), `registry.node.test.ts` (bindings, budget, instances), `model/model.node.test.ts`
(pointers, validation, JSON Schema agreement). Summary: [fields.md](./fields.md).
