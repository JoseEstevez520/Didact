import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "./separator.js";

const meta = {
  title: "01 Foundations/Layout/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: "16rem" }}>
      <p>Section one</p>
      <Separator style={{ margin: "0.75rem 0" }} />
      <p>Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", height: "2.5rem", gap: "0.75rem" }}>
      <span>Lesson</span>
      <Separator orientation="vertical" />
      <span>Quiz</span>
      <Separator orientation="vertical" />
      <span>Review</span>
    </div>
  ),
};

export const Semantic: Story = {
  name: "Semantic (non-decorative)",
  args: { decorative: false },
  render: (args) => (
    <div style={{ width: "16rem" }}>
      <p>Section one</p>
      <Separator {...args} style={{ margin: "0.75rem 0" }} />
      <p>Section two</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "decorative=false exposes role=separator + aria-orientation for a divider that " +
          "carries real document structure, instead of the purely visual default.",
      },
    },
  },
};
