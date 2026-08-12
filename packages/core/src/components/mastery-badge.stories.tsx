import type { Meta, StoryObj } from "@storybook/react-vite";

import { MasteryBadge } from "./mastery-badge.js";

/**
 * Storybook story for `MasteryBadge` (ROADMAP.md Phase 3's proof component). Per design.md §8 /
 * apps/docs' README plan, this documents one story per relevant state and pairs each with the
 * WCAG criterion it exercises -- see the per-story `parameters.docs.description` below instead of
 * a bare "it's accessible" claim.
 */
const meta = {
  title: "02 Learning patterns/Progress & mastery/Mastery Badge",
  component: MasteryBadge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    level: {
      control: "select",
      options: ["beginner", "intermediate", "advanced"],
    },
    variant: {
      control: "select",
      options: ["default", "secondary", "outline"],
    },
    percent: { control: { type: "range", min: 0, max: 100 } },
  },
} satisfies Meta<typeof MasteryBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Beginner: Story = {
  args: { level: "beginner" },
};

export const Intermediate: Story = {
  args: { level: "intermediate" },
};

export const Advanced: Story = {
  args: { level: "advanced" },
};

export const WithPercent: Story = {
  name: "With mastery percent",
  args: { level: "intermediate", percent: 62 },
  parameters: {
    docs: {
      description: {
        story:
          "WCAG 1.4.1 (Use of Color): the percentage and level are always text, so the badge " +
          "communicates the same information to a screen-reader user or someone with color " +
          "vision deficiency as it does visually.",
      },
    },
  },
};

export const Interactive: Story = {
  args: { level: "advanced", percent: 90, interactive: true },
  parameters: {
    docs: {
      description: {
        story:
          "WCAG 2.4.7 (Focus Visible) + 2.1.1 (Keyboard): a real <button>, reachable by Tab, " +
          "toggling aria-pressed/aria-expanded, with Didact's 3px/50%-opacity focus ring drawn " +
          "from the theme's ring token. Try tabbing to it instead of clicking.",
      },
    },
  },
};

export const AllLevels: Story = {
  name: "All levels (overview)",
  args: { level: "beginner" },
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <MasteryBadge level="beginner" percent={12} />
      <MasteryBadge level="intermediate" percent={58} />
      <MasteryBadge level="advanced" percent={97} />
    </div>
  ),
};

export const AllVariants: Story = {
  name: "All variants",
  args: { level: "beginner" },
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <MasteryBadge level="beginner" variant="default" percent={12} />
      <MasteryBadge level="beginner" variant="secondary" percent={12} />
      <MasteryBadge level="beginner" variant="outline" percent={12} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `variant` prop overrides the level-derived default so any level can render in " +
          "any of Didact's three neutral looks (default/secondary/outline) -- the customization " +
          "hook described in docs/design-principles.md §2.",
      },
    },
  },
};
