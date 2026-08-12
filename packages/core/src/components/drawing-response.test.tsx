import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DrawingResponse, type DrawingResponseDefinition } from "./drawing-response.js";

afterEach(cleanup);

const definition: DrawingResponseDefinition = {
  id: "geometry.vector",
  title: "Draw a vector",
  instructions: "Draw a line from the origin to the target.",
};

describe("DrawingResponse", () => {
  it("captures normalized pointer strokes in serializable state", () => {
    const onStateChange = vi.fn();
    render(<DrawingResponse definition={definition} onStateChange={onStateChange} />);
    const canvas = screen.getByRole("img", { name: "Drawing response" });
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({ left: 10, top: 20, width: 500, height: 300, right: 510, bottom: 320, x: 10, y: 20, toJSON: () => ({}) });
    fireEvent.pointerDown(canvas, { pointerId: 1, button: 0, clientX: 110, clientY: 80 });
    fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 260, clientY: 170 });
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ strokes: [expect.objectContaining({ tool: "freehand", points: expect.arrayContaining([expect.objectContaining({ x: 0.2, y: 0.2 })]) })] }));
  });

  it("offers coordinate and keyboard alternatives to pointer drawing", async () => {
    const user = userEvent.setup();
    render(<DrawingResponse definition={definition} />);
    await user.click(screen.getByText("Add by coordinates"));
    await user.clear(screen.getByLabelText("Horizontal position (%)")); await user.type(screen.getByLabelText("Horizontal position (%)"), "25");
    await user.clear(screen.getByLabelText("Vertical position (%)")); await user.type(screen.getByLabelText("Vertical position (%)"), "75");
    await user.click(screen.getByRole("button", { name: "Add marker" }));
    expect(screen.getByText(/25%, 75%/)).toBeVisible();
    screen.getByRole("img").focus(); fireEvent.keyDown(screen.getByRole("img"), { key: "ArrowRight" }); fireEvent.keyDown(screen.getByRole("img"), { key: " " });
    expect(screen.getAllByText(/Mark \d/)).toHaveLength(2);
  });

  it("supports undo, clear and controlled state", async () => {
    const user = userEvent.setup(); const onStateChange = vi.fn();
    const state = { strokes: [{ id: "one", tool: "marker" as const, points: [{ x: 0.5, y: 0.5 }] }] };
    render(<DrawingResponse definition={definition} state={state} onStateChange={onStateChange} />);
    await user.click(screen.getByRole("button", { name: "Undo" })); expect(onStateChange).toHaveBeenCalledWith({ strokes: [] });
    expect(screen.getByText("Mark 1")).toBeVisible();
  });

  it("only evaluates after explicit submission and can remain ungraded", async () => {
    const user = userEvent.setup(); const evaluate = vi.fn(async () => ({ status: "partial" as const, feedback: "The direction is right; extend the line." })); const onResult = vi.fn();
    const state = { strokes: [{ id: "one", tool: "line" as const, points: [{ x: 0, y: 1 }, { x: 1, y: 0 }] }] };
    const { rerender } = render(<DrawingResponse definition={definition} state={state} evaluate={evaluate} onResult={onResult} />);
    expect(evaluate).not.toHaveBeenCalled(); await user.click(screen.getByRole("button", { name: "Submit response" }));
    expect(evaluate).toHaveBeenCalledWith(state.strokes); expect(await screen.findByText("The direction is right; extend the line.")).toBeVisible();
    rerender(<DrawingResponse definition={definition} state={state} onResult={onResult} />); await user.click(screen.getByRole("button", { name: "Submit response" })); expect(onResult).toHaveBeenLastCalledWith({ status: "ungraded", strokes: state.strokes });
  });

  it("supports disabled, streaming and empty states", () => {
    const { rerender } = render(<DrawingResponse definition={definition} disabled />); expect(screen.getByRole("button", { name: "Draw" })).toBeDisabled();
    rerender(<DrawingResponse streaming />); expect(screen.getByRole("status")).toHaveTextContent("still loading");
    rerender(<DrawingResponse />); expect(screen.getByText("There is no drawing activity to display.")).toBeVisible();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<DrawingResponse definition={definition} />); expect(await axe(container)).toHaveNoViolations();
  });
});
