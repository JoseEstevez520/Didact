import type { Meta, StoryObj } from "@storybook/react-vite";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group.js";

/**
 * Storybook story for `ToggleGroup`/`ToggleGroupItem`. Renders are hand-written per story (rather
 * than spread from `args`) because the underlying primitive's `type="single" | "multiple"` prop
 * is a discriminated union that also changes the shape of `value`/`defaultValue` -- generic
 * Storybook controls can't safely narrow that for us.
 */
const meta = {
  title: "01 Foundations/Actions/Toggle Group",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
  },
  // Every story below supplies its own `type`/`value` props through `render` (see the note
  // above), but Storybook's typing still requires a base `args` value that satisfies the
  // component's discriminated union -- "single" is as good a default as any.
  args: {
    type: "single",
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  name: "Single select",
  render: () => (
    <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        Center
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        Right
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  name: "Multiple select",
  render: () => (
    <ToggleGroup type="multiple" aria-label="Formatting">
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="left" aria-label="Alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        Center
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        Right
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  name: "All sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <ToggleGroup type="single" size="sm" defaultValue="left" aria-label="Alignment small">
        <ToggleGroupItem value="left" aria-label="Align left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          Center
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="default" defaultValue="left" aria-label="Alignment default">
        <ToggleGroupItem value="left" aria-label="Align left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          Center
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="lg" defaultValue="left" aria-label="Alignment large">
        <ToggleGroupItem value="left" aria-label="Align left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          Center
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left" disabled aria-label="Alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        Center
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
