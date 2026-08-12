import type { Meta, StoryObj } from "@storybook/react-vite";

import { Timeline, type TimelineStep } from "./timeline.js";

const protocolSteps: TimelineStep[] = [
  {
    id: "prepare",
    title: "Prepare the sample",
    description: "Label the container and gather the required materials.",
  },
  {
    id: "measure",
    title: "Measure the reaction",
    description: "Record the temperature after five minutes.",
    content: <p>Use the same calibrated thermometer for every reading.</p>,
  },
  {
    id: "record",
    title: "Record the observation",
    description: "Add the result to your lab notes.",
  },
  {
    id: "reflect",
    title: "Reflect on the result",
    description: "Compare the observation with your prediction.",
  },
];

const meta: Meta<typeof Timeline> = {
  title: "03 Representation domains/Time, audio & animation/Timeline",
  component: Timeline,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: "min(44rem, calc(100vw - 2rem))" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    "aria-label": "Lab protocol",
    steps: protocolSteps,
    currentStep: 1,
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    currentStep: { control: { type: "number", min: 0, max: protocolSteps.length - 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Vertical: Story = {
  args: { orientation: "vertical" },
  parameters: {
    docs: {
      description: {
        story:
          "An ordered list supplies sequence semantics. Completed/current/upcoming states use " +
          "visible marker shapes, screen-reader text, and aria-current=step instead of color alone.",
      },
    },
  },
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
};

export const ExplicitStatuses: Story = {
  args: {
    steps: [
      { title: "Draft", status: "complete" },
      { title: "Peer review", status: "current" },
      { title: "Revise", status: "upcoming" },
      { title: "Submit", status: "upcoming" },
    ],
    currentStep: undefined,
  },
};

export const LocalizedLabels: Story = {
  args: {
    "aria-label": "Pasos del proyecto",
    labels: { complete: "Completado", current: "Paso actual", upcoming: "Próximo" },
  },
};

export const StreamingPartial: Story = {
  args: {
    "aria-label": "Steps received so far",
    steps: protocolSteps.slice(0, 2),
    currentStep: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The component accepts an incomplete array and title-only steps, so consumers can " +
          "render a useful snapshot while additional structured data is still streaming.",
      },
    },
  },
};

export const Empty: Story = {
  args: { "aria-label": "No steps yet", steps: [], currentStep: undefined },
};
