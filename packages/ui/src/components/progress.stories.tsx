import type { Meta, StoryObj } from "@storybook/react-vite";

import { Progress } from "./progress.js";

const meta: Meta<typeof Progress> = {
  title: "01 Foundations/Feedback/Progress",
  component: Progress,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "20rem" }}><Story /></div>],
  args: { "aria-label": "Example progress", value: 62 },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Determinate: Story = {};
export const Complete: Story = { args: { value: 100 } };
export const Indeterminate: Story = { args: { value: null } };
