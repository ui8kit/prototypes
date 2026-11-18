export type Route = { view: "gallery" } | { view: "block"; id: string; variant?: string };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  if (parts[0] === "block" && parts[1]) {
    return parts[2] ? { view: "block", id: parts[1], variant: parts[2] } : { view: "block", id: parts[1] };
  }
  return { view: "gallery" };
}

export function blockHref(id: string, variant?: string): string {
  return variant ? `#/block/${id}/${variant}` : `#/block/${id}`;
}
