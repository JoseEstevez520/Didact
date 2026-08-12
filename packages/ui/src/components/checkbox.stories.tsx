import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox.js";
import { Label } from "./label.js";

const meta = {
  title: "01 Foundations/Forms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="c1" />
      <Label htmlFor="c1">Photosynthesis produces oxygen</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="c2" defaultChecked />
      <Label htmlFor="c2">Photosynthesis produces oxygen</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="c3" disabled defaultChecked />
      <Label htmlFor="c3">Locked answer</Label>
    </div>
  ),
};
