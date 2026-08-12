import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { EquationWorkbench, type EquationWorkbenchDefinition } from "./equation-workbench.js";

afterEach(cleanup);

const definition: EquationWorkbenchDefinition = {
  id: "algebra.linear",
  title: "Solve the equation",
  instructions: "Record each transformation, then provide the final value.",
  initialExpression: "3x + 6 = 18",
};

describe("EquationWorkbench", () => {
  it("creates, edits, orders and removes transformation steps", async () => {
    const user = userEvent.setup();
    render(<EquationWorkbench definition={definition} />);
    await user.click(screen.getByRole("button", { name: "Add transformation step" }));
    await user.type(screen.getByLabelText("Expression"), "3x = 12");
    await user.click(screen.getByRole("button", { name: "Add transformation step" }));
    const expressions = screen.getAllByLabelText("Expression");
    await user.type(expressions[1]!, "x = 4");
    await user.click(screen.getByRole("button", { name: "Move step up: Step 2" }));
    expect(screen.getAllByLabelText("Expression").map((input) => (input as HTMLInputElement).value)).toEqual(["x = 4", "3x = 12"]);
    await user.click(screen.getByRole("button", { name: "Remove step: Step 2" }));
    expect(screen.getAllByLabelText("Expression")).toHaveLength(1);
  });

  it("supports controlled state without mutating it", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    const state = { steps: [{ id: "one", expression: "3x = 12" }], finalAnswer: "" };
    render(<EquationWorkbench definition={definition} state={state} onStateChange={onStateChange} />);
    await user.type(screen.getByLabelText("Final answer"), "4");
    expect(onStateChange).toHaveBeenLastCalledWith({ ...state, finalAnswer: "4" });
    expect(screen.getByLabelText("Final answer")).toHaveValue("");
  });

  it("delegates rendering and evaluation to the host only after submit", async () => {
    const user = userEvent.setup();
    const evaluate = vi.fn(async () => ({ status: "correct" as const, feedback: "Valid transformation chain." }));
    const renderEquation = vi.fn(({ expression }: { expression: string }) => <span data-testid="math">Rendered: {expression}</span>);
    const state = { steps: [{ id: "one", expression: "3x = 12" }], finalAnswer: "x = 4" };
    render(<EquationWorkbench definition={definition} state={state} evaluate={evaluate} renderEquation={renderEquation} />);
    expect(evaluate).not.toHaveBeenCalled();
    expect(screen.queryByText("Valid transformation chain.")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("math")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Submit work" }));
    expect(evaluate).toHaveBeenCalledWith(state, definition);
    expect(await screen.findByText("Valid transformation chain.")).toBeVisible();
  });

  it("does not infer string equivalence and submits ungraded without an evaluator", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    render(<EquationWorkbench definition={definition} defaultState={{ steps: [], finalAnswer: "x = 4" }} onResult={onResult} />);
    expect(screen.queryByText("Work submitted")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit work" }));
    expect(onResult).toHaveBeenCalledWith({ status: "ungraded", steps: [], finalAnswer: "x = 4" });
    expect(screen.getByText("Work submitted")).toBeVisible();
  });

  it("supports localized labels plus disabled, streaming and empty states", () => {
    const { rerender } = render(<EquationWorkbench definition={definition} disabled labels={{ finalAnswer: "Resultado", submit: "Entregar" }} />);
    expect(screen.getByLabelText("Resultado")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Entregar" })).toBeDisabled();
    rerender(<EquationWorkbench streaming />);
    expect(screen.getByRole("status")).toHaveTextContent("still loading");
    rerender(<EquationWorkbench />);
    expect(screen.getByText("There is no equation activity to display.")).toBeVisible();
  });

  it("exposes usable native controls and has no detectable accessibility violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<EquationWorkbench definition={definition} defaultState={{ steps: [{ id: "one", expression: "3x = 12" }], finalAnswer: "x = 4" }} />);
    const workbench = screen.getByRole("region", { name: "Solve the equation" });
    const remove = within(workbench).getByRole("button", { name: "Remove step: Step 1" });
    expect(remove).toBeVisible();
    await user.tab();
    expect(document.activeElement).toBe(remove);
    await user.tab();
    expect(document.activeElement).toBeInstanceOf(HTMLInputElement);
    expect(await axe(container)).toHaveNoViolations();
  });
});
