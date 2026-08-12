import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

const meta = {
  title: "01 Foundations/Feedback/Popover",
  component: Popover,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="About this item">
        <p className="text-sm font-medium">Supplementary information</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This anchored surface remains close to its trigger and dismisses with Escape.
        </p>
      </PopoverContent>
    </Popover>
  ),
};
