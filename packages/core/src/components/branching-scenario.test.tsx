import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DECISION_GRAPH_SCHEMA_VERSION, type DecisionGraphDefinition } from "@didact/schema";
import { BranchingScenario } from "./branching-scenario.js";

afterEach(cleanup);

const definition: DecisionGraphDefinition = {
  schemaVersion: DECISION_GRAPH_SCHEMA_VERSION, id: "procedure.test", title: "Procedure", startNodeId: "start", initialVariables: { ready: false }, navigation: { allowBacktrack: true, allowRestart: true }, nodes: [
    { id: "start", kind: "decision", body: "Choose the safe first action.", choices: [
      { id: "prepare", label: "Prepare the area", targetNodeId: "next", effects: [{ variable: "ready", operation: "set", value: true }], consequence: "The area is ready." },
      { id: "skip", label: "Skip preparation", targetNodeId: "failed" },
    ] },
    { id: "next", kind: "decision", body: "Continue.", choices: [{ id: "finish", label: "Finish safely", targetNodeId: "done", condition: { variable: "ready", operator: "truthy" } }] },
    { id: "done", kind: "outcome", body: "Complete.", outcome: { status: "completed", label: "Completed", feedback: "Preparation made the final action safe." } },
    { id: "failed", kind: "outcome", body: "Unsafe.", outcome: { status: "failed", label: "Unsafe" } },
  ],
};

describe("BranchingScenario", () => {
  it("moves through choices, applies effects and emits an unambiguous result", async () => {
    const user = userEvent.setup(); const onStateChange = vi.fn(); const onResult = vi.fn(); const onEvent = vi.fn();
    render(<BranchingScenario definition={definition} onStateChange={onStateChange} onResult={onResult} onEvent={onEvent} />);
    await user.click(screen.getByRole("button", { name: "Prepare the area" }));
    expect(screen.getByText("The area is ready.")).toBeVisible();
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ currentNodeId: "next", variables: { ready: true } }), expect.objectContaining({ type: "choice-selected" }));
    await user.click(screen.getByRole("button", { name: "Finish safely" }));
    expect(screen.getByText("Completed")).toBeVisible();
    expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({ status: "completed" }));
    expect(onEvent).toHaveBeenLastCalledWith({ type: "outcome-reached", nodeId: "done", outcome: "completed" });
  });
  it("restores variables and node when going back", async () => {
    const user = userEvent.setup(); render(<BranchingScenario definition={definition} />);
    await user.click(screen.getByRole("button", { name: "Prepare the area" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Choose the safe first action.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });
  it("restarts from an outcome", async () => {
    const user = userEvent.setup(); render(<BranchingScenario definition={definition} />);
    await user.click(screen.getByRole("button", { name: "Skip preparation" }));
    await user.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByText("Choose the safe first action.")).toBeVisible();
  });
  it("supports controlled state and disabled choices", () => {
    render(<BranchingScenario definition={definition} state={{ currentNodeId: "next", variables: { ready: false }, history: [] }} />);
    expect(screen.getByRole("button", { name: "Finish safely" })).toBeDisabled();
  });
  it("supports streaming and empty states", () => {
    const { rerender } = render(<BranchingScenario streaming />); expect(screen.getByRole("status")).toHaveTextContent("still loading");
    rerender(<BranchingScenario />); expect(screen.getByText("There is no scenario to display.")).toBeVisible();
  });
  it("has no detectable accessibility violations", async () => {
    const { container } = render(<BranchingScenario definition={definition} />); expect(await axe(container)).toHaveNoViolations();
  });
});
