import type { Meta, StoryObj } from "@storybook/react-vite";

import { Reveal } from "./hint-reveal.js";

const meta: Meta<typeof Reveal> = {
  title: "02 Learning patterns/Content & scaffolding/Reveal",
  component: Reveal,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(32rem, calc(100vw - 2rem))" }}><Story /></div>],
  args: { children: <span>Water boils at 100 °C at standard atmospheric pressure.</span> },
};

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
