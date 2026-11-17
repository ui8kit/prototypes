# Adding a block

Follow `.cursor/skills/ui8kit-new-block`, adapted to this constructor (no Codex records yet).

## 1. Dictionary

Add `aria-label` (and any CTA name) to `packages/blocks/src/content/en.ts`. Templates must not contain letters.

## 2. Test first

Create `packages/blocks/src/<name>/<Name>.test.ts`:

- named `region` (section + `aria-label`)
- counts of `[data-shape=…]`
- token classes present (`bg-muted`, `rounded`, `rounded-full`, …)
- `textContent` with whitespace stripped is `""`

## 3. Markup

One file, one `Block tag="section"` with `aria-label={label}`.

Inside, only:

- `Container`, `Stack`, `Group`, `Grid` (`tag`, `gap`, `align`, `justify`, `cols`, `py`)
- `TextLine`, `Heading`, `CtaShape`, `Media`, `Dot`, `Avatar`

No `class="…"` on the organism. If a shell is missing a prop, add a map entry in `classes.ts` and a prop on the shell — do not leak utilities into the block file.

Repeated landmarks go in their own file. `{#each}` may wrap shapes, never `Block`.

## 4. Checks

```sh
bun run verify
```

`check-blocks` must print `raw-utilities …: 0` for the new file. ui8px extract picks up new strings from `classes.ts` only.
