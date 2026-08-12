import type { Meta, StoryObj } from "@storybook/react-vite";

import { Glossary } from "./glossary.js";

const meta: Meta<typeof Glossary> = {
  title: "02 Learning patterns/Content & scaffolding/Glossary",
  component: Glossary,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(36rem, calc(100vw - 2rem))" }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    "aria-label": "Core biology terms",
    entries: [
      { term: "Cell", definition: "The basic structural and functional unit of life." },
      { term: "Homeostasis", definition: "Maintenance of stable internal conditions.", recallPrompt: "What kind of internal conditions does an organism maintain?" },
      { term: "Photosynthesis", definition: "The process plants use to turn light energy into chemical energy." },
    ],
  },
};

export const Streaming: Story = {
  args: {
    "aria-label": "Terms received so far",
    entries: [{ term: "Allele" }, { term: "Genotype", definition: "An organism's genetic constitution." }],
  },
};

export const Empty: Story = { args: { "aria-label": "Empty glossary", entries: [] } };
