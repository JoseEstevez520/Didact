import { useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { CompletionProblem, type CompletionProblemValue } from "./generative-learning.js";

const layout = (Story: ComponentType) => (
  <div style={{ width: "min(46rem, calc(100vw - 2rem))" }}><Story /></div>
);

const meta = {
  title: "02 Learning patterns/Generative learning/Completion Problem",
  component: CompletionProblem,
  parameters: { layout: "centered" },
  decorators: [layout],
} satisfies Meta<typeof CompletionProblem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    problem: "Complete the calculation of the mean",
    description: "The first step is provided. Complete the remaining reasoning.",
    steps: [
      { id: "sum", kind: "worked", title: "Add the observations", content: "8 + 10 + 12 + 14 = 44", rationale: "The mean uses the total of all observations." },
      { id: "count", kind: "completion", title: "Count", prompt: "How many observations are there?", acceptedAnswers: ["4"], feedback: "Count each value in the original set." },
      { id: "divide", kind: "completion", title: "Divide", prompt: "Write the final calculation", acceptedAnswers: ["44 / 4 = 11", "44 ÷ 4 = 11"], feedback: "Divide the total by the number of observations." },
      { id: "interpret", kind: "completion", title: "Interpret", prompt: "Explain what 11 represents", multiline: true, feedback: "An instructor or peer can review this open response." },
    ],
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<CompletionProblemValue>({ pressure: "" });
    return (
      <CompletionProblem
        problem="Complete the relationship"
        steps={[
          { id: "given", kind: "worked", content: "At constant temperature, P₁V₁ = P₂V₂." },
          { id: "pressure", kind: "completion", prompt: "Solve for P₂", acceptedAnswers: ["P₂ = P₁V₁ / V₂"] },
        ]}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    problem: "Read-only completion problem",
    disabled: true,
    defaultValue: { result: "42" },
    steps: [{ id: "result", kind: "completion", prompt: "Result", acceptedAnswers: ["42"] }],
  },
};

export const Empty: Story = { args: {} };
