/**
 * Test fixtures from the content models, one mechanism for every block: a value of a model is built from its fields
 * (`sampleContent`), and the invalid values each field rule rejects are derived from the same fields (`invalidContent`).
 * No test names a block, a model or a field: a synced block is covered as soon as it is in `BLOCKS`.
 */
import type { ModelField, ModelSpec } from "../generated/models/validate";

/** `full`: every field set, lists of 2 (within min / max); `required`: only the required fields, lists at their minimum. */
export type Fill = "full" | "required";

const clip = (s: string, f: ModelField): string => (f.maxLength !== undefined ? s.slice(0, f.maxLength) : s);

function listLength(f: ModelField, fill: Fill): number {
  const min = f.minItems ?? 0;
  const n = fill === "full" ? Math.max(min, 2) : Math.max(min, f.required ? 1 : 0);
  return f.maxItems !== undefined ? Math.min(n, f.maxItems) : n;
}

function sampleValue(f: ModelField, key: string, fill: Fill, index: number): unknown {
  switch (f.type) {
    case "id": return `${key}-${index}`;
    case "text": return clip(`Sample ${key}`, f);
    case "longText": return clip(`A short ${key}, one sentence.`, f);
    case "url": return `/${key}`;
    case "image": return `/${key}.png`;
    case "list": return Array.from({ length: listLength(f, fill) }, (_, i) => sampleFields(f.item!.fields, fill, i));
  }
}

function sampleFields(fields: Record<string, ModelField>, fill: Fill, index = 0): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, f] of Object.entries(fields)) if (fill === "full" || f.required) out[k] = sampleValue(f, k, fill, index);
  return out;
}

/** A valid value of the model. */
export const sampleContent = (spec: Pick<ModelSpec, "fields">, fill: Fill = "full"): Record<string, unknown> => sampleFields(spec.fields, fill);

/** An invalid value and the JSON pointer (relative to the content) the validator must report. */
export type InvalidCase = { rule: string; content: Record<string, unknown>; path: string };

const BAD_URL = "javascript:alert(1)";

function invalidFields(fields: Record<string, ModelField>, base: Record<string, unknown>, at: string, set: (v: Record<string, unknown>) => Record<string, unknown>): InvalidCase[] {
  const out: InvalidCase[] = [];
  const put = (rule: string, path: string, v: Record<string, unknown>) => out.push({ rule, path, content: set(v) });
  put("unknown field", `${at}/zzUnknown`, { ...base, zzUnknown: "x" });
  for (const [k, f] of Object.entries(fields)) {
    const path = `${at}/${k}`;
    if (f.required) {
      const { [k]: _gone, ...rest } = base;
      put(`${k}: required`, path, rest);
    }
    if (f.type === "list") {
      const item = sampleFields(f.item!.fields, "full");
      if (f.minItems) put(`${k}: fewer than ${f.minItems}`, path, { ...base, [k]: [] });
      if (f.maxItems !== undefined) put(`${k}: more than ${f.maxItems}`, path, { ...base, [k]: Array.from({ length: f.maxItems + 1 }, (_, i) => sampleFields(f.item!.fields, "full", i)) });
      put(`${k}: not a list`, path, { ...base, [k]: "x" });
      const list = (base[k] as unknown[] | undefined) ?? [item];
      // the item rules, on the last item of the list (the pointer carries its index)
      const i = list.length - 1;
      out.push(...invalidFields(f.item!.fields, list[i] as Record<string, unknown>, `${path}/${i}`, (v) => set({ ...base, [k]: list.map((x, j) => (j === i ? v : x)) })));
      continue;
    }
    put(`${k}: not a string`, path, { ...base, [k]: 1 });
    if (f.required) put(`${k}: empty`, path, { ...base, [k]: " " });
    if (f.maxLength !== undefined) put(`${k}: longer than ${f.maxLength}`, path, { ...base, [k]: "x".repeat(f.maxLength + 1) });
    if (f.type === "url" || f.type === "image") put(`${k}: scheme`, path, { ...base, [k]: BAD_URL });
    if (f.type === "id") put(`${k}: not an id`, path, { ...base, [k]: "-bad id" });
  }
  return out;
}

/** Every rule of every field of the model, broken once on the full sample. */
export const invalidContent = (spec: Pick<ModelSpec, "fields">): InvalidCase[] => {
  const base = sampleContent(spec);
  return invalidFields(spec.fields, base, "", (v) => v);
};
