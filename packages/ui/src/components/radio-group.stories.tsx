import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadioGroup, RadioGroupItem } from "./radio-group.js";
import { Label } from "./label.js";

const meta = {
  title: "01 Foundations/Forms/Radio Group",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: "recall", label: "I recalled it easily" },
  { value: "hesitated", label: "I hesitated" },
  { value: "forgot", label: "I forgot" },
];

export const Default: Story = {
  render: () => (
    <RadioGroup aria-label="How did it go?" defaultValue="hesitated">
      {options.map((option) => (
        <div key={option.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RadioGroupItem value={option.value} id={`d-${option.value}`} />
          <Label htmlFor={`d-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup aria-label="How did it go?" defaultValue="recall" disabled>
      {options.map((option) => (
        <div key={option.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RadioGroupItem value={option.value} id={`dis-${option.value}`} />
          <Label htmlFor={`dis-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};
