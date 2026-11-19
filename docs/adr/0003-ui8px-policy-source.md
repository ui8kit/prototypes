# 0003. ui8px policy: one preset, local deltas

- Status: accepted (UPC-6 Stage A).

## Context

Each repo carried a full copy of the ui8px policy (`allowed`, `denied`, `scopes`, `groups`, `patterns`): the 8+4 grid,
the utility list, the denied classes. The copies drifted, and the gate linted a regex extract of source files instead of
what the blocks draw.

## Decision

- The UI8Kit policy is the `ui8kit` preset of ui8px-cli (`src/policy/presets/ui8kit.ts`): layout spacing = even
  Tailwind steps (8px multiples), control = 4px steps, the hairlines (`gap-px`, `p-px`, `w-px`, `h-px`), logical
  utilities, the denied list and the error codes UI8PX001–005 + GRID (ui8px-cli README).
- A repo's `.ui8px/policy/*.json` is `{ "extends": "ui8kit", … }` plus only its local deltas (here: `aspect-3/4`, the
  denied radius / shadow utilities, the `controls` and `tailwind-preflight` selector scopes, the layout file scope).
- The gate lints the rendered DOM snapshot and the imported class tables and runs `validate grid` on the compiled CSS
  (`scripts/ui8px-gate.mjs`); blocking: UI8PX001, 002, 003, 005, GRID, max 0 (`.ui8px/gate.json`).
- ui8px is consumed from a pinned ui8kit/ui8px-cli commit until 0.3.0 is on npm.

## Consequences

- A rule change is made once in ui8px-cli, released, and picked up by moving the pin.
- codegen-x/ui8kit still carries its own full policy; migrating it to `extends: "ui8kit"` is follow-up work.
