# @ui8kit/theme

Token model, palettes, density, and CSS/JSON export for the prototypes constructor.

Ported from [codegen-x/ui8kit](https://github.com/codegen-x/ui8kit) `packages/theme-model` and `packages/taste-data` (MIT, CodeGen-X 2026). **Fonts and typography are excluded.**

## What it generates

- **Palette:** 9 harmonies, 16 presets, WCAG AA/AAA, tinted neutrals from the skin lightness table, shadcn colour tokens as `hsl(H S% L%)` for light and dark.
- **Skins:** 16 named skins. Without a custom palette, OKLab swatches become HSL for primary/accent and the neutrals stay the skin's lightness.
- **Radius:** `0 | 4 | 8 | 12 | 16` px, written to `--radius`.
- **Density:** `compact | default | comfortable`. Emits `--theme-*` px values on the 8+4 grid. Does not change Tailwind `--spacing`.
- **Export:** JSON (`prototypes-theme` v1) and a CSS file (`:root` + `.dark` + `[data-density]`).

See `docs/theme.md` in the repo root for the token-role table and how `apps/stock` maps onto this package.
