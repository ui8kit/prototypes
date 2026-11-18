// Validate a block's props against its content model. Issues carry the JSON pointer of the value, so the builder's
// inspector can show them on the field. Same rules as the exported JSON Schema (json-schema.ts); tests check both agree.
import { toPointer } from "./pointer";
import type { ContentModel, FieldDef, Fields, ImageValue } from "./types";

export type IssueCode = "required" | "type" | "maxLength" | "minItems" | "maxItems" | "unknown" | "unsafeUrl" | "imageUrl";
export type Issue = { path: string; code: IssueCode };
export type Validation = { ok: boolean; issues: Issue[] };

/** a text value counts as filled when it has a non-space character */
export const filled = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
/** an image counts as present when its src is filled */
export const hasImage = (v: unknown): v is ImageValue => !!v && typeof v === "object" && filled((v as ImageValue).src);

const UNSAFE = /^\s*(?:javascript|vbscript|data):/i;
/**
 * Image src (decision, docs/content-contract.md): an absolute https URL (stock photos, CDNs) or a root-relative path
 * (`/samples/hero.png`, local samples). Rejected: http (mixed content), protocol-relative `//host`, other schemes,
 * bare relative paths, whitespace. Same pattern as the JSON Schema (`IMAGE_SRC` in json-schema.ts).
 */
export const IMAGE_SRC = /^(?:https:\/\/[^\s/?#]+[^\s]*|\/(?![/\\])[^\s]*)$/i;

function checkSrc(v: string, path: string, out: Issue[]): void {
  if (v === "") return;
  if (UNSAFE.test(v)) out.push({ path, code: "unsafeUrl" });
  else if (!IMAGE_SRC.test(v)) out.push({ path, code: "imageUrl" });
}

function checkField(f: FieldDef, v: unknown, path: string, out: Issue[]): void {
  const absent = v === undefined || v === null || (typeof v === "string" && v.trim() === "");
  if (absent) {
    if (f.required) out.push({ path, code: "required" });
    if (v === null) out.push({ path, code: "type" });
    return;
  }
  switch (f.type) {
    case "text":
    case "longText":
      if (typeof v !== "string") out.push({ path, code: "type" });
      else if (v.length > f.maxLength) out.push({ path, code: "maxLength" });
      return;
    case "url":
      if (typeof v !== "string") out.push({ path, code: "type" });
      else if (UNSAFE.test(v)) out.push({ path, code: "unsafeUrl" });
      return;
    case "image": {
      if (typeof v !== "object" || Array.isArray(v)) return void out.push({ path, code: "type" });
      if (f.required && !hasImage(v)) out.push({ path, code: "required" });
      const img = v as Record<string, unknown>;
      for (const k of Object.keys(img)) if (!["src", "alt", "srcDark"].includes(k)) out.push({ path: `${path}/${k}`, code: "unknown" });
      if (typeof img.src !== "string") out.push({ path: `${path}/src`, code: "type" });
      else checkSrc(img.src, `${path}/src`, out);
      if (typeof img.alt !== "string") out.push({ path: `${path}/alt`, code: "type" });
      if (img.srcDark !== undefined && typeof img.srcDark !== "string") out.push({ path: `${path}/srcDark`, code: "type" });
      else if (typeof img.srcDark === "string") checkSrc(img.srcDark, `${path}/srcDark`, out);
      return;
    }
    case "list": {
      if (!Array.isArray(v)) return void out.push({ path, code: "type" });
      if (v.length < f.minItems) out.push({ path, code: "minItems" });
      if (v.length > f.maxItems) out.push({ path, code: "maxItems" });
      v.forEach((item, i) => checkObject(f.item.fields, item, `${path}/${i}`, out));
      return;
    }
  }
}

function checkObject(fields: Fields, v: unknown, path: string, out: Issue[]): void {
  if (!v || typeof v !== "object" || Array.isArray(v)) return void out.push({ path, code: "type" });
  const o = v as Record<string, unknown>;
  for (const k of Object.keys(o)) if (!(k in fields)) out.push({ path: `${path}${toPointer(k)}`, code: "unknown" });
  for (const [k, f] of Object.entries(fields)) checkField(f, o[k], `${path}${toPointer(k)}`, out);
}

export function validate(model: ContentModel, value: unknown): Validation {
  const issues: Issue[] = [];
  checkObject(model.fields, value, "", issues);
  return { ok: issues.length === 0, issues };
}
