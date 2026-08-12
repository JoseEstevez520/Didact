import type { Preview } from "@storybook/react-vite";

import "./tailwind.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "00 Start here",
          ["Catalog", "Architecture"],
          "01 Foundations",
          ["Actions", "Forms", "Layout", "Feedback"],
          "02 Learning patterns",
          [
            "Content & scaffolding",
            "Questions & assessment",
            "Practice & memory",
            "Generative learning",
            "Relationships & ordering",
            "Progress & mastery",
            "Orchestration",
          ],
          "03 Representation domains",
          [
            "Language & writing",
            "Mathematics & data",
            "Visual & spatial",
            "Time, audio & animation",
            "Symbols & structures",
          ],
          "04 Experience platforms",
          ["Scenarios & simulation", "Code & technical practice", "Creative tools"],
          "05 Course recipes",
          ["Corporate learning", "Creative learning", "Technical learning", "Science & data"],
        ],
      },
    },
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
