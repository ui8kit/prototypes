/**
 * Content models: the value schema of a block's `props`, shared by every variant (and by every block that draws the same
 * content). Plain TypeScript data, no runtime dependency: `validate.ts` checks a value, `json-schema.ts` exports JSON Schema
 * 2020-12 for an external builder, and `ContentOf` gives the TypeScript type, all from the same definition.
 *
 * Value types (decision, docs/content-contract.md):
 *   text      one line (badge, title, label)
 *   longText  a paragraph (description); one value even when the wireframe draws several bars
 *   url       a link target (href); `javascript:` is rejected
 *   image     { src, alt, srcDark? }: one src for both themes, an optional dark-theme override
 *   list      an ordered array of one named record type (members: TeamMember[])
 */

export type ImageValue = {
  /** URL of the image (light theme, and dark when `srcDark` is absent) */
  src: string;
  /** text alternative; "" marks a decorative image */
  alt: string;
  /** optional dark-theme override */
  srcDark?: string;
};

type Base = {
  /** a filled value is required for a valid block */
  required?: boolean;
  /** label key in the ui dictionary (`ui.fields.<key>`), for the inspector */
  label: string;
};

export type TextField = Base & { type: "text"; maxLength: number };
export type LongTextField = Base & { type: "longText"; maxLength: number };
export type UrlField = Base & { type: "url" };
export type ImageField = Base & { type: "image" };
export type ListField = Base & { type: "list"; item: RecordModel; minItems: number; maxItems: number };
export type FieldDef = TextField | LongTextField | UrlField | ImageField | ListField;
export type ScalarField = Exclude<FieldDef, ListField>;

export type Fields = Record<string, FieldDef>;

/** A named record type of a list (`teamMember`). Never a universal "item" bag. */
export type RecordModel = { id: string; fields: Record<string, ScalarField> };

/** One content model: id + version are its identity (`hero@1`). */
export type ContentModel = { id: string; version: number; fields: Fields };

// ---- the TypeScript type of a value, inferred from the definition ----

type ValueOf<F> = F extends { type: "text" | "longText" | "url" }
  ? string
  : F extends { type: "image" }
    ? ImageValue
    : F extends { type: "list"; item: { fields: infer R } }
      ? Array<ValuesOf<R>>
      : never;

type RequiredKeys<T> = { [K in keyof T]: T[K] extends { required: true } ? K : never }[keyof T];
type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type ValuesOf<T> = { [K in RequiredKeys<T>]: ValueOf<T[K]> } & { [K in OptionalKeys<T>]?: ValueOf<T[K]> };

/** The props of a block whose content model is `M`. */
export type ContentOf<M extends ContentModel> = ValuesOf<M["fields"]>;

/** Keep literal types of a model definition (required: true stays `true`). */
export function defineModel<const M extends ContentModel>(model: M): M {
  return model;
}

/** Every path of a model as a JSON-pointer template (`/members/{i}/title` is written with `*` for the list index), lists included. */
export function modelPaths(fields: Fields, prefix = ""): { path: string; field: FieldDef }[] {
  const out: { path: string; field: FieldDef }[] = [];
  for (const [id, field] of Object.entries(fields)) {
    const path = `${prefix}/${id}`;
    out.push({ path, field });
    if (field.type === "list") out.push(...modelPaths(field.item.fields, `${path}/*`));
  }
  return out;
}

/** Leaf (non-list) paths only: the values an author edits. */
export const leafPaths = (fields: Fields): string[] =>
  modelPaths(fields)
    .filter((p) => p.field.type !== "list")
    .map((p) => p.path);
