// JSON Pointer (RFC 6901) helpers: the address of one value in a block's props (`/title`, `/members/1/title`). The builder's
// inspector edits by pointer; a place's template (`/members/*` + `/title`) is resolved with the instance's list index.

const esc = (s: string): string => s.replaceAll("~", "~0").replaceAll("/", "~1");
const unesc = (s: string): string => s.replaceAll("~1", "/").replaceAll("~0", "~");

export const toPointer = (...segments: Array<string | number>): string => segments.map((s) => "/" + esc(String(s))).join("");
export const segments = (pointer: string): string[] => (pointer === "" ? [] : pointer.slice(1).split("/").map(unesc));

/** Resolve the `*` of a template with list indices, in order (`/members/*\/title`, 1 → `/members/1/title`). */
export function resolvePointer(template: string, ...indices: number[]): string {
  let i = 0;
  return template.replace(/\*/g, () => {
    const index = indices[i++];
    if (index === undefined) throw new Error(`pointer ${template}: missing list index`);
    return String(index);
  });
}

/** The template of a concrete pointer (`/members/1/title` → `/members/*\/title`). */
export const templateOf = (pointer: string): string => pointer.replace(/\/\d+(?=\/|$)/g, "/*");

export function getAt(value: unknown, pointer: string): unknown {
  let cur: unknown = value;
  for (const seg of segments(pointer)) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

/** A copy of `value` with `pointer` set to `next` (one data edit); `undefined` removes the key. */
export function setAt<T>(value: T, pointer: string, next: unknown): T {
  const segs = segments(pointer);
  if (segs.length === 0) return next as T;
  const [head, ...rest] = segs as [string, ...string[]];
  const src = (value ?? {}) as Record<string, unknown> | unknown[];
  const copy: Record<string, unknown> | unknown[] = Array.isArray(src) ? [...src] : { ...src };
  const child = setAt((src as Record<string, unknown>)[head], rest.length ? toPointer(...rest) : "", next);
  if (next === undefined && rest.length === 0) {
    if (Array.isArray(copy)) copy.splice(Number(head), 1);
    else delete copy[head];
  } else (copy as Record<string, unknown>)[head] = child;
  return copy as T;
}

/** Swap two items of a list (reorder): every pointer under them now addresses the other position. */
export function swapAt<T>(value: T, listPointer: string, a: number, b: number): T {
  const list = getAt(value, listPointer);
  if (!Array.isArray(list)) return value;
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return setAt(value, listPointer, next);
}
