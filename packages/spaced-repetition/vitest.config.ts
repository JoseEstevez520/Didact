import { defineConfig } from "vitest/config";

/**
 * Vitest config for @didact/spaced-repetition. The schedulers are pure arithmetic with no DOM, so
 * this runs in the default `node` environment -- no jsdom, no React plugin, no setup file (unlike
 * @didact/ui / @didact/core, which test rendered components).
 */
export default defineConfig({
  test: {
    environment: "node",
  },
});
