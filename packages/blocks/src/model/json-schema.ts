// JSON Schema 2020-12 of a content model, for an external builder (validation, inspector forms). One schema per content
// model, not per variant: 250 variants of a hero share `hero@1`. Generated files: packages/blocks/schemas/*.json.
import type { ContentModel, FieldDef, Fields } from "./types";

type Schema = Record<string, unknown>;

/** `javascript:`, `vbscript:`, `data:` are rejected (same as validate.ts) */
const SAFE_URL = "^(?!\\s*(?:[jJ][aA][vV][aA][sS][cC][rR][iI][pP][tT]|[vV][bB][sS][cC][rR][iI][pP][tT]|[dD][aA][tT][aA]):)";
/** an optional text may be "" (= not filled); a required one needs a non-space character */
const NON_BLANK = "\\S";

/** image src: https URL or root-relative path; mirrors IMAGE_SRC in validate.ts ("" = no image) */
const IMAGE_SRC = "^(?:|[hH][tT][tT][pP][sS]://[^\\s/?#]+[^\\s]*|/(?![/\\\\])[^\\s]*)$";

const IMAGE: Schema = {
  type: "object",
  required: ["src", "alt"],
  additionalProperties: false,
  properties: {
    src: { type: "string", format: "uri-reference", pattern: IMAGE_SRC },
    alt: { type: "string" },
    srcDark: { type: "string", format: "uri-reference", pattern: IMAGE_SRC },
  },
};

function field(f: FieldDef, labels: (key: string) => string, defs: Record<string, Schema>): Schema {
  const meta = { title: labels(f.label) };
  switch (f.type) {
    case "text":
    case "longText":
      return { ...meta, type: "string", maxLength: f.maxLength, ...(f.required ? { pattern: NON_BLANK } : {}), "x-ui8-type": f.type };
    case "url":
      return { ...meta, type: "string", format: "uri-reference", pattern: SAFE_URL, "x-ui8-type": "url" };
    case "image":
      return { ...meta, $ref: "#/$defs/image" };
    case "list":
      defs[f.item.id] = object(f.item.fields, labels, defs);
      return { ...meta, type: "array", minItems: f.minItems, maxItems: f.maxItems, items: { $ref: `#/$defs/${f.item.id}` } };
  }
}

function object(fields: Fields, labels: (key: string) => string, defs: Record<string, Schema>): Schema {
  const properties: Record<string, Schema> = {};
  const required: string[] = [];
  for (const [id, f] of Object.entries(fields)) {
    properties[id] = field(f, labels, defs);
    if (f.required) required.push(id);
  }
  return { type: "object", additionalProperties: false, required, properties };
}

export function toJsonSchema(model: ContentModel, labels: (key: string) => string = (k) => k): Schema {
  const defs: Record<string, Schema> = { image: IMAGE };
  const root = object(model.fields, labels, defs);
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `urn:ui8kit:content:${model.id}:${model.version}`,
    title: `${model.id}@${model.version}`,
    ...root,
    $defs: defs,
  };
}
