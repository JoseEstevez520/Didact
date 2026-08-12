import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flashcard } from "./flashcard.js";

/**
 * Storybook story for `Flashcard` (RF-1). Rebuilt (2026-08-11) on `@didact/ui` with a
 * reveal -> rate flow -- see flashcard.tsx's header comment for the two product-owner-flagged
 * problems this fixes (no action hierarchy, rating shown before the answer was revealed). Per
 * design.md §8 / apps/docs' README plan, this documents one story per relevant state and pairs
 * each with the WCAG criterion it exercises instead of a bare "it's accessible" claim.
 */
const meta = {
  title: "02 Learning patterns/Practice & memory/Flashcard",
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
  name: "Default (front, before reveal)",
  args: {
    front: "What is the capital of France?",
    back: "Paris",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Exactly one `default`-variant Button ('Reveal answer') is visible -- " +
          "docs/interface-norms.md's Action hierarchy rule (at most one primary action per view). " +
          "The rating control does not exist in the tree yet: rating before the answer is " +
          "revealed was the flagged bad flow.",
      },
    },
  },
};

export const Revealed: Story = {
  name: "Revealed (back, unrated)",
  args: {
    front: "What is the capital of France?",
    back: "Paris",
    defaultFlipped: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Only once revealed does the rating control appear, in the CardFooter -- a single " +
          "segmented ToggleGroup ('pick your rating'), not two equal-weight competing buttons. " +
          "The front face (and its reveal button) has left the accessibility tree via " +
          "aria-hidden + inert (WCAG 4.1.2).",
      },
    },
  },
};

export const Known: Story = {
  name: "Revealed, marked known",
  args: {
    front: "What is the capital of France?",
    back: "Paris",
    defaultFlipped: true,
    defaultStatus: "known",
  },
  parameters: {
    docs: {
      description: {
        story:
          "WCAG 1.4.1 (Use of Color): the selected rating is a real radio-role control labelled " +
          "\"Known\" with a checkmark icon, not a color change alone -- try this story with " +
          "grayscale vision simulation and the state still reads clearly.",
      },
    },
  },
};

export const NeedsReview: Story = {
  name: "Revealed, marked needs review",
  args: {
    front: "What is the capital of France?",
    back: "Paris",
    defaultFlipped: true,
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
    defaultFlipped: true,
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
      <Flashcard variant="default" front="Default variant" back="Back" defaultFlipped />
      <Flashcard variant="outline" front="Outline variant" back="Back" defaultFlipped />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `variant` prop overrides the neutral Card look (docs/design-principles.md §2) on " +
          "top of `@didact/ui`'s Card -- `default` keeps Card's own fill and fixed border, while " +
          "`outline` turns the fill transparent and keeps the same hairline boundary.",
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
      <Flashcard size="sm" front="Small" back="Back" defaultFlipped />
      <Flashcard size="md" front="Medium" back="Back" defaultFlipped />
      <Flashcard size="lg" front="Large" back="Back" defaultFlipped />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`size` scales the max-width and face text/height, and also picks a matching " +
          "reveal-Button / rating-ToggleGroup control size (sm/default/lg) so the two line up -- " +
          "interface-norms.md's 'Spacing & sizing' (pick a size scale for the whole view).",
      },
    },
  },
};
