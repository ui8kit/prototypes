import {
  applyVars,
  cssProperties,
  exportCss,
  fromConfig,
  isDefault,
  NO_THEME,
  patchTheme,
  readTheme,
  setThemeField,
  toConfig,
  writeTheme,
  type FieldId,
  type FieldValue,
  type GlobalTheme,
  type ImportResult,
  type Mode,
  type ThemeConfig,
  type ThemeState,
} from "@ui8kit/theme";

export const STORAGE_KEY = "prototypes:v1:theme";
export const MODE_KEY = "ui8kit-theme";

export type WidePanel = null | "palette";

export const appTheme = $state({
  state: { mode: "light" as Mode, theme: NO_THEME } satisfies ThemeState,
  wide: null as WidePanel,
});

let applied: string[] = [];

export function loadTheme(): void {
  let mode: Mode = "light";
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "dark") mode = "dark";
    else if (stored === "light") mode = "light";
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) mode = "dark";
  } catch {
    /* storage blocked */
  }
  appTheme.state = { mode, theme: readTheme(STORAGE_KEY) };
  applyTheme();
}

export function applyTheme(): void {
  const root = document.documentElement;
  const { theme, mode } = appTheme.state;
  root.setAttribute("data-density", theme.density);
  root.setAttribute("data-section-padding", theme.sectionPadding);
  applied = applyVars(root, cssProperties(theme, mode), applied);
  writeTheme(STORAGE_KEY, theme);
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* storage blocked */
  }
}

export function previewStyle(theme: GlobalTheme, mode: Mode): string {
  return Object.entries(cssProperties(theme, mode))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

export const themeCtl = {
  get value(): GlobalTheme {
    return appTheme.state.theme;
  },
  get mode(): Mode {
    return appTheme.state.mode;
  },
  get wide(): WidePanel {
    return appTheme.wide;
  },
  set wide(v: WidePanel) {
    appTheme.wide = v;
  },
  setTheme(patch: Partial<GlobalTheme>): void {
    appTheme.state = { ...appTheme.state, theme: patchTheme(appTheme.state.theme, patch) };
    applyTheme();
  },
  setField(id: FieldId, v: FieldValue | null): void {
    if (id === "mode") {
      appTheme.state = { ...appTheme.state, mode: v === "dark" ? "dark" : "light" };
    } else {
      appTheme.state = { ...appTheme.state, theme: setThemeField(appTheme.state.theme, id, v) };
    }
    applyTheme();
  },
  reset(): void {
    appTheme.state = { ...appTheme.state, theme: NO_THEME };
    applyTheme();
  },
  exportConfig(): ThemeConfig {
    return toConfig(appTheme.state);
  },
  exportCss(): string {
    return exportCss(appTheme.state.theme);
  },
  importConfig(input: unknown): ImportResult {
    const result = fromConfig(input);
    if (result.ok) {
      appTheme.state = { mode: result.mode ?? appTheme.state.mode, theme: result.theme };
      applyTheme();
    }
    return result;
  },
  isDefault(): boolean {
    return isDefault(appTheme.state.theme);
  },
};
