# Theme constructor

`packages/theme` plus the panel in `apps/blocks`. Fonts and typography are out of scope.

## How `apps/stock` works (codegen-x/ui8kit)

Stock keeps a global theme under `stock:v1:theme` as `{ v: 1, theme }`. The model (`packages/theme-model/global-theme.ts`) holds:

| Field | Stock |
| --- | --- |
| `mode` | light / dark on `<html>` (`data-theme`) |
| `skin` | 16 ids from `taste-data` |
| `font` / `headingFont` | **not ported** |
| `radius` | 0, 4, 8, 12, 16 px → `--radius` |
| per-element radius / density / shadow | **not ported** (this constructor is global only; no shadows on wireframes) |
| `palette` | optional custom wheel |

A custom palette (`palette.ts`) is one base colour `{ harmony, h, s, l, contrast? }` plus a harmony. Harmonies and their hue offsets:

| Harmony | Offsets |
| --- | --- |
| monochromatic | `[0]` (three lightnesses: `MONO_STEPS` 0, −24, +24) |
| analogous | 0, −30, 30 |
| complementary | 0, 180 |
| split | 0, 150, 210 |
| triadic | 0, 120, 240 |
| tetradic | 0, 60, 180, 240 |
| square | 0, 90, 180, 270 |
| double-split | 0, 30, 180, 210 |
| compound | 0, −30, 30, 165, 195 |

`paletteTokens(p, mode, skin)` rewrites the skin's **own** shadcn names in `hsl(H S% L%)`. Destructive is never rewritten.

### Colour roles → palette steps

| Token | Source |
| --- | --- |
| `primary` / `primary-foreground` | base hue & sat; lightness `p.l` in light, `max(p.l, 100 − p.l)` in dark; `withForeground` until the pair passes AA 4.5:1 or AAA 7:1 |
| `secondary` / `-foreground` | 2nd harmony colour as a quiet surface (light 92 / dark 22, sat capped 70; mono 94 / 18) |
| `accent` / `-foreground` | 3rd harmony colour as a surface (light 90 / dark 28, sat capped 80; mono 88 / 26) |
| `ring`, `sidebar-primary`, `sidebar-ring` | same as primary |
| `sidebar-accent` | same as accent |
| `chart-1` … `chart-5` | harmony colours at a readable mid lightness (52 light / 62 dark); extra slots filled with shades |
| Neutrals (`background`, `foreground`, `card`, `popover`, `muted`, `border`, `input`, sidebar twins) | palette hue, low sat **8 / 10 / 12** (surfaces / text / lines; monochromatic **20 / 24 / 24**), lightness **and alpha** from `SKIN_NEUTRALS[skin][mode]`. Each text token then walks lightness until it passes the contrast level on every listed surface (`NEUTRAL_PAIRS`). |

16 `PRESETS` (blue-orange, red-green, … lavender) are full `{ harmony, h, s, l }` values. Options accept `H S% L%` or Hex (`colour-input.ts`).

Skins without a palette: Stock loads kit CSS. Here, `SKIN_NEUTRALS` still supplies lightness, and `SKIN_COLORS` OKLab swatches convert to HSL for primary / accent / charts.

Stock density is per-element (`data-density-*` + `--pad-*` in kit.css). Radii match this package. Export format there is `magazine-theme` v2 (JSON). The Theme sheet (layouts) is a side panel: fields, colour wheel, presets, design-system specimen, font pickers.

## What this repo ports

- `palette.ts`, `colour-input.ts`, `neutral-tokens.ts`, `skin-neutrals.ts` (MIT, verbatim logic).
- `SKIN_IDS`, `RADII`, `SKIN_COLORS` from `taste-data`.
- Wheel, harmonies, presets, Options, contrast AA/AAA, JSON import/export UI.
- Dual live preview of `FeaturesTeam` and `HeroSplit` in light and dark at once.

## What differs

| Stock | Prototypes |
| --- | --- |
| Fonts, heading fonts, type scale, width, tracking | **Excluded** |
| Per-element radius / density / shadow | One global radius, density, and section padding |
| Density via kit `--pad-*` | App CSS remaps `gap-8` / `h-10` / `w-24` / `h-4` under `[data-density]`. Section padding is a separate token. `--spacing` stays 4px |
| `magazine-theme` v2 | `prototypes-theme` v1 (still **reads** magazine-theme and `{ v:1, theme }`) |
| `stock:v1:theme` | `prototypes:v1:theme` |
| Apply `dark` / `data-theme` on `<html>` | Chrome vars on `<html>`; each preview is `[data-mode=light\|dark]` so `dark:` Media hatches do not leak |
| Design-system specimen, skin/font pickers as wide sheets | Skin `<select>`, palette panel, dual block preview |
| Shadows | None (wireframe) |

### Density map (8+4)

| Token in blocks | compact | default | comfortable |
| --- | --- | --- | --- |
| `gap-8` | 16px | 32px | 48px |
| CTA `h-10` | 32px | 40px | 48px |
| CTA `w-24` | 64px | 96px | 96px |
| heading `h-4` | 16px | 16px | 24px |
| text line `h-2` | 8px | 8px | 8px |

40px CTA height is the control step (4×10). Everything else is a multiple of 8.

### Section padding (even 8px, independent of density)

Block keeps the class `py-16`. Theme writes `--theme-section-py` and `--theme-section-py-lg` (lg = 1024px). Tailwind steps 32 and 40 are not extracted (ui8px layout list stops at 24); the px values still match `py-8` / `lg:py-16`, `py-16` / `lg:py-32`, `py-24` / `lg:py-40`.

| Preset | Base | lg (1024px+) | Tailwind pair |
| --- | --- | --- | --- |
| compact | 32px | 64px | `py-8` / `lg:py-16` |
| default | 64px | 128px | `py-16` / `lg:py-32` |
| spacious | 96px | 160px | `py-24` / `lg:py-40` |

## UI

`apps/blocks`: light preview | dark preview | theme panel. Palette opens in the panel (wheel, HSL/Hex, harmonies, ranges, AA/AAA, 16 presets, token chips). Export copies JSON or CSS.
