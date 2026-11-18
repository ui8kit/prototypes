import type { Mode, SampleId } from "@ui8kit/blocks";

export const galleryText = {
  title: "Blocks",
  modeLabel: "Render mode",
  modes: { wireframe: "Wireframe", page: "Page" } satisfies Record<Mode, string>,
  sampleLabel: "Sample content",
  samples: { filled: "Filled", minimal: "Optional cleared", swapped: "Members swapped" } satisfies Record<SampleId, string>,
};
