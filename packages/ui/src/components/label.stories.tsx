import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label.js";
import { Input } from "./input.js";

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem", width: "16rem" }}>
      <Label htmlFor="full-name">Full name</Label>
      <Input id="full-name" placeholder="Ada Lovelace" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A Label associated to its control via htmlFor/id: clicking the label focuses the field, " +
          "and assistive tech announces the field's name.",
      },
    },
  },
};
