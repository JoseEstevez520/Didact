import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { FillInTheBlankQuiz } from "./quiz-item.js";

const layout: Decorator = (Story) => <div style={{ width: "28rem", maxWidth: "100%" }}><Story /></div>;
const meta = {
  title: "02 Learning patterns/Questions & assessment/Fill In The Blank Quiz",
  component: FillInTheBlankQuiz,
  parameters: { layout: "centered" },
  decorators: [layout],
  args: {
    question: "The chemical symbol for water is ___.",
    answers: ["H2O", "H₂O"],
    placeholder: "Type your answer",
  },
} satisfies Meta<typeof FillInTheBlankQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
