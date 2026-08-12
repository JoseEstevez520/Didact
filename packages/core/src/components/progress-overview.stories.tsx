import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressOverview } from "./progress-indicator.js";

const meta: Meta<typeof ProgressOverview> = {
  title: "02 Learning patterns/Progress & mastery/Progress Overview",
  component: ProgressOverview,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(36rem, calc(100vw - 2rem))" }}><Story /></div>],
  args: {
    "aria-label": "Course progress",
    entries: [
      { id: "lesson", label: "Cell biology", kind: "lesson", value: 75, description: "3 of 4 activities complete" },
      { id: "skill", label: "Scientific reasoning", kind: "skill", value: 58, description: "Current mastery estimate" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
export const Streaming: Story = { args: { entries: [{ label: "Evidence evaluation", kind: "skill" }] } };
export const Empty: Story = { args: { entries: [] } };
