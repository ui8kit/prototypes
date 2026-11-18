export type Route = { view: "gallery" } | { view: "block"; id: string };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  if (parts[0] === "block" && parts[1]) return { view: "block", id: parts[1] };
  return { view: "gallery" };
}

export function blockHref(id: string): string {
  return `#/block/${id}`;
}
