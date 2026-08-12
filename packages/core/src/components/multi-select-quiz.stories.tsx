import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { MultiSelectQuiz } from "./quiz-item.js";

const layout: Decorator = (Story) => <div style={{ width: "28rem", maxWidth: "100%" }}><Story /></div>;
const meta = {
  title: "02 Learning patterns/Questions & assessment/Multi Select Quiz",
  component: MultiSelectQuiz,
  parameters: { layout: "centered" },
  decorators: [layout],
  args: {
    question: "Which of these are produced by photosynthesis?",
    options: [
      { value: "o2", label: "Oxygen" },
      { value: "glucose", label: "Glucose" },
      { value: "co2", label: "Carbon dioxide" },
      { value: "protein", label: "Protein" },
    ],
    correctValues: ["o2", "glucose"],
    feedback: "Photosynthesis fixes carbon dioxide and water into glucose, releasing oxygen.",
  },
} satisfies Meta<typeof MultiSelectQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
