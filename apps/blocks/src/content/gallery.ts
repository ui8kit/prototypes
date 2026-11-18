import type { SampleId } from "@ui8kit/blocks";

export const galleryText = {
  title: "Blocks",
  viewLabel: "View",
  views: { catalog: "Catalog", preview: "Builder preview" },
  previewTitle: "Builder preview",
  sampleLabel: "Sample content",
  samples: { filled: "Filled", minimal: "Optional cleared", swapped: "Members swapped" } satisfies Record<SampleId, string>,
};
