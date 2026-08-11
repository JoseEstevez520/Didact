import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  SpacedRepetitionDeck,
  type SpacedRepetitionCard,
  type SpacedRepetitionReview,
} from "./spaced-repetition-deck.js";

/**
 * Storybook stories for `SpacedRepetitionDeck` (RF-2). The deck sequences a set of cards, shows
 * each as a `Flashcard`, and on rating asks the SM-2 scheduler for the next state/due date --
 * without persisting anything itself (the consumer owns storage). One story per meaningful state.
 */
const meta = {
  title: "Core/SpacedRepetitionDeck",
  component: SpacedRepetitionDeck,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof SpacedRepetitionDeck>;

export default meta;
type Story = StoryObj<typeof meta>;

const CARDS: SpacedRepetitionCard[] = [
  { id: "photosynthesis", front: "What does photosynthesis produce?", back: "Glucose and oxygen." },
  { id: "mitochondria", front: "What is the mitochondrion's main role?", back: "Producing ATP (energy)." },
  { id: "osmosis", front: "Define osmosis.", back: "Diffusion of water across a semipermeable membrane." },
];

export const Default: Story = {
  args: {
    cards: CARDS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A three-card deck. Reveal each card, rate it Known / Needs review, and the deck advances " +
          "to the next -- the progress line ('Card N of 3') is a polite live region so the change " +
          "is announced to screen readers.",
      },
    },
  },
};

export const WithReviewLog: Story = {
  name: "With review log (scheduler output)",
  args: {
    cards: CARDS,
  },
  render: (args) => {
    const [log, setLog] = React.useState<SpacedRepetitionReview[]>([]);
    return (
      <div style={{ display: "grid", gap: "1rem", width: "24rem" }}>
        <SpacedRepetitionDeck
          {...args}
          cards={CARDS}
          onReview={(review) => setLog((entries) => [...entries, review])}
        />
        <div style={{ fontSize: "0.8rem" }}>
          <strong>onReview log (what a consumer would persist):</strong>
          <ul>
            {log.map((entry, i) => (
              <li key={i}>
                {entry.card.id}: {entry.grade} -&gt; due{" "}
                {entry.result.dueAt.toISOString().slice(0, 10)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "The deck computes but never stores the schedule: each rating fires onReview with the " +
          "scheduler's next state and dueAt, which the consumer persists wherever it likes.",
      },
    },
  },
};

export const Complete: Story = {
  name: "Complete (terminal state)",
  args: {
    cards: CARDS,
    index: CARDS.length,
  },
  parameters: {
    docs: {
      description: {
        story:
          "index === cards.length is the completion state: a summary and a single primary 'Review " +
          "again' action that restarts the pass.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    cards: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "An empty deck is content, not a blank card (docs/interface-norms.md 'Empty'): it says " +
          "what's missing rather than rendering nothing.",
      },
    },
  },
};
