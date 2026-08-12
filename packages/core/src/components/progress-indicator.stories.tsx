import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressIndicator } from "./progress-indicator.js";

const meta: Meta<typeof ProgressIndicator> = {
  title: "02 Learning patterns/Progress & mastery/Progress Indicator",
  component: ProgressIndicator,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(36rem, calc(100vw - 2rem))" }}><Story /></div>],
  args: {
    label: "Lesson 4",
    kind: "lesson",
    value: 2,
    max: 5,
    description: "Two activities completed",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
export const Indeterminate: Story = { args: { value: undefined, description: "Progress is still loading" } };
