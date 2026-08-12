import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./textarea.js";
import { Label } from "./label.js";

const meta = {
  title: "01 Foundations/Forms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Write your answer…", "aria-label": "Answer" },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem", width: "20rem" }}>
      <Label htmlFor="explanation">Explain your reasoning</Label>
      <Textarea id="explanation" placeholder="In your own words…" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { "aria-label": "Disabled", placeholder: "Unavailable", disabled: true },
};
