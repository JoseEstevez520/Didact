import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DATA_COORDINATE_SCHEMA_VERSION, type DataCoordinateDefinition } from "@didact/schema";

import { DataExplorer } from "./data-explorer.js";

afterEach(cleanup);

const definition: DataCoordinateDefinition = {
  schemaVersion: DATA_COORDINATE_SCHEMA_VERSION,
  id: "revenue-trend",
  title: "Quarterly revenue",
  description: "Explore the reported values.",
  axes: {
    x: { label: "Quarter", domain: { scale: "linear", min: 1, max: 4 } },
    y: { label: "Revenue", unit: "€m", domain: { scale: "linear", min: 0, max: 100 } },
  },
  series: [{
    id: "actual",
    label: "Actual",
    kind: "line",
    selectable: true,
    editable: { y: true },
    source: { kind: "points", points: [
      { id: "q1", x: 1, y: 42 },
      { id: "q2", x: 2, y: 58 },
      { id: "q3", x: 3, y: 71 },
    ] },
  }],
  table: { source: "series", caption: "Quarterly revenue data", showSeriesColumn: true },
  interaction: { selection: "single", viewport: "fixed" },
};

describe("DataExplorer", () => {
  it("renders axes, series, and accessible point controls", () => {
    render(<DataExplorer definition={definition} />);

    expect(screen.getByRole("heading", { name: "Quarterly revenue" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Interactive chart for Quarterly revenue" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actual: 1, 42" })).toBeInTheDocument();
    expect(document.querySelector("path")).toHaveAttribute("d", expect.stringContaining("L"));
  });

  it("selects a point with the keyboard and reports serializable state", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    const onResult = vi.fn();
    render(<DataExplorer definition={definition} onStateChange={onStateChange} onResult={onResult} />);

    const point = screen.getByRole("button", { name: "Actual: 2, 58" });
    point.focus();
    await user.keyboard("{Enter}");

    expect(point).toHaveAttribute("aria-pressed", "true");
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ selectedDatum: { seriesId: "actual", datumId: "q2" } }),
      { type: "selection-changed", selectedDatum: { seriesId: "actual", datumId: "q2" } },
    );
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ status: "ungraded" }));
  });

  it("edits the same point state from chart keyboard and table input", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    render(<DataExplorer definition={definition} onStateChange={onStateChange} />);

    const point = screen.getByRole("button", { name: "Actual: 1, 42" });
    point.focus();
    await user.keyboard("{ArrowUp}");
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ pointOverrides: [expect.objectContaining({ seriesId: "actual", datumId: "q1", y: 43 })] }),
      expect.objectContaining({ type: "point-overridden" }),
    );

    await user.click(screen.getByRole("tab", { name: "Data table" }));
    const table = screen.getByRole("table", { name: "Quarterly revenue data" });
    const input = within(table).getAllByLabelText("Edit Revenue", { selector: "input" })[0]!;
    fireEvent.change(input, { target: { value: "55" } });
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pointOverrides: expect.arrayContaining([expect.objectContaining({ datumId: "q1", y: 55 })]) }),
      expect.objectContaining({ type: "point-overridden" }),
    );
  });

  it("samples function sources only through the host evaluator", () => {
    const functionDefinition: DataCoordinateDefinition = {
      ...definition,
      id: "quadratic",
      title: "Quadratic function",
      series: [{ id: "curve", label: "f(x)", kind: "line", source: { kind: "function", expression: "a*x*x", parameters: { a: 2 }, sampleCount: 5 } }],
    };
    const evaluator = vi.fn((source: { parameters?: Readonly<Record<string, number>> }, x: number) => (source.parameters?.a ?? 1) * x * x);
    render(<DataExplorer definition={functionDefinition} evaluateFunction={evaluator} />);

    expect(evaluator).toHaveBeenCalledTimes(5);
    expect(screen.getByRole("group", { name: "Interactive chart for Quadratic function" }).querySelector("path")).toBeInTheDocument();
  });

  it("supports streaming, empty, and disabled states", () => {
    const { rerender, unmount } = render(<DataExplorer streaming />);
    expect(screen.getByRole("status")).toHaveTextContent("still loading");

    rerender(<DataExplorer />);
    expect(screen.getByText("There is no data to display yet.")).toBeInTheDocument();

    unmount();
    render(<DataExplorer definition={definition} disabled initialView="table" />);
    expect(screen.getAllByRole("button").filter((button) => button.hasAttribute("disabled")).length).toBeGreaterThan(0);
  });

  it("has no automatically detectable accessibility violations in either representation", async () => {
    const { container } = render(<DataExplorer definition={definition} />);
    expect(await axe(container)).toHaveNoViolations();

    await userEvent.click(screen.getByRole("tab", { name: "Data table" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
