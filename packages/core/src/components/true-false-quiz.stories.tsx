import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { TrueFalseQuiz } from "./quiz-item.js";

const layout: Decorator = (Story) => <div style={{ width: "28rem", maxWidth: "100%" }}><Story /></div>;
const meta = {
  title: "02 Learning patterns/Questions & assessment/True False Quiz",
  component: TrueFalseQuiz,
  parameters: { layout: "centered" },
  decorators: [layout],
  args: {
    question: "The mitochondrion is the main site of ATP production in the cell.",
    correctValue: true,
    feedback: "Oxidative phosphorylation on the inner mitochondrial membrane produces most ATP.",
  },
} satisfies Meta<typeof TrueFalseQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
