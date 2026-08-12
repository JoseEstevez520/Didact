import { describe, expect, it } from "vitest";

import {
  DATA_COORDINATE_SCHEMA_VERSION,
  validateDataCoordinateDefinition,
  validateDataCoordinateResult,
  validateDataCoordinateState,
  type DataCoordinateDefinition,
  type DataCoordinateResult,
  type DataCoordinateState,
} from "./data-coordinate";

const functionDefinition: DataCoordinateDefinition = {
  schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
  id: "mathematics.quadratic",
  title: { en: "Explore a quadratic", es: "Explora una cuadrática" },
  description: "Change parameters and inspect the resulting curve.",
  axes: {
    x: { label: "x", domain: { scale: "linear", min: -5, max: 5 }, tickFormat: "number" },
    y: { label: "f(x)", domain: { scale: "linear", min: -10, max: 30 } },
  },
  series: [
    {
      id: "quadratic",
      label: "f(x) = ax² + b",
      kind: "line",
      source: {
        kind: "function",
        expression: "a * x ^ 2 + b",
        variable: "x",
        parameters: { a: 1, b: 0 },
        domain: { scale: "linear", min: -4, max: 4 },
        sampleCount: 81,
      },
    },
  ],
  table: { source: "series", caption: "Sampled values of the quadratic" },
  interaction: { selection: "single", viewport: "controlled" },
};

const timeSeriesDefinition: DataCoordinateDefinition = {
  schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
  id: "business.quarterly-revenue",
  title: "Quarterly revenue",
  axes: {
    x: {
      label: "Quarter",
      domain: { scale: "time", min: "2025-01-01T00:00:00Z", max: "2025-12-31T23:59:59Z" },
      tickFormat: "date",
    },
    y: { label: "Revenue", unit: "EUR", domain: { scale: "linear", min: 0, max: 1_000_000 } },
  },
  series: [
    {
      id: "actual",
      label: "Actual",
      kind: "line",
      selectable: true,
      source: {
        kind: "points",
        points: [
          { id: "q1", x: "2025-03-31T00:00:00Z", y: 420_000, selectable: true },
          { id: "q2", x: "2025-06-30T00:00:00Z", y: 510_000 },
        ],
      },
    },
    {
      id: "forecast",
      label: "Forecast",
      kind: "scatter",
      editable: { y: true },
      source: {
        kind: "points",
        points: [
          { id: "q3", x: "2025-09-30T00:00:00Z", y: 600_000, editable: { y: true } },
        ],
      },
    },
  ],
  table: {
    source: "series",
    caption: "Revenue values represented by the chart",
    includeSeriesIds: ["actual", "forecast"],
    showSeriesColumn: true,
  },
};

