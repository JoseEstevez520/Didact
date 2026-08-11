import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button.js";

/**
 * Storybook story for `Button`, `@didact/ui`'s foundational action primitive. See
 * docs/interface-norms.md's "Action hierarchy" for when to reach for each variant.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete lesson" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Cancel" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Link: Story = {
  args: { variant: "link", children: "Learn more" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "docs/interface-norms.md Action hierarchy: default is the single primary action, " +
          "secondary/outline for secondary actions, ghost for low-emphasis, link for " +
          "navigation-like, destructive for destructive actions.",
      },
    },
  },
};

export const AllSizes: Story = {
  name: "All sizes",
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Icon">
        +
      </Button>
      <Button size="icon-xs" aria-label="Icon extra small">
        +
      </Button>
      <Button size="icon-sm" aria-label="Icon small">
        +
      </Button>
      <Button size="icon-lg" aria-label="Icon large">
        +
      </Button>
    </div>
  ),
};

export const AsChild: Story = {
  name: "asChild (renders as a link)",
  render: () => (
    <Button asChild>
      <a href="#lessons">Go to lessons</a>
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "docs/design-principles.md §4: with asChild, Button's styling and behavior render " +
          "onto the child element (an <a> here) instead of an extra wrapper <button>.",
      },
    },
  },
};
