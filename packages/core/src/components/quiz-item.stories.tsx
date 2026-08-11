import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  FillInTheBlankQuiz,
  MultiSelectQuiz,
  ShortAnswerQuiz,
  SingleChoiceQuiz,
  TrueFalseQuiz,
  type QuizOption,
} from "./quiz-item.js";

/**
 * Stories for the QuizItem family (RF-4). One story per variant and per meaningful state
 * (default, with informative feedback, disabled, and post-submission correct/incorrect via the
 * interactive controls). Every variant: correct/incorrect is icon + text (never color alone,
 * RF-12), the correct answer is not in the DOM until the learner submits, and the optional
 * `feedback` slot appears only after submission.
 */
const singleChoiceOptions: QuizOption[] = [
  { value: "mercury", label: "Mercury" },
  { value: "venus", label: "Venus" },
  { value: "earth", label: "Earth" },
  { value: "mars", label: "Mars" },
];

const meta = {
  title: "Core/QuizItem",
  component: SingleChoiceQuiz,
  parameters: {
    layout: "centered",
  },
  args: {
    question: "Which planet is closest to the Sun?",
    options: singleChoiceOptions,
    correctValue: "mercury",
  },
} satisfies Meta<typeof SingleChoiceQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleChoice: Story = {
  name: "Single choice (multiple-choice)",
  parameters: {
    docs: {
      description: {
        story:
          "Pick one option and submit. Before submitting, nothing reveals which option is correct; " +
          "after submitting, the result is an icon + text and the correct/your-answer options are " +
          "marked with icon + text too.",
      },
    },
  },
};

export const SingleChoiceWithFeedback: Story = {
  name: "Single choice with informative feedback",
  args: {
    feedback:
      "Mercury is the innermost planet, orbiting ~58 million km from the Sun -- closer than Venus " +
      "(~108M km).",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The optional feedback slot -- the evidence-backed 'why' -- is rendered only after " +
          "submission, never before.",
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const MultiSelect: Story = {
  name: "Multi-select (select all that apply)",
  render: () => (
    <MultiSelectQuiz
      question="Which of these are produced by photosynthesis?"
      options={[
        { value: "o2", label: "Oxygen" },
        { value: "glucose", label: "Glucose" },
        { value: "co2", label: "Carbon dioxide" },
        { value: "protein", label: "Protein" },
      ]}
      correctValues={["o2", "glucose"]}
      feedback="Photosynthesis fixes CO2 and water into glucose, releasing oxygen. It does not make protein."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Graded correct only on an exact set match. Instruction defaults to 'Select all that apply.'",
      },
    },
  },
};

export const TrueFalse: Story = {
  name: "True / false",
  render: () => (
    <TrueFalseQuiz
      question="The mitochondrion is the main site of ATP production in the cell."
      correctValue
      feedback="True -- oxidative phosphorylation on the inner mitochondrial membrane produces most ATP."
    />
  ),
};

export const FillInTheBlank: Story = {
  name: "Fill in the blank",
  render: () => (
    <FillInTheBlankQuiz
      question="The chemical symbol for water is ___."
      answers={["H2O", "H₂O"]}
      placeholder="Type your answer"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "An exact-answer field, verified against accepted answers (case-insensitive, whitespace " +
          "normalized by default). If the answer is wrong, the accepted answer is revealed -- only " +
          "after submission.",
      },
    },
  },
};

export const ShortAnswer: Story = {
  name: "Short answer (assisted self-assessment)",
  render: () => (
    <ShortAnswerQuiz
      question="In one sentence, why does spaced repetition improve retention?"
      modelAnswer="Reviewing material at increasing intervals forces retrieval just as forgetting begins, which strengthens the memory more than massed practice."
      placeholder="Write your answer…"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Free text can't be graded reliably, so submitting reveals a model answer (kept out of " +
          "the DOM until then) and the learner self-assesses -- RF-4's 'assisted verification'.",
      },
    },
  },
};