describe("validateDataCoordinateDefinition", () => {
  it("accepts a complete declarative mathematical function", () => {
    expect(validateDataCoordinateDefinition(functionDefinition)).toEqual({
      success: true,
      data: functionDefinition,
      issues: [],
    });
  });

  it("accepts time-series and scatter data on the same coordinate model", () => {
    expect(validateDataCoordinateDefinition(timeSeriesDefinition)).toEqual({
      success: true,
      data: timeSeriesDefinition,
      issues: [],
    });
    expect(JSON.parse(JSON.stringify(timeSeriesDefinition))).toEqual(timeSeriesDefinition);
  });

  it("keeps the table tied to existing series rather than accepting separate rows", () => {
    const result = validateDataCoordinateDefinition({
      ...timeSeriesDefinition,
      table: { source: "rows", caption: "Duplicated data", includeSeriesIds: ["missing", "missing"] },
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("data-coordinate.table-source");
    expect(codes).toContain("data-coordinate.table-series-missing");
    expect(codes).toContain("data-coordinate.table-series-duplicate");
  });

  it("validates scale-specific domains and datum values", () => {
    const result = validateDataCoordinateDefinition({
      ...timeSeriesDefinition,
      axes: {
        x: { label: "Time", domain: { scale: "time", min: "tomorrow-ish", max: "2025-01-01T00:00:00Z" } },
        y: { label: "Value", domain: { scale: "linear", min: 10, max: 0 } },
      },
      series: [{
        id: "broken",
        label: "Broken",
        kind: "scatter",
        source: { kind: "points", points: [{ id: "datum", x: 3, y: "high" }] },
      }],
      table: { source: "series", caption: "Values" },
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("data-coordinate.time-min");
    expect(codes).toContain("data-coordinate.domain-order");
    // Invalid domains do not provide a reliable scale for cascading datum errors.
    expect(result.success).toBe(false);
  });

  it("rejects time axes for mathematical function sources", () => {
    const result = validateDataCoordinateDefinition({
      ...functionDefinition,
      axes: { ...functionDefinition.axes, x: timeSeriesDefinition.axes.x },
    });
    expect(result.issues.some(({ code }) => code === "data-coordinate.function-scale")).toBe(true);
  });

  it("rejects malformed functions, duplicate identities and unsafe sample counts", () => {
    const malformed = {
      ...functionDefinition.series[0],
      source: {
        kind: "function",
        expression: "",
        variable: "x-value",
        parameters: { valid: Number.POSITIVE_INFINITY, "not valid": 2 },
        domain: { scale: "linear", min: 2, max: 2 },
        sampleCount: 100_000,
      },
    };
    const result = validateDataCoordinateDefinition({
      ...functionDefinition,
      series: [malformed, { ...malformed }],
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("data-coordinate.expression");
    expect(codes).toContain("data-coordinate.variable");
    expect(codes).toContain("data-coordinate.parameters");
    expect(codes).toContain("data-coordinate.domain-order");
    expect(codes).toContain("data-coordinate.sample-count");
    expect(codes).toContain("data-coordinate.series-duplicate");
  });

  it("rejects duplicate points and coordinate types that disagree with valid axes", () => {
    const result = validateDataCoordinateDefinition({
      ...timeSeriesDefinition,
      series: [{
        id: "observations",
        label: "Observations",
        kind: "scatter",
        source: {
          kind: "points",
          points: [
            { id: "same", x: 10, y: "not-a-number" },
            { id: "same", x: "2025-04-01T00:00:00Z", y: 2 },
          ],
        },
      }],
      table: { source: "series", caption: "Observations" },
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("data-coordinate.time-value");
    expect(codes).toContain("data-coordinate.linear-value");
    expect(codes).toContain("data-coordinate.point-duplicate");
  });

  it("requires the accessible equivalent and meaningful content in complete mode", () => {
    const result = validateDataCoordinateDefinition({
      schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
      id: "empty.chart",
      axes: {
        x: { label: "x", domain: { scale: "linear", min: 0, max: 1 } },
        y: { label: "y", domain: { scale: "linear", min: 0, max: 1 } },
      },
      series: [],
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("data-coordinate.title");
    expect(codes).toContain("data-coordinate.series-empty");
    expect(codes).toContain("data-coordinate.table");
  });

  it("accepts partial progressive authoring data in streaming mode", () => {
    expect(validateDataCoordinateDefinition({
      schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
      id: "draft.chart",
      series: [],
    }, { mode: "streaming" })).toEqual({
      success: true,
      data: {
        schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
        id: "draft.chart",
        series: [],
      },
      issues: [],
    });
  });
});

describe("controlled data-coordinate state", () => {
  const state: DataCoordinateState = {
    selectedDatum: { seriesId: "forecast", datumId: "q3" },
    pointOverrides: [{ seriesId: "forecast", datumId: "q3", y: 625_000 }],
    viewport: {
      x: { scale: "time", min: "2025-04-01T00:00:00Z", max: "2025-12-31T00:00:00Z" },
      y: { scale: "linear", min: 300_000, max: 700_000 },
    },
  };

  it("accepts serializable selection, point overrides and viewport", () => {
    expect(validateDataCoordinateState(state)).toEqual({ success: true, data: state, issues: [] });
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it("rejects empty or duplicate overrides and invalid viewport domains", () => {
    const result = validateDataCoordinateState({
      pointOverrides: [
        { seriesId: "forecast", datumId: "q3" },
        { seriesId: "forecast", datumId: "q3", y: Number.NaN },
      ],
      viewport: {
        x: { scale: "time", min: "invalid", max: "also-invalid" },
        y: { scale: "linear", min: 5, max: 1 },
      },
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("data-coordinate.override-empty");
    expect(codes).toContain("data-coordinate.override-duplicate");
    expect(codes).toContain("data-coordinate.override-y");
    expect(codes).toContain("data-coordinate.time-min");
    expect(codes).toContain("data-coordinate.domain-order");
  });
});

describe("data-coordinate interaction results", () => {
  it("records basic events without assigning pedagogical correctness", () => {
    const result: DataCoordinateResult = {
      status: "ungraded",
      state: { pointOverrides: [] },
      events: [
        { type: "selection-changed", selectedDatum: { seriesId: "actual", datumId: "q1" } },
        { type: "point-overridden", override: { seriesId: "forecast", datumId: "q3", y: 625_000 } },
        {
          type: "viewport-changed",
          viewport: {
            x: { scale: "linear", min: 0, max: 10 },
            y: { scale: "linear", min: -5, max: 5 },
          },
        },
      ],
    };
    expect(validateDataCoordinateResult(result)).toEqual({ success: true, data: result, issues: [] });
    expect(result).not.toHaveProperty("score");
  });

  it("refuses graded foundation results and malformed events", () => {
    const result = validateDataCoordinateResult({
      status: "correct",
      state: { pointOverrides: [] },
      events: [
        { type: "point-overridden", override: { seriesId: "actual", datumId: "q1" } },
        { type: "graded", score: 1 },
      ],
    });
    const codes = result.issues.map(({ code }) => code);
    expect(codes).toContain("data-coordinate.result-status");
    expect(codes).toContain("data-coordinate.override-empty");
    expect(codes).toContain("data-coordinate.event-type");
  });
});
