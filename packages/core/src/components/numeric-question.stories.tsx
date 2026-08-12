import { useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumericQuestion } from "./numeric-question.js";

const layout = (Story: ComponentType) => (
  <div style={{ width: "min(42rem, calc(100vw - 2rem))" }}><Story /></div>
);

const meta = {
  title: "03 Representation domains/Mathematics & data/Numeric Question",
  component: NumericQuestion,
  parameters: { layout: "centered" },
  decorators: [layout],
} satisfies Meta<typeof NumericQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AbsoluteAndRelativeTolerance: Story = {
  args: {
    prompt: "A sample has an expected mass of 250 g. What value did you measure?",
    description: "Answers pass when they are within 2 g and within 1% of the expected value.",
    unit: { symbol: "g", policy: "display" },
    rule: {
      kind: "value",
      value: 250,
      tolerance: { absolute: 2, relative: 0.01, mode: "both" },
    },
    feedback: {
      correct: "The measurement is within the instrument's stated uncertainty.",
      incorrect: "Check the instrument resolution and repeat the measurement.",
    },
  },
};

export const RequiredUnit: Story = {
  args: {
    prompt: "Convert 72 km/h to metres per second.",
    description: "Write both the value and its unit.",
    unit: { symbol: "m/s", policy: "required", aliases: ["mps"] },
    rule: { kind: "value", value: 20, tolerance: { absolute: 0.01 } },
    feedback: {
      incorrect: "Divide kilometres per hour by 3.6, then verify the unit.",
    },
  },
};

export const AcceptedRange: Story = {
  args: {
    prompt: "Enter a resting heart rate within the reference interval.",
    unit: { symbol: "bpm", policy: "display" },
    rule: { kind: "range", min: 60, max: 100 },
    feedback: {
      correct: "This value falls inside the interval used for this exercise.",
      incorrect: "Review the lower and upper boundaries of the interval.",
    },
  },
};

export const UngradedEstimate: Story = {
  args: {
    prompt: "How many litres of water do you think your household uses each day?",
    description: "Estimate before seeing the class data. There is no single correct response.",
    unit: { symbol: "L", policy: "display" },
    feedback: {
      ungraded: "Keep this estimate: you will compare it with measured data in the next activity.",
    },
    labels: { submit: "Record estimate" },
  },
};

export const LocalizedControlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState("2,5");
    return (
      <NumericQuestion
        prompt="¿Cuál es el diámetro aproximado?"
        value={value}
        onValueChange={setValue}
        numberFormat={{ decimalSeparator: ",", allowExponent: false }}
        unit={{ symbol: "cm", policy: "display" }}
        rule={{ kind: "range", min: 2.4, max: 2.6 }}
        labels={{
          response: "Tu respuesta",
          responsePlaceholder: "Escribe un número",
          submit: "Comprobar",
          correct: "Correcto",
          incorrect: "Necesita revisión",
          expectedRange: (range) => `Intervalo aceptado: ${range}`,
        }}
      />
    );
  },
};

export const Streaming: Story = {
  args: {
    description: "The prompt can arrive after the surrounding activity has rendered.",
  },
};

export const Disabled: Story = {
  args: {
    prompt: "This measurement is read-only while the activity is paused.",
    defaultValue: "9.81",
    unit: { symbol: "m/s²", policy: "display" },
    rule: { kind: "value", value: 9.81 },
    disabled: true,
  },
};
