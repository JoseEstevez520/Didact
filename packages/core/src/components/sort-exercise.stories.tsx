import type { Meta, StoryObj } from "@storybook/react-vite";

import { SortExercise } from "./matching-exercises.js";

const meta: Meta<typeof SortExercise> = {
  title: "02 Learning patterns/Relationships & ordering/Sort Exercise",
  component: SortExercise,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(42rem, calc(100vw - 2rem))" }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    title: "Put the scientific method in order",
    instructions: "Drag the rows, use the keyboard drag handle, or use the up/down buttons.",
    items: [
      { id: "hypothesis", content: "Form a hypothesis" },
      { id: "observe", content: "Make an observation" },
      { id: "test", content: "Test the hypothesis" },
      { id: "conclude", content: "Draw a conclusion" },
    ],
    correctOrder: ["observe", "hypothesis", "test", "conclude"],
  },
};
