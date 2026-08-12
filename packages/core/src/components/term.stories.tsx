import type { Meta, StoryObj } from "@storybook/react-vite";

import { Term } from "./glossary.js";

const meta = {
  title: "02 Learning patterns/Content & scaffolding/Term",
  component: Term,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Term>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { term: "mitosis", definition: "Cell division producing two genetically identical daughter cells." },
  render: (args) => <p className="max-w-xl leading-7">During <Term {...args} />, duplicated chromosomes separate into two nuclei.</p>,
};

export const ActiveRecall: Story = {
  args: {
    term: "ecosystem",
    definition: "A community of organisms interacting with their physical environment.",
    recallPrompt: "Before revealing it, name both parts of an ecosystem.",
    example: <span>Example: a pond and all the organisms, water, soil, and light within it.</span>,
  },
};
