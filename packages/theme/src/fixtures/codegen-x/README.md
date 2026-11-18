# codegen-x theme configs

Real `magazine-theme` v2 configs written by codegen-x/ui8kit code: `toConfig(cleanTheme(...))` from
`packages/theme-model/src/global-theme.ts`, run with bun in a codegen-x checkout (2026-11-18, main). They are the
compatibility proof for `codegen-x.test.ts`: each one imports here and exports back byte for byte.

| file | what it covers |
| --- | --- |
| `amber-tokens.json` | skin, radius, every radius / density / shadow key incl. alert, light |
| `palette-dark.json` | custom palette (triadic, AAA), one density token, dark |
| `fonts.json` | font fields carried through (font, headingFont, fontScale) |
