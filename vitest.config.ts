import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

const browser = { conditions: ["browser"] } as const;

export default defineConfig({
  plugins: [svelte({ hot: false }), svelteTesting()],
  test: {
    environment: "jsdom",
    include: ["packages/blocks/src/**/*.test.ts", "packages/blocks/catalog/**/*.test.ts", "apps/blocks/src/**/*.test.ts"],
    exclude: ["packages/blocks/src/**/*.node.test.ts"],
    server: {
      deps: {
        inline: ["svelte", "@testing-library/svelte"],
      },
    },
  },
  resolve: {
    ...browser,
    // Exact matches only: the generated organisms import `@ui8kit/kit/ui/*` and `@ui8kit/kit/utils` (package exports).
    alias: [
      { find: /^@ui8kit\/kit$/, replacement: new URL("./packages/kit/src/index.ts", import.meta.url).pathname },
      { find: /^@ui8kit\/blocks$/, replacement: new URL("./packages/blocks/src/index.ts", import.meta.url).pathname },
    ],
  },
  // Vitest loads modules through Vite's SSR pipeline; pin browser there too.
  ssr: {
    resolve: {
      ...browser,
      externalConditions: ["browser"],
    },
  },
});
