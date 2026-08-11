import { defineConfig } from "tsup";

/**
 * Build config for @didact/core (ROADMAP Phase 3 exit criterion: the Badge must actually build).
 *
 * This bundles the package's TypeScript/TSX into a real `dist/` for anyone who imports
 * `@didact/core` as an npm dependency (e.g. this monorepo's own apps/docs Storybook, or the
 * registry item's build step). It does NOT replace Didact's copy-paste distribution
 * (RF-15): a consumer using the registry CLI copies `src/components/*.tsx` directly, never
 * `dist/`. `dist/` exists only so this package is a normal, buildable workspace dependency for
 * Didact's own tooling.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@didact/theme"],
});
