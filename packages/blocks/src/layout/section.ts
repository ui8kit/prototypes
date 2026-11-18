import { getContext, setContext } from "svelte";
import type { SectionPadding } from "../classes";

const KEY = Symbol("ui8kit.section-padding");

/**
 * The app (theme) provides section padding to every `Block` below it as a getter, so a theme change re-renders the class.
 * Without a provider a Block uses `default` (`py-16 lg:py-32`).
 */
export function provideSectionPadding(get: () => SectionPadding): void {
  setContext(KEY, get);
}

export function sectionPadding(): () => SectionPadding {
  return getContext<(() => SectionPadding) | undefined>(KEY) ?? (() => "default");
}
