import type { Meta, StoryObj } from "@storybook/react-vite";

import { Hint } from "./hint-reveal.js";

const meta: Meta<typeof Hint> = {
  title: "02 Learning patterns/Content & scaffolding/Hint",
  component: Hint,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(32rem, calc(100vw - 2rem))" }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Progressive: Story = {
  args: {
    hints: [
      "Draw a right triangle and label the side opposite the angle.",
      "Use the relationship sin(θ) = opposite / hypotenuse.",
      "Substitute sin(30°) = 1/2 before solving.",
    ],
    solution: <span>The opposite side is <strong>5 cm</strong>.</span>,
    feedback: "Check the result by substituting 5/10 back into the sine ratio.",
  },
};

export const Streaming: Story = { args: { hints: ["Identify the known quantities.", undefined] } };
export const Localized: Story = {
  args: {
    heading: "¿Necesitas una pista?",
    description: "Descubre una pista cada vez.",
    hints: ["Aísla la incógnita antes de sustituir valores."],
    solution: "x = 6",
    labels: {
      nextHint: "Mostrar pista",
      hint: (position, total) => `Pista ${position} de ${total}`,
      revealSolution: "Mostrar solución",
      hideSolution: "Ocultar solución",
      solution: "Solución",
    },
  },
};
