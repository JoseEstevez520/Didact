import {
  DATA_COORDINATE_SCHEMA_VERSION,
  type DataCoordinateDefinition,
} from "@didact/schema";

/** A declarative function recipe. The consumer injects a safe expression evaluator. */
export const linearFunctionFixture = {
  schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
  id: "fixture.linear-function",
  title: "Explore the function y = 2x + 1",
  description: "Inspect how slope and intercept determine coordinate pairs on a line.",
  axes: {
    x: { label: "Input x", domain: { scale: "linear", min: -3, max: 3 }, tickFormat: "number" },
    y: { label: "Output y", domain: { scale: "linear", min: -6, max: 8 }, tickFormat: "number" },
  },
  series: [{
    id: "linear-function",
    label: "y = 2x + 1",
    kind: "line",
    source: {
      kind: "function",
      expression: "m * x + b",
      variable: "x",
      parameters: { m: 2, b: 1 },
      domain: { scale: "linear", min: -3, max: 3 },
      sampleCount: 25,
    },
  }],
  table: { source: "series", caption: "Coordinate pairs for y = 2x + 1", showSeriesColumn: false },
  interaction: { selection: "single", viewport: "fixed" },
} as const satisfies DataCoordinateDefinition;

/** A business time-series recipe with deliberately different scale and data semantics. */
export const monthlyRevenueFixture = {
  schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
  id: "fixture.monthly-revenue",
  title: "Inspect the quarterly revenue trend",
  description: "Select a month and compare how revenue changes during the quarter.",
  axes: {
    x: {
      label: "Month",
      domain: { scale: "time", min: "2026-01-01T00:00:00.000Z", max: "2026-04-01T00:00:00.000Z" },
      tickFormat: "date",
    },
    y: { label: "Revenue", unit: "EUR", domain: { scale: "linear", min: 0, max: 160_000 }, tickFormat: "number" },
  },
  series: [{
    id: "revenue",
    label: "Monthly revenue",
    kind: "line",
    selectable: true,
    source: {
      kind: "points",
      points: [
        { id: "january", x: "2026-01-01T00:00:00.000Z", y: 82_000, label: "January" },
        { id: "february", x: "2026-02-01T00:00:00.000Z", y: 106_000, label: "February" },
        { id: "march", x: "2026-03-01T00:00:00.000Z", y: 142_000, label: "March" },
      ],
    },
  }],
  table: { source: "series", caption: "Monthly revenue values", includeSeriesIds: ["revenue"], showSeriesColumn: true },
  interaction: { selection: "single", viewport: "controlled" },
} as const satisfies DataCoordinateDefinition;

export const dataCoordinateFixtures = [
  linearFunctionFixture,
  monthlyRevenueFixture,
] as const satisfies readonly DataCoordinateDefinition[];
