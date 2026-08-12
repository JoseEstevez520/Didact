import type { Meta, StoryObj } from "@storybook/react-vite";

import { MeasurementLab, type MeasurementLabDefinition } from "./measurement-lab.js";

const meta: Meta<typeof MeasurementLab> = {
  title: "04 Applied experiences/Measurement & instruments/Measurement Lab",
  component: MeasurementLab,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-full max-w-[700px]"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

const thermometer: MeasurementLabDefinition = {
  id: "science.thermometer",
  title: "Read the thermometer",
  description: "Science · Measurement and uncertainty",
  instructions: "Adjust the marker to the observed temperature and submit the reading.",
  observedReading: 21.5,
  instrument: { kind: "linear", min: -10, max: 50, step: 0.5, majorStep: 10, unit: "°C", label: "Laboratory thermometer" },
};

const pressureGauge: MeasurementLabDefinition = {
  id: "maintenance.pressure",
  title: "Record the operating pressure",
  description: "Technical training · Equipment inspection",
  instructions: "Reproduce the gauge reading before deciding whether the line is safe to service.",
  observedReading: 116,
  instrument: { kind: "dial", min: 0, max: 160, step: 2, majorStep: 20, unit: "kPa", label: "Pressure gauge" },
};

export const LaboratoryTemperature: Story = {
  args: {
    definition: thermometer,
    defaultState: { reading: 18.5 },
    evaluate: ({ reading }) => reading !== null && Math.abs(reading - 21.5) <= 0.5
      ? { status: "correct", feedback: "The reading includes the instrument's half-degree precision." }
      : { status: "partial", feedback: "Read the top of the indicator and account for the half-degree divisions." },
  },
};

export const MaintenanceGauge: Story = { args: { definition: pressureGauge, defaultState: { reading: 80 } } };
export const Streaming: Story = { args: { streaming: true } };
export const Empty: Story = { args: {} };
export const Disabled: Story = { args: { definition: pressureGauge, defaultState: { reading: 80 }, disabled: true } };
