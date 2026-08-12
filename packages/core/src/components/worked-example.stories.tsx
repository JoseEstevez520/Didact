import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkedExample } from "./generative-learning.js";

const layout = (Story: ComponentType) => (
  <div style={{ width: "min(46rem, calc(100vw - 2rem))" }}><Story /></div>
);

const meta = {
  title: "02 Learning patterns/Generative learning/Worked Example",
  component: WorkedExample,
  parameters: { layout: "centered" },
  decorators: [layout],
} satisfies Meta<typeof WorkedExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Progressive: Story = {
  args: {
    problem: "Estimate 18% of 250 without a calculator",
    description: "Follow the decomposition one step at a time.",
    mode: "progressive",
    steps: [
      { id: "ten", title: "Find 10%", content: "10% of 250 = 25", rationale: "Dividing by ten is a quick anchor." },
      { id: "five", title: "Find 5%", content: "5% of 250 = 12.5", rationale: "Five percent is half of ten percent." },
      { id: "three", title: "Find 3%", content: "3% of 250 = 7.5" },
      { id: "combine", title: "Combine", content: "25 + 12.5 + 7.5 = 45" },
    ],
    summary: "Decompose an unfamiliar percentage into convenient parts that sum to it.",
  },
};

export const Static: Story = {
  args: {
    problem: "Resolve a customer escalation",
    steps: [
      { id: "acknowledge", title: "Acknowledge", content: "Restate the customer's concern in neutral language." },
      { id: "verify", title: "Verify", content: "Confirm the account and reproduce the reported state." },
      { id: "resolve", title: "Resolve", content: "Offer the smallest action that fully addresses the concern." },
    ],
  },
};

export const Streaming: Story = {
  args: {
    problem: "Example arriving progressively",
    mode: "progressive",
    steps: [{ id: "partial" }, { id: "ready", title: "Next step", content: "This part is ready." }],
  },
};

