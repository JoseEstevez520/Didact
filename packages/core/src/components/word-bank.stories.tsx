import type { Meta, StoryObj } from "@storybook/react-vite";

import { WordBank } from "./word-bank.js";

const meta = {
  title: "03 Representation domains/Language & writing/Word Bank",
  component: WordBank,
  parameters: { layout: "centered" },
} satisfies Meta<typeof WordBank>;

export default meta;
type Story = StoryObj<typeof meta>;

const languageOptions = [
  { id: "allez", content: "allez", accessibleLabel: "allez" },
  { id: "allons", content: "allons", accessibleLabel: "allons" },
  { id: "vont", content: "vont", accessibleLabel: "vont" },
  { id: "sommes", content: "sommes", accessibleLabel: "sommes" },
];

export const LanguageLearning: Story = {
  args: {
    title: "Completa con el verbo aller",
    description: "Selecciona un hueco y una forma verbal. Tambien puedes hacerlo en el orden contrario.",
    gaps: [
      { id: "nous", before: "Nous", after: "au cinema.", accessibleLabel: "Hueco de nous", correctOptionIds: ["allons"] },
      { id: "vous", before: "Vous", after: "a Paris.", accessibleLabel: "Hueco de vous", correctOptionIds: ["allez"] },
      { id: "ils", before: "Ils", after: "a l'ecole.", accessibleLabel: "Hueco de ils", correctOptionIds: ["vont"] },
    ],
    options: languageOptions,
    labels: {
      gaps: "Frases",
      bank: "Banco de palabras",
      emptyGap: "Vacío",
      submit: "Comprobar",
      undo: "Deshacer",
      clear: "Vaciar",
      correct: "Todas las respuestas son correctas.",
      incorrect: "Revisa las respuestas.",
      partial: "Algunas respuestas son correctas.",
    },
  },
};

export const ReusableOption: Story = {
  args: {
    title: "Use a reusable connector",
    description: "The word 'and' can be used twice; each distractor can be used once.",
    gaps: [
      { id: "one", before: "Research", after: "practice", accessibleLabel: "First connector", correctOptionIds: ["and"] },
      { id: "two", before: "Reflect", after: "revise", accessibleLabel: "Second connector", correctOptionIds: ["and"] },
    ],
    options: [
      { id: "and", content: "and", accessibleLabel: "and", maxUses: 2 },
      { id: "but", content: "but", accessibleLabel: "but" },
    ],
  },
};

export const DragAndDrop: Story = {
  args: {
    title: "Build the sentence",
    description: "Drag each word onto a gap, or select a gap and a word using click or keyboard.",
    gaps: [
      { id: "action", before: "Learners", after: "knowledge.", accessibleLabel: "Action gap", correctOptionIds: ["retrieve"] },
      { id: "effect", before: "Practice makes memory", after: ".", accessibleLabel: "Effect gap", correctOptionIds: ["durable"] },
    ],
    options: [
      { id: "retrieve", content: "retrieve", accessibleLabel: "retrieve" },
      { id: "durable", content: "durable", accessibleLabel: "durable" },
      { id: "passive", content: "passive", accessibleLabel: "passive" },
    ],
  },
};

export const PartiallyGraded: Story = {
  args: {
    title: "Grammar and style",
    gaps: [
      { id: "grammar", before: "She", after: "every day.", accessibleLabel: "Grammar gap", correctOptionIds: ["reads"] },
      { id: "style", before: "Choose the most expressive ending:", accessibleLabel: "Style gap", feedback: "Discuss why your choice fits the intended tone." },
    ],
    options: [
      { id: "reads", content: "reads", accessibleLabel: "reads" },
      { id: "quietly", content: "quietly", accessibleLabel: "quietly" },
      { id: "boldly", content: "boldly", accessibleLabel: "boldly" },
    ],
  },
};

export const Streaming: Story = {
  args: {
    title: "Loading lesson",
    gaps: [{ id: "loaded", before: "The loaded gap is", after: ".", accessibleLabel: "Loaded gap", correctOptionIds: ["ready"] }, { id: "pending" }],
    options: [{ id: "ready", content: "ready", accessibleLabel: "ready" }, { id: "pending" }],
  },
};

export const Disabled: Story = {
  args: {
    title: "Read-only response",
    gaps: [{ id: "place", before: "The train arrives", after: "noon.", accessibleLabel: "Time preposition", correctOptionIds: ["at"] }],
    options: [{ id: "at", content: "at", accessibleLabel: "at" }, { id: "in", content: "in", accessibleLabel: "in" }],
    defaultValue: { place: "at" },
    disabled: true,
  },
};

export const Empty: Story = { args: { title: "New activity" } };
