import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { EvidenceAnnotation, type EvidenceAnnotationDefinition } from "./evidence-annotation.js";

afterEach(cleanup);

const definition: EvidenceAnnotationDefinition = {
  id: "history.source",
  title: "Evaluate the source",
  documentTitle: "Factory inquiry, 1842",
  segments: [
    { id: "s1", text: "The witness worked fourteen hours a day.", start: 0, end: 42 },
    { id: "s2", text: "The owner described the schedule as voluntary.", start: 43, end: 89 },
  ],
  categories: [{ id: "fact", label: "Factual evidence" }, { id: "perspective", label: "Perspective" }],
  claims: [{ id: "conditions", label: "Working conditions were harmful" }],
};

describe("EvidenceAnnotation", () => {
  it("creates stable segment annotations with category, claim and note", async () => {
    const user = userEvent.setup(); const onStateChange = vi.fn();
    render(<EvidenceAnnotation definition={definition} onStateChange={onStateChange} />);
    await user.selectOptions(screen.getByLabelText("Evidence type"), "perspective");
    await user.selectOptions(screen.getByLabelText("Related claim"), "conditions");
    await user.type(screen.getByLabelText("Reasoning note"), "The owner has an incentive to minimise harm.");
    await user.click(screen.getByRole("button", { name: /Select evidence: The owner/ }));
    expect(onStateChange).toHaveBeenCalledWith({ annotations: [expect.objectContaining({ segmentId: "s2", start: 0, end: 46, categoryId: "perspective", claimId: "conditions", note: "The owner has an incentive to minimise harm." })] });
  });

  it("offers a keyboard-friendly list that controls the same state", async () => {
    const user = userEvent.setup();
    render(<EvidenceAnnotation definition={definition} />);
    await user.click(screen.getByText("Select from a list"));
    const checkbox = screen.getByLabelText("The witness worked fourteen hours a day.");
    await user.click(checkbox); expect(checkbox).toBeChecked();
    expect(screen.getByRole("button", { name: /Remove evidence: The witness/ })).toHaveAttribute("aria-pressed", "true");
    await user.click(checkbox); expect(screen.getByText("No evidence selected yet.")).toBeVisible();
  });

  it("supports controlled state and removal without mutating it", async () => {
    const user = userEvent.setup(); const onStateChange = vi.fn();
    const state = { annotations: [{ id: "a1", segmentId: "s1", start: 0, end: 42, quote: "The witness worked fourteen hours a day.", categoryId: "fact" }] };
    render(<EvidenceAnnotation definition={definition} state={state} onStateChange={onStateChange} />);
    await user.click(screen.getByRole("button", { name: /Remove: The witness/ }));
    expect(onStateChange).toHaveBeenCalledWith({ annotations: [] });
    expect(screen.getByText("The witness worked fourteen hours a day.", { selector: "p" })).toBeVisible();
  });

  it("evaluates only after submission and is ungraded by default", async () => {
    const user = userEvent.setup(); const evaluate = vi.fn(async () => ({ status: "partial" as const, feedback: "Add evidence from another perspective." })); const onResult = vi.fn();
    const state = { annotations: [{ id: "a1", segmentId: "s1", start: 0, end: 42, quote: "The witness worked fourteen hours a day.", categoryId: "fact" }] };
    const { rerender } = render(<EvidenceAnnotation definition={definition} state={state} evaluate={evaluate} onResult={onResult} />);
    expect(evaluate).not.toHaveBeenCalled(); await user.click(screen.getByRole("button", { name: "Submit evidence" }));
    expect(evaluate).toHaveBeenCalledWith(state, definition); expect(await screen.findByText("Add evidence from another perspective.")).toBeVisible();
    rerender(<EvidenceAnnotation definition={definition} state={state} onResult={onResult} />); await user.click(screen.getByRole("button", { name: "Submit evidence" }));
    expect(onResult).toHaveBeenLastCalledWith({ status: "ungraded", state });
  });

  it("supports localized text, disabled, streaming and empty states", () => {
    const localized = { ...definition, title: { en: "Source", es: "Fuente" } };
    const { rerender } = render(<EvidenceAnnotation definition={localized} locale="es" disabled />);
    expect(screen.getByRole("heading", { name: "Fuente" })).toBeVisible(); expect(screen.getAllByRole("button", { name: /Select evidence/ })).toEqual(expect.arrayContaining([expect.any(HTMLButtonElement)]));
    expect(screen.getAllByRole("button", { name: /Select evidence/ }).every((button) => button.hasAttribute("disabled"))).toBe(true);
    rerender(<EvidenceAnnotation streaming />); expect(screen.getByRole("status")).toHaveTextContent("still loading");
    rerender(<EvidenceAnnotation />); expect(screen.getByText("There is no document to annotate.")).toBeVisible();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<EvidenceAnnotation definition={definition} />); expect(await axe(container)).toHaveNoViolations();
  });
});
