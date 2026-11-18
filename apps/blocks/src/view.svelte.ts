import { MODES, SAMPLE_IDS, type Mode, type SampleId } from "@ui8kit/blocks";

/**
 * Feed view: wireframe (the search feed, shapes only) or page (the same blocks filled from sample content).
 * Mirrored in the URL (`?mode=page&sample=minimal`) so a view can be linked and screenshotted.
 */
function initial(): { mode: Mode; sample: SampleId } {
  const q = typeof location === "undefined" ? new URLSearchParams() : new URLSearchParams(location.search);
  const mode = MODES.find((m) => m === q.get("mode")) ?? "wireframe";
  const sample = SAMPLE_IDS.find((s) => s === q.get("sample")) ?? "filled";
  return { mode, sample };
}

export const view = $state(initial());

export function setView(next: Partial<{ mode: Mode; sample: SampleId }>): void {
  Object.assign(view, next);
  if (typeof history === "undefined") return;
  const q = new URLSearchParams(location.search);
  q.set("mode", view.mode);
  q.set("sample", view.sample);
  history.replaceState(null, "", `${location.pathname}?${q}`);
}
