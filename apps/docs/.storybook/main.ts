import path from "node:path";
import { mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/react-vite";

/**
 * Storybook config for Didact's docs/catalog app (design.md §8, apps/docs/README.md).
 *
 * Stories live next to the components they document -- in packages/core/src (layer 3, education
 * molecules) and packages/ui/src (layers 1-2, the primitive kit) -- not duplicated here -- so this
 * stays the single source of truth `packages/registry/registry.json` can be checked against
 * (apps/docs/README.md's "relationship to the registry" note).
 *
 * The `viteFinal` aliases resolve the `@didact/*` workspace packages to their SOURCE (not their
 * built `dist/`), so editing a primitive in packages/ui/src is reflected instantly via HMR while
 * iterating on the design -- no rebuild step between a change and seeing it.
 */
const config: StorybookConfig = {
  stories: [
    "../../../packages/core/src/**/*.stories.@(ts|tsx)",
    "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@didact/ui": path.resolve(import.meta.dirname, "../../../packages/ui/src/index.ts"),
          "@didact/core": path.resolve(import.meta.dirname, "../../../packages/core/src/index.ts"),
        },
      },
    });
  },
};

export default config;
