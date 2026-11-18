/** Resolve extensionless relative specifiers to .ts for Node type-stripping tests.
 * `*.block` is a typed manifest suffix, not a real extension — map it to `.block.ts`.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".")) {
    const candidates = [];
    if (!/\.[a-zA-Z0-9]+$/.test(specifier)) candidates.push(specifier + ".ts");
    if (specifier.endsWith(".block")) candidates.push(specifier + ".ts");
    for (const next of candidates) {
      try {
        return await nextResolve(next, context);
      } catch {
        /* try the next candidate */
      }
    }
  }
  return nextResolve(specifier, context);
}
