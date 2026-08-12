import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toggle } from "./toggle.js";

const meta = {
  title: "01 Foundations/Actions/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
  },
  args: {
    children: "B",
    "aria-label": "Bold",
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Pressed: Story = {
  args: { defaultPressed: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllSizes: Story = {
  name: "All sizes",
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Toggle size="sm" aria-label="Bold small">
        B
      </Toggle>
      <Toggle size="default" aria-label="Bold default">
        B
      </Toggle>
      <Toggle size="lg" aria-label="Bold large">
        B
      </Toggle>
    </div>
  ),
};
