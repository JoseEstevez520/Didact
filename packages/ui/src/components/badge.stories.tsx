import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge.js";

/**
 * Storybook story for `Badge`, the generic label/status primitive (see badge.tsx for how it
 * differs from packages/core's domain-specific `MasteryBadge`).
 */
const meta = {
  title: "01 Foundations/Feedback/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
  args: {
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Overdue" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Draft" },
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
