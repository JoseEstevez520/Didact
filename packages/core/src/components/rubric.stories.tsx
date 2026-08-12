import type { Meta, StoryObj } from "@storybook/react-vite";

import { Rubric, type RubricCriterion } from "./rubric.js";

const essayCriteria: RubricCriterion[] = [
  {
    id: "claim",
    label: "Clear claim",
    description: "The opening states a focused position that the essay can defend.",
    levels: [
      { id: "starting", label: "Starting", description: "The position is missing or unclear." },
      { id: "developing", label: "Developing", description: "A position is present but broad." },
      { id: "secure", label: "Secure", description: "The position is specific and defensible." },
    ],
  },
  {
    id: "evidence",
    label: "Relevant evidence",
    description: "Examples and quotations directly support the claim.",
    levels: [
      { id: "starting", label: "Starting", description: "Evidence is absent or unrelated." },
      { id: "developing", label: "Developing", description: "Some evidence supports the claim." },
      { id: "secure", label: "Secure", description: "Evidence is specific and well chosen." },
    ],
  },
];

const meta: Meta<typeof Rubric> = {
  title: "02 Learning patterns/Questions & assessment/Rubric",
  component: Rubric,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: "min(44rem, calc(100vw - 2rem))" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Essay self-assessment",
    description: "For each criterion, choose the description that best matches your work.",
    criteria: essayCriteria,
  },
};

export default meta;
type Story = StoryObj<typeof Rubric>;

export const Interactive: Story = {};

export const PartiallyAssessed: Story = {
  args: { defaultValue: { claim: "developing" } },
  parameters: {
    docs: {
      description: {
        story:
          "Selections are the learner's own judgement. Rubric never calculates a grade, pass/fail, or correctness state.",
      },
    },
  },
};

export const Controlled: Story = {
  args: { value: { claim: "secure", evidence: "developing" } },
};

export const Localized: Story = {
  args: {
    title: "Autoevaluacion del ensayo",
    description: "Elige el nivel que mejor describe tu trabajo.",
    labels: { progress: (done, total) => `${done} de ${total} criterios evaluados` },
  },
};

export const StreamingPartial: Story = {
  args: {
    title: "Rubric loading progressively",
    criteria: [
      { id: "first", label: "First criterion", levels: essayCriteria[0]?.levels },
      { id: "second", label: "Second criterion" },
    ],
  },
};

export const Empty: Story = {
  args: { title: "New rubric", description: undefined, criteria: [] },
};

export const Disabled: Story = {
  args: { disabled: true, value: { claim: "secure" } },
};
