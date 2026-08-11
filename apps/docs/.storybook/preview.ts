import type { Preview } from "@storybook/react-vite";

import "./tailwind.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Fail the story's a11y check on real violations, not just log them -- design.md §8 wants
      // this addon to be a validation surface, not decoration.
      test: "error",
    },
  },
};

export default preview;
