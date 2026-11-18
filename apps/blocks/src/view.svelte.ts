import { SAMPLE_IDS, type SampleId } from "@ui8kit/blocks";

/**
 * App view. `catalog` is the feed: every block × variant, always rectangle-only (no mode is passed). `preview` is the
 * builder's page mode, shown separately: the same blocks rendered from saved sample instances through `BlockView`.
 * Mirrored in the URL (`?view=preview&sample=minimal`).
 */
export const VIEWS = ["catalog", "preview"] as const;
export type View = (typeof VIEWS)[number];

function initial(): { view: View; sample: SampleId } {
  const q = typeof location === "undefined" ? new URLSearchParams() : new URLSearchParams(location.search);
  const view = VIEWS.find((v) => v === q.get("view")) ?? "catalog";
  const sample = SAMPLE_IDS.find((s) => s === q.get("sample")) ?? "filled";
  return { view, sample };
}

export const app = $state(initial());

export function setView(next: Partial<{ view: View; sample: SampleId }>): void {
  Object.assign(app, next);
  if (typeof history === "undefined") return;
  const q = new URLSearchParams();
  if (app.view === "preview") {
    q.set("view", app.view);
    q.set("sample", app.sample);
  }
  const query = q.toString();
  history.replaceState(null, "", query ? `${location.pathname}?${query}` : location.pathname);
}
