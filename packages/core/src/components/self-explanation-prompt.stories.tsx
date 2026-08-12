import { useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SelfExplanationPrompt } from "./generative-learning.js";

const layout = (Story: ComponentType) => (
  <div style={{ width: "min(46rem, calc(100vw - 2rem))" }}><Story /></div>
);

const meta = {
  title: "02 Learning patterns/Generative learning/Self Explanation Prompt",
  component: SelfExplanationPrompt,
  parameters: { layout: "centered" },
  decorators: [layout],
} satisfies Meta<typeof SelfExplanationPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    prompt: "Why does increasing sample size usually make an estimate more stable?",
    description: "Explain the mechanism, not only the result.",
    scaffolds: [
      "What happens to the influence of any one observation?",
      "How does sampling variability change?",
    ],
    modelExplanation: "With more independent observations, unusual individual values have less influence on the aggregate, so repeated samples tend to produce estimates with less variability.",
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState("A larger sample gives each observation less influence");
    return <SelfExplanationPrompt prompt="Explain the effect of sample size." value={value} onValueChange={setValue} minLength={30} />;
  },
};

export const Localized: Story = {
  args: {
    prompt: "¿Por qué conserva este cambio el significado de la frase?",
    scaffolds: ["Compara el sujeto y la acción antes y después."],
    labels: {
      response: "Tu explicación",
      responsePlaceholder: "Explica el razonamiento con tus palabras…",
      guidance: "Guía",
      submit: "Enviar explicación",
      submitted: "Explicación enviada.",
    },
  },
};

