import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { ShortAnswerQuiz } from "./quiz-item.js";

const layout: Decorator = (Story) => <div style={{ width: "28rem", maxWidth: "100%" }}><Story /></div>;
const meta = {
  title: "02 Learning patterns/Questions & assessment/Short Answer Quiz",
  component: ShortAnswerQuiz,
  parameters: { layout: "centered" },
  decorators: [layout],
  args: {
    question: "In one sentence, why does spaced repetition improve retention?",
    modelAnswer: "Reviewing at increasing intervals forces retrieval as forgetting begins, strengthening future recall more than massed practice.",
    placeholder: "Write your answer…",
  },
} satisfies Meta<typeof ShortAnswerQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
