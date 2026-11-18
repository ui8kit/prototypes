import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: "jsdom",
    include: ["packages/blocks/src/**/*.test.ts"],
    exclude: ["packages/blocks/src/**/*.node.test.ts"],
  },
  resolve: {
    alias: {
      "@ui8kit/kit": new URL("./packages/kit/src/index.ts", import.meta.url).pathname,
      "@ui8kit/blocks": new URL("./packages/blocks/src/index.ts", import.meta.url).pathname,
    },
  },
});
