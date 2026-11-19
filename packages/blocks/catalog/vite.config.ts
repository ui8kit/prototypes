/**
 * The catalog bundle (`bun run build:catalog` -> packages/blocks/catalog/dist): an ES module for constructors and admin
 * panels. Its one difference from the app build: the kit's `utils/cn` (clsx + tailwind-merge, as `ui8kit add` installs it)
 * resolves to `kit-cn.ts`, the `cn` ui8kit/codegen emits with `generate --cn join` (pinned in codegen.lock.json kitCn).
 * The wireframe class lists never conflict, so the join gives the same classes (tested in catalog/cn.test.ts); the kit
 * files are not touched. `modules.json` lists every bundled module for scripts/catalog-size.mjs.
 */
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

const HERE = import.meta.dirname;
const KIT_CN = path.resolve(HERE, "../../kit/src/utils/cn.ts");
const LEAN_CN = path.resolve(HERE, "kit-cn.ts");

const leanCn = (): Plugin => ({
  name: "catalog-kit-cn",
  enforce: "pre",
  async resolveId(source, importer, options) {
    if (!importer || !/(^|\/)cn(\.ts)?$/.test(source)) return null;
    const r = await this.resolve(source, importer, { ...options, skipSelf: true });
    return r && path.resolve(r.id) === KIT_CN ? LEAN_CN : null;
  },
});

const moduleList = (): Plugin => ({
  name: "catalog-modules",
  generateBundle(_, bundle) {
    const ids = Object.values(bundle).flatMap((c) => (c.type === "chunk" ? Object.keys(c.modules) : []));
    this.emitFile({ type: "asset", fileName: "modules.json", source: JSON.stringify(ids.map((i) => path.relative(HERE, i)).sort(), null, 2) + "\n" });
  },
});

export default defineConfig({
  root: HERE,
  plugins: [leanCn(), tailwindcss(), svelte(), moduleList()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: true,
    cssMinify: true,
    lib: { entry: path.join(HERE, "entry.ts"), formats: ["es"], fileName: "catalog", cssFileName: "catalog" },
  },
});
