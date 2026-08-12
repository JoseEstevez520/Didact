import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { SingleChoiceQuiz, type QuizOption } from "./quiz-item.js";

const options: QuizOption[] = [
  { value: "mercury", label: "Mercury" },
  { value: "venus", label: "Venus" },
  { value: "earth", label: "Earth" },
  { value: "mars", label: "Mars" },
];
const layout: Decorator = (Story) => <div style={{ width: "28rem", maxWidth: "100%" }}><Story /></div>;

const meta = {
  title: "02 Learning patterns/Questions & assessment/Single Choice Quiz",
  component: SingleChoiceQuiz,
  parameters: { layout: "centered" },
  decorators: [layout],
  args: { question: "Which planet is closest to the Sun?", options, correctValue: "mercury" },
} satisfies Meta<typeof SingleChoiceQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
export const WithFeedback: Story = {
  args: { feedback: "Mercury is the innermost planet, orbiting closer to the Sun than Venus." },
};
export const Disabled: Story = { args: { disabled: true } };

