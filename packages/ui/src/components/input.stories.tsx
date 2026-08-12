import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input.js";
import { Label } from "./label.js";

const meta = {
  title: "01 Foundations/Forms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Type here…", "aria-label": "Example" },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem", width: "16rem" }}>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Every Input should be paired with a Label via htmlFor/id so clicking the label focuses " +
          "the field and screen readers announce a name (WCAG 1.3.1 / 4.1.2).",
      },
    },
  },
};

export const Invalid: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.5rem", width: "16rem" }}>
      <Label htmlFor="code">Access code</Label>
      <Input id="code" aria-invalid aria-describedby="code-error" defaultValue="abc" />
      <p id="code-error" style={{ fontSize: "0.8rem", color: "var(--destructive)" }}>
        Code must be 6 digits.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The invalid state is driven by aria-invalid and paired with real error text referenced " +
          "by aria-describedby -- never the red outline alone (docs/interface-norms.md, WCAG 1.4.1).",
      },
    },
  },
};

export const Disabled: Story = {
  args: { "aria-label": "Disabled", placeholder: "Unavailable", disabled: true },
};
