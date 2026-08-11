import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flashcard } from "./flashcard.js";

/**
 * Storybook story for `Flashcard` (RF-1, the first real Phase 4 component). Per design.md §8 /
 * apps/docs' README plan, this documents one story per relevant state and pairs each with the
 * WCAG criterion it exercises -- see the per-story `parameters.docs.description` below instead of
 * a bare "it's accessible" claim.
 */
const meta = {
  title: "Core/Flashcard",
  component: Flashcard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Flashcard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default (front)",
  args: {
    front: "What is the capital of France?",
    back: "Paris",
  },
};

export const Flipped: Story = {
  name: "Flipped (back)",
  args: {
    front: "What is the capital of France?",
    back: "Paris",
    defaultFlipped: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The flip control's accessible name and `aria-pressed` reflect state (WCAG 4.1.2), " +
          "and the previously-showing face leaves the accessibility tree via `aria-hidden` + " +
          "`inert` instead of staying reachable underneath the visible one.",
      },
    },
  },
};

export const Known: Story = {
  name: "Marked known",
  args: {
    front: "What is the capital of France?",
    back: "Paris",
    defaultStatus: "known",
  },
  parameters: {
    docs: {
      description: {
        story:
          "WCAG 1.4.1 (Use of Color): the mark is a real button labelled \"Known\" with a " +
          "checkmark icon, not a color change alone -- try this story with grayscale vision " +
          "simulation and the state still reads clearly.",
      },
    },
  },
};

export const NeedsReview: Story = {
  name: "Marked needs review",
  args: {
    front: "What is the capital of France?",
    back: "Paris",
    defaultStatus: "review",
  },
};

export const LongContent: Story = {
  name: "Long content",
  args: {
    front:
      "Explain, in your own words, why spaced repetition produces more durable learning than " +
      "massed practice (cramming), and name the forgetting-curve effect it counteracts.",
    back:
      "Spacing reviews out over time forces retrieval after some forgetting has already begun, " +
      "which strengthens the memory trace more than reviewing while it is still fresh (massed " +
      "practice). This counteracts the forgetting curve described by Ebbinghaus: without review, " +
      "recall drops fastest right after learning and levels off later -- spaced review targets " +
      "each review right around the point recall would otherwise fail.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Front and back are stacked in the same grid cell, so the card's height follows " +
          "whichever face is currently larger instead of clipping the longer one.",
      },
    },
  },
};

export const AllVariants: Story = {
  name: "All variants",
  args: {
    front: "Front",
    back: "Back",
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Flashcard variant="default" front="Default variant" back="Back" />
      <Flashcard variant="outline" front="Outline variant" back="Back" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `variant` prop overrides the neutral card look (docs/design-principles.md §2) -- " +
          "`default` uses the `--didact-card` fill, `outline` is transparent with just the " +
          "hairline border.",
      },
    },
  },
};

export const AllSizes: Story = {
  name: "All sizes",
  args: {
    front: "Front",
    back: "Back",
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <Flashcard size="sm" front="Small" back="Back" />
      <Flashcard size="md" front="Medium" back="Back" />
      <Flashcard size="lg" front="Large" back="Back" />
    </div>
  ),
};
