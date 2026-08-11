import { defineConfig } from "tsup";

/**
 * Build config for @didact/spaced-repetition -- mirrors packages/ui/tsup.config.ts and
 * packages/core/tsup.config.ts. Bundles the package's pure-TypeScript scheduler code into a real
 * `dist/` so it is a normal, buildable workspace dependency for `@didact/core` (whose
 * `SpacedRepetitionDeck` composes on top of `sm2Scheduler`) and for Didact's own tooling.
 *
 * As with the rest of Didact, `dist/` does NOT replace the copy-paste distribution model (RF-15):
 * a consumer using the registry CLI copies `src/*.ts` directly, never `dist/`. This package has no
 * runtime dependencies -- the whole point of SM-2 (research.md P4) is that it is a few dozen lines
 * of dependency-free arithmetic.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
});
