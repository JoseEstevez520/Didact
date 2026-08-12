import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { WordBank, type WordBankValue } from "./word-bank.js";

afterEach(cleanup);

const gaps = [
  { id: "subject", before: "The cat", after: "on the sofa.", accessibleLabel: "Verb gap", correctOptionIds: ["sits"] },
  { id: "place", before: "The cat sits", after: "the sofa.", accessibleLabel: "Preposition gap", correctOptionIds: ["on"] },
] as const;

const options = [
  { id: "sits", content: "sits", accessibleLabel: "sits" },
  { id: "on", content: "on", accessibleLabel: "on" },
  { id: "under", content: "under", accessibleLabel: "under" },
] as const;

async function assign(user: ReturnType<typeof userEvent.setup>, gap: RegExp, option: string) {
  await user.click(screen.getByRole("button", { name: gap }));
  await user.click(screen.getByRole("button", { name: new RegExp(`^${option},`) }));
}

describe("WordBank", () => {
  it("assigns bank options to stable gaps and reveals correctness only after submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<WordBank title="Complete the sentences" gaps={gaps} options={options} onSubmit={onSubmit} />);

    expect(screen.getAllByText("····")).toHaveLength(2);
    expect(screen.queryByText("Empty")).not.toBeInTheDocument();
    const inlineGap = screen.getByRole("button", { name: /Verb gap: Empty/ });
    expect(inlineGap.parentElement).toHaveTextContent("The cat····on the sofa.");
    expect(screen.queryByText("___")).not.toBeInTheDocument();

    await assign(user, /Verb gap: Empty/, "sits");
    await assign(user, /Preposition gap: Empty/, "on");
    expect(screen.queryByText("Correct")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Check answers" }));
    expect(screen.getByText("All answers are correct.")).toBeInTheDocument();
    expect(screen.getAllByText("Correct")).toHaveLength(2);
    expect(onSubmit).toHaveBeenCalledWith({
      value: { subject: "sits", place: "on" },
      status: "correct",
      gaps: { subject: "correct", place: "correct" },
    });
  });

  it("supports option-first keyboard selection, undo, and clear", async () => {
    const user = userEvent.setup();
    render(<WordBank title="Grammar" gaps={gaps} options={options} />);

    const option = screen.getByRole("button", { name: /^sits,/ });
    option.focus();
    await user.keyboard("{Enter}");
    const gap = screen.getByRole("button", { name: /Verb gap: Empty/ });
    gap.focus();
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: /Verb gap: sits/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: /Verb gap: Empty/ })).toBeInTheDocument();
    await assign(user, /Verb gap: Empty/, "sits");
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.getByRole("button", { name: /Verb gap: Empty/ })).toBeInTheDocument();
  });

  it("enforces declared option cardinality and permits explicit reuse", async () => {
    const user = userEvent.setup();
    const repeatedGaps = [
      { id: "a", before: "A", accessibleLabel: "Gap A", correctOptionIds: ["same"] },
      { id: "b", before: "B", accessibleLabel: "Gap B", correctOptionIds: ["same"] },
    ];
    const { rerender } = render(
      <WordBank title="Cardinality" gaps={repeatedGaps} options={[{ id: "same", content: "same", accessibleLabel: "same" }]} />,
    );
    await assign(user, /Gap A: Empty/, "same");
    expect(screen.getByRole("button", { name: /^same,/ })).toBeDisabled();

    rerender(
      <WordBank title="Cardinality" gaps={repeatedGaps} options={[{ id: "same", content: "same", accessibleLabel: "same", maxUses: 2 }]} />,
    );
    await assign(user, /Gap B: Empty/, "same");
    expect(screen.getByRole("button", { name: "Check answers" })).toBeEnabled();
  });

  it("supports a controlled response", async () => {
    const user = userEvent.setup();
    const changes = vi.fn();
    function Controlled() {
      const [value, setValue] = React.useState<WordBankValue>({});
      return (
        <WordBank
          title="Controlled"
          gaps={[gaps[0]]}
          options={options}
          value={value}
          onValueChange={(next) => { changes(next); setValue(next); }}
        />
      );
    }
    render(<Controlled />);
    await assign(user, /Verb gap: Empty/, "sits");
    expect(changes).toHaveBeenLastCalledWith({ subject: "sits" });
    expect(screen.getByRole("button", { name: /Verb gap: sits/ })).toBeInTheDocument();
  });

  it("reports mixed graded and human-reviewed gaps as partial", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <WordBank
        title="Mixed evaluation"
        gaps={[gaps[0], { id: "open", before: "Choose the best tone:", accessibleLabel: "Tone gap" }]}
        options={options}
        onSubmit={onSubmit}
      />,
    );
    await assign(user, /Verb gap: Empty/, "sits");
    await assign(user, /Tone gap: Empty/, "on");
    await user.click(screen.getByRole("button", { name: "Check answers" }));
    expect(screen.getByText("Some answers are correct.")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      status: "partial",
      gaps: { subject: "correct", open: "ungraded" },
    }));
  });

  it("keeps empty and partial streaming content inert", () => {
    const { rerender } = render(<WordBank />);
    expect(screen.getByText("No gaps yet.")).toBeInTheDocument();
    expect(screen.getByText("No options yet.")).toBeInTheDocument();

    rerender(<WordBank gaps={[{ id: "pending" }]} options={[{ id: "pending" }]} />);
    expect(screen.getByText("This gap is still loading.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gap 1 of 1: Empty/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^Option 1 of 1,/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Check answers" })).toBeDisabled();
  });

  it("localizes labels and disables the complete interaction", () => {
    render(
      <WordBank
        title="Frances"
        gaps={[gaps[0]]}
        options={options}
        disabled
        labels={{ bank: "Banco de palabras", submit: "Comprobar", clear: "Vaciar" }}
      />,
    );
    expect(screen.getByText("Banco de palabras")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verb gap: Empty/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Comprobar" })).toBeDisabled();
  });

  it("has no accessibility violations before and after feedback", async () => {
    const user = userEvent.setup();
    const { container } = render(<WordBank title="Accessible grammar" gaps={gaps} options={options} />);
    expect(await axe(container)).toHaveNoViolations();
    await assign(user, /Verb gap: Empty/, "sits");
    await assign(user, /Preposition gap: Empty/, "on");
    await user.click(screen.getByRole("button", { name: "Check answers" }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("drops an option into the inline gap using the same response mapping", async () => {
    const pointerEvent = window.PointerEvent;
    class TestPointerEvent extends MouseEvent {
      readonly pointerId: number;
      readonly isPrimary: boolean;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.isPrimary = init.isPrimary ?? true;
      }
    }
    Object.defineProperty(window, "PointerEvent", { configurable: true, value: TestPointerEvent });
    const onValueChange = vi.fn();
    const { container } = render(
      <WordBank title="Drag words" gaps={[gaps[0]]} options={options} onValueChange={onValueChange} />,
    );
    const draggable = container.querySelector<HTMLElement>('[data-drag-option-id="sits"]')!;
    const destination = container.querySelector<HTMLElement>('[data-gap-id="subject"]')!;
    expect(destination.tagName).toBe("BUTTON");
    expect(destination.parentElement).toHaveTextContent("The cat····on the sofa.");
    vi.spyOn(draggable, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 80, bottom: 40, width: 80, height: 40, toJSON: () => ({}),
    });
    vi.spyOn(destination, "getBoundingClientRect").mockReturnValue({
      x: 100, y: 0, left: 100, top: 0, right: 300, bottom: 100, width: 200, height: 100, toJSON: () => ({}),
    });

    fireEvent.pointerDown(draggable, { pointerId: 1, isPrimary: true, button: 0, clientX: 20, clientY: 20 });
    fireEvent.pointerMove(document, { pointerId: 1, isPrimary: true, buttons: 1, clientX: 140, clientY: 30 });
    await waitFor(() => expect(draggable.style.transform).not.toBe(""));
    fireEvent.pointerMove(document, { pointerId: 1, isPrimary: true, buttons: 1, clientX: 150, clientY: 35 });
    await waitFor(() => expect(destination).toHaveAttribute("data-drop-active", "true"));
    fireEvent.pointerUp(document, { pointerId: 1, isPrimary: true, button: 0, clientX: 140, clientY: 30 });

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith({ subject: "sits" }));
    if (pointerEvent) Object.defineProperty(window, "PointerEvent", { configurable: true, value: pointerEvent });
    else Reflect.deleteProperty(window, "PointerEvent");
  });
});
