// Skin ids and radii from codegen-x/ui8kit packages/taste-data (MIT). Chromatic
// swatches (OKLab) from taste-data/src/skin-colors.ts. Converted to HSL here so
// a skin without a custom palette still paints shadcn tokens.

export const SKIN_IDS = [
  "sky",
  "modern-minimal",
  "violet-bloom",
  "t3-chat",
  "bubblegum",
  "doom-64",
  "amber-minimal",
  "supabase",
  "kodama-grove",
  "perpetuity",
  "cosmic-night",
  "claude",
  "mocha-mousse",
  "neo-brutalism",
  "notebook",
  "rose",
] as const;
export type SkinId = (typeof SKIN_IDS)[number];

/** Corner radius in px. `rounded` follows `--radius`. 4px is the control step; 0/8/16 sit on the 8px grid; 12 is the stock scale. */
export const RADII = [0, 4, 8, 12, 16] as const;
export type Radius = (typeof RADII)[number];

export type Lab = readonly [number, number, number];
export type SkinPalette = { primary: Lab; background: Lab; accent: Lab };

export const SKIN_COLORS: Record<SkinId, { light: SkinPalette; dark: SkinPalette }> = {
  sky: { light: { primary: [0.5789, 0.1238, 0.117], background: [1, 0, 0], accent: [0.9477, -0.0106, -0.0243] }, dark: { primary: [0.5806, 0.1332, 0.1172], background: [0.154, -0.0009, -0.0092], accent: [0.2226, -0.0185, -0.073] } },
  "modern-minimal": { light: { primary: [0.5669, -0.0327, -0.186], background: [1, 0, 0], accent: [0.9535, -0.0131, -0.0201] }, dark: { primary: [0.5669, -0.0327, -0.186], background: [0.2044, 0, 0], accent: [0.3789, -0.0108, -0.1371] } },
  "violet-bloom": { light: { primary: [0.5395, 0.0785, -0.2597], background: [0.9924, 0, 0], accent: [0.9629, -0.0052, -0.0172] }, dark: { primary: [0.5855, 0.0842, -0.2126], background: [0.2226, 0.0001, -0.0059], accent: [0.28, -0.0064, -0.0364] } },
  "t3-chat": { light: { primary: [0.5311, 0.1404, -0.0125], background: [0.9749, 0.007, -0.0048], accent: [0.8697, 0.061, -0.0286] }, dark: { primary: [0.4611, 0.1851, 0.0132], background: [0.2374, 0.0122, -0.0159], accent: [0.3646, 0.031, -0.0391] } },
  bubblegum: { light: { primary: [0.5867, 0.1756, -0.0363], background: [0.9396, 0.0198, -0.005], accent: [0.9191, 0.0035, 0.0795] }, dark: { primary: [0.9191, 0.0035, 0.0795], background: [0.2492, -0.0178, -0.0246], accent: [0.5244, 0.0994, -0.0053] } },
  "doom-64": { light: { primary: [0.5019, 0.1675, 0.0872], background: [0.8452, 0, 0], accent: [0.5578, -0.0409, -0.09] }, dark: { primary: [0.5866, 0.1859, 0.0948], background: [0.2156, 0, 0], accent: [0.7478, -0.0517, -0.112] } },
  "amber-minimal": { light: { primary: [0.7686, 0.056, 0.1548], background: [1, 0, 0], accent: [0.9866, -0.002, 0.0217] }, dark: { primary: [0.7686, 0.056, 0.1548], background: [0.2044, 0, 0], accent: [0.4734, 0.0865, 0.09] } },
  supabase: { light: { primary: [0.8354, -0.1231, 0.0432], background: [0.9924, 0, 0], accent: [0.9466, 0, 0] }, dark: { primary: [0.4363, -0.0959, 0.0412], background: [0.1815, 0, 0], accent: [0.311, 0, 0] } },
  "kodama-grove": { light: { primary: [0.5483, -0.05, 0.0921], background: [0.8785, -0.0017, 0.0539], accent: [0.8369, -0.0005, 0.0718] }, dark: { primary: [0.6745, -0.039, 0.0427], background: [0.3303, 0.0007, 0.0214], accent: [0.6563, -0.0003, 0.0718] } },
  perpetuity: { light: { primary: [0.5483, -0.0856, -0.0374], background: [0.9522, -0.0076, -0.0023], accent: [0.9037, -0.0267, -0.0107] }, dark: { primary: [0.8528, -0.1217, -0.0327], background: [0.2041, -0.0173, -0.0166], accent: [0.3791, -0.046, -0.033] } },
  "cosmic-night": { light: { primary: [0.5421, 0.0554, -0.1701], background: [0.9725, 0.0038, -0.013], accent: [0.9226, -0.005, -0.0367] }, dark: { primary: [0.7153, 0.0552, -0.1502], background: [0.1738, 0.0054, -0.0221], accent: [0.3352, 0.0157, -0.0811] } },
  claude: { light: { primary: [0.5771, 0.1063, 0.0865], background: [0.9814, -0.0005, 0.0054], accent: [0.9257, -0.0007, 0.0136] }, dark: { primary: [0.575, 0.1026, 0.0819], background: [0.2678, -0.001, 0.0035], accent: [0.2107, -0.0007, 0.0079] } },
  "mocha-mousse": { light: { primary: [0.5676, 0.0446, 0.0426], background: [0.952, -0.0032, 0.0146], accent: [0.8512, 0.0257, 0.0288] }, dark: { primary: [0.7273, 0.0335, 0.0423], background: [0.2691, 0.009, 0.0101], accent: [0.7454, 0.0068, 0.0372] } },
  "neo-brutalism": { light: { primary: [0.5893, 0.2114, 0.1075], background: [1, 0, 0], accent: [0.5635, -0.0384, -0.2377] }, dark: { primary: [0.7044, 0.1721, 0.0737], background: [0, 0, 0], accent: [0.6755, -0.0538, -0.1681] } },
  notebook: { light: { primary: [0.4923, 0, 0], background: [0.9848, 0, 0], accent: [0.9354, -0.0034, 0.0446] }, dark: { primary: [0.757, 0, 0], background: [0.2905, 0, 0], accent: [0.9079, 0, 0] } },
  rose: { light: { primary: [0.5859, 0.2117, 0.067], background: [1, 0, 0], accent: [0.9413, 0.0291, 0.0065] }, dark: { primary: [0.81, 0.1037, 0.0214], background: [0.2103, 0.0016, -0.0057], accent: [0.4104, 0.1478, 0.0267] } },
};

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function oklabToSrgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function linearToSrgb(v: number): number {
  const c = clamp01(v);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

export function labToRgb(lab: Lab): [number, number, number] {
  const [r, g, b] = oklabToSrgb(lab[0], lab[1], lab[2]);
  return [Math.round(linearToSrgb(r) * 255), Math.round(linearToSrgb(g) * 255), Math.round(linearToSrgb(b) * 255)];
}

export function rgbToHsl([r, g, b]: [number, number, number]): { h: number; s: number; l: number } {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d > 1e-9) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h: Math.round(h) % 360, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function labToHsl(lab: Lab): { h: number; s: number; l: number } {
  return rgbToHsl(labToRgb(lab));
}
