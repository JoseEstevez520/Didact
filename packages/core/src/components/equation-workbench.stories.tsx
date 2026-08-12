import type { Meta, StoryObj } from "@storybook/react-vite";

import { EquationWorkbench, type EquationWorkbenchDefinition } from "./equation-workbench.js";

const meta: Meta<typeof EquationWorkbench> = {
  title: "04 Applied experiences/Mathematical construction/Equation Workbench",
  component: EquationWorkbench,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-full max-w-[720px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

const algebra: EquationWorkbenchDefinition = {
  id: "algebra.linear-equation",
  title: "Isolate the variable",
  description: "Algebra · Symbolic transformation",
  instructions: "Show a valid transformation on each line, explain why it preserves equality, then state the solution.",
  initialExpression: "3(x − 2) + 5 = 20",
};

const chemistry: EquationWorkbenchDefinition = {
  id: "chemistry.balance-combustion",
  title: "Balance the combustion equation",
  description: "Chemistry · Conservation of atoms",
  instructions: "Adjust coefficients step by step. Use the reasoning field to record which element you balance at each stage.",
  initialExpression: "C₂H₆ + O₂ → CO₂ + H₂O",
  finalAnswerLabel: "Balanced equation",
};

export const Algebra: Story = {
  args: {
    definition: algebra,
    defaultState: { steps: [{ id: "algebra-1", expression: "3x − 6 + 5 = 20", note: "Distribute 3" }], finalAnswer: "" },
    evaluate: async ({ finalAnswer, steps }) => finalAnswer.replaceAll(" ", "") === "x=7" && steps.length >= 2
      ? { status: "correct", feedback: "The transformation chain preserves equality and reaches the solution." }
      : { status: "partial", feedback: "Review the chain or add the missing justification. The workbench does not compare expressions automatically." },
  },
};

export const ChemistryBalance: Story = {
  args: {
    definition: chemistry,
    defaultState: { steps: [], finalAnswer: "" },
  },
};

export const Streaming: Story = { args: { streaming: true } };
export const Disabled: Story = { args: { definition: algebra, disabled: true } };
