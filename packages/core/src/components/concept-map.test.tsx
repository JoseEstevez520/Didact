import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { ConceptMap, type ConceptMapDefinition, type ConceptMapState } from "./concept-map.js";

afterEach(cleanup);

const definition: ConceptMapDefinition = {
  id: "ecosystem",
  title: "Ecosystem relationships",
  instructions: "Connect each concept with a meaningful relationship.",
  nodes: [
    { id: "sun", label: "Sun", position: { x: 20, y: 30 } },
    { id: "plant", label: "Plant", position: { x: 50, y: 60 } },
    { id: "rabbit", label: "Rabbit", position: { x: 80, y: 30 } },
  ],
  relationLabels: ["provides energy to", "is eaten by"],
  allowNodeCreation: true,
  allowRelationRemoval: true,
  evaluation: { enabled: true },
};

describe("ConceptMap", () => {
  it("creates and removes a labeled connection through textual controls", async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    render(<ConceptMap definition={definition} onStateChange={onStateChange} />);
    await user.selectOptions(screen.getByLabelText("Relationship"), "provides energy to");
    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(screen.getByText(/Sun — provides energy to.*Plant/)).toBeVisible();
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ relations: [expect.objectContaining({ from: "sun", to: "plant" })] }), expect.objectContaining({ type: "relation-added" }));
    await user.click(screen.getByRole("button", { name: /Remove connection Sun/ }));
    expect(screen.getByText("No connections yet.")).toBeVisible();
  });

  it("adds learner concepts and undo restores the previous state", async () => {
    const user = userEvent.setup();
    render(<ConceptMap definition={definition} />);
    await user.type(screen.getByLabelText("Add a concept"), "Decomposer");
    await user.click(screen.getByRole("button", { name: "Add concept" }));
    expect(screen.getAllByText("Decomposer").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.queryByText("Decomposer")).not.toBeInTheDocument();
  });

  it("does not expose evaluation feedback before submission", async () => {
    const user = userEvent.setup();
    const evaluate = vi.fn(() => ({ status: "partial" as const, feedback: "One relationship is still missing." }));
    const onResult = vi.fn();
    render(<ConceptMap definition={definition} evaluate={evaluate} onResult={onResult} />);
    expect(screen.queryByText("One relationship is still missing.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check map" }));
    expect(screen.getByText("One relationship is still missing.")).toBeVisible();
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ status: "partial" }));
  });

  it("supports controlled and disabled state", () => {
    const state: ConceptMapState = { nodes: definition.nodes, relations: [] };
    render(<ConceptMap definition={definition} state={state} disabled />);
    expect(screen.getByRole("button", { name: "Connect" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Check map" })).toBeDisabled();
  });

  it("supports streaming and empty states", () => {
    const { rerender } = render(<ConceptMap streaming />);
    expect(screen.getByRole("status")).toHaveTextContent("still loading");
    rerender(<ConceptMap />);
    expect(screen.getByText("There is no concept map to display.")).toBeVisible();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ConceptMap definition={definition} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
