import type { Meta, StoryObj } from "@storybook/react-vite";

import { CategorizeExercise } from "./matching-exercises.js";

const meta: Meta<typeof CategorizeExercise> = {
  title: "02 Learning patterns/Relationships & ordering/Categorize Exercise",
  component: CategorizeExercise,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(42rem, calc(100vw - 2rem))" }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    title: "Classify each organism",
    instructions: "Move each card into a column by dragging it, or select it and choose a destination column.",
    items: [
      { id: "salmon", content: "Salmon" },
      { id: "oak", content: "Oak" },
      { id: "eagle", content: "Eagle" },
      { id: "moss", content: "Moss" },
    ],
    categories: [{ id: "animal", content: "Animal" }, { id: "plant", content: "Plant" }],
    correctCategories: { salmon: "animal", oak: "plant", eagle: "animal", moss: "plant" },
  },
};
