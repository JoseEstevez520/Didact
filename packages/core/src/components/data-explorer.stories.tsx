import type { Meta, StoryObj } from "@storybook/react-vite";
import { DATA_COORDINATE_SCHEMA_VERSION, type DataCoordinateDefinition } from "@didact/schema";

import { DataExplorer } from "./data-explorer.js";

const quadratic: DataCoordinateDefinition = {
  schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
  id: "quadratic-parameters",
  title: "How does a change the curve?",
  description: "Inspect f(x) = ax² − 2 and switch to the table for the same sampled values.",
  axes: {
    x: { label: "x", domain: { scale: "linear", min: -5, max: 5 } },
    y: { label: "f(x)", domain: { scale: "linear", min: -4, max: 24 } },
  },
  series: [{
    id: "quadratic",
    label: "f(x) = 0.8x² − 2",
    kind: "line",
    source: { kind: "function", expression: "a*x*x + b", variable: "x", parameters: { a: 0.8, b: -2 }, domain: { scale: "linear", min: -5, max: 5 }, sampleCount: 31 },
  }],
  table: { source: "series", caption: "Sampled function values", showSeriesColumn: false },
  interaction: { selection: "none", viewport: "fixed" },
};

const operationalTrend: DataCoordinateDefinition = {
  schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
  id: "support-response-time",
  title: "Support response time",
  description: "Compare the observed weekly median with the service target. Select or revise an observed value.",
  axes: {
    x: { label: "Week", domain: { scale: "time", min: "2026-06-01T00:00:00Z", max: "2026-07-13T00:00:00Z" }, tickFormat: "date" },
    y: { label: "Median response", unit: "hours", domain: { scale: "linear", min: 0, max: 16 } },
  },
  series: [
    {
      id: "observed",
      label: "Observed",
      kind: "line",
      selectable: true,
      editable: { y: true },
      source: { kind: "points", points: [
        { id: "week-1", x: "2026-06-01T00:00:00Z", y: 12.4 },
        { id: "week-2", x: "2026-06-08T00:00:00Z", y: 10.1 },
        { id: "week-3", x: "2026-06-15T00:00:00Z", y: 11.3 },
        { id: "week-4", x: "2026-06-22T00:00:00Z", y: 8.2 },
        { id: "week-5", x: "2026-06-29T00:00:00Z", y: 6.7 },
        { id: "week-6", x: "2026-07-06T00:00:00Z", y: 5.4 },
      ] },
    },
    {
      id: "target",
      label: "Target",
      kind: "line",
      source: { kind: "points", points: [
        { id: "start", x: "2026-06-01T00:00:00Z", y: 6 },
        { id: "end", x: "2026-07-13T00:00:00Z", y: 6 },
      ] },
    },
  ],
  table: { source: "series", caption: "Weekly response-time values", showSeriesColumn: true },
  interaction: { selection: "single", viewport: "fixed" },
};

const meta: Meta<typeof DataExplorer> = {
  title: "03 Representation domains/Data & coordinates/Data Explorer",
  component: DataExplorer,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(52rem, calc(100vw - 2rem))" }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof DataExplorer>;

export const FunctionExploration: Story = {
  args: {
    definition: quadratic,
    evaluateFunction: (source, x) => {
      const a = source.parameters?.a ?? 1;
      const b = source.parameters?.b ?? 0;
      return a * x * x + b;
    },
  },
  parameters: { docs: { description: { story: "A mathematical recipe using the same DataExplorer contract—not a duplicate FunctionExplorer component. The host owns safe expression evaluation." } } },
};

export const OperationalTimeSeries: Story = {
  args: { definition: operationalTrend, locale: "en-GB" },
  parameters: { docs: { description: { story: "A business/science time series with two distinguishable series, selectable observations, keyboard editing, and an equivalent editable table." } } },
};

export const Streaming: Story = { args: { streaming: true } };

export const Empty: Story = { args: {} };

export const Disabled: Story = { args: { definition: operationalTrend, disabled: true } };
