import { defineConfig } from "tsup";

/**
 * Build config for @didact/ui -- mirrors packages/core/tsup.config.ts. This bundles the
 * package's TypeScript/TSX into a real `dist/` so `@didact/ui` is a normal, buildable workspace
 * dependency for Didact's own tooling (apps/docs' Storybook, @didact/core once it composes from
 * this kit). It does NOT replace Didact's copy-paste distribution (RF-15): a consumer using the
 * registry CLI copies `src/components/*.tsx` directly, never `dist/`.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "@didact/theme",
    "@radix-ui/react-separator",
    "@radix-ui/react-slot",
    "@radix-ui/react-toggle",
    "@radix-ui/react-toggle-group",
  ],
});
