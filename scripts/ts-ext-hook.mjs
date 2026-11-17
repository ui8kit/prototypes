/** Resolve extensionless relative specifiers to .ts for Node type-stripping tests. */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !/\.[a-zA-Z0-9]+$/.test(specifier)) {
    try {
      return await nextResolve(specifier + ".ts", context);
    } catch {
      /* fall through */
    }
  }
  return nextResolve(specifier, context);
}
