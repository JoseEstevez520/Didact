import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { PracticeSet, type PracticeSetItem } from "./practice-set.js";

afterEach(cleanup);

const items: PracticeSetItem<string, { correct: boolean }>[] = [
  {
    id: "one",
    title: "Capital of France",
    canSubmit: (response) => Boolean(response),
    evaluate: (response) => ({ correct: response === "Paris" }),
    feedback: (result) => result?.correct ? "Paris is the capital city." : "Review the map of France.",
    render: ({ phase, response, result, setResponse, disabled }) => <div>
      <label htmlFor="answer">Answer</label>
      <input id="answer" value={response ?? ""} disabled={disabled} onChange={(event) => setResponse(event.target.value)} />
      {phase === "review" ? <p>{result?.correct ? "Correct" : "Not yet"}</p> : null}
    </div>,
  },
  { id: "two", title: "Name a primary color", render: () => <p>Think of one.</p> },
];

describe("PracticeSet", () => {
  it("does not evaluate or reveal feedback before submission", async () => {
    const evaluate = vi.fn((response: string | undefined) => ({ correct: response === "Paris" }));
    render(<PracticeSet items={[{ ...items[0]!, evaluate }]} />);
    expect(screen.queryByText("Paris is the capital city.")).not.toBeInTheDocument();
    expect(screen.queryByText("Correct")).not.toBeInTheDocument();
    expect(evaluate).not.toHaveBeenCalled();
  });

  it("submits an opaque result, shows informative feedback, then completes", async () => {
    const user = userEvent.setup();
    const onItemSubmit = vi.fn();
    const onComplete = vi.fn();
    render(<PracticeSet items={[items[0]!]} onItemSubmit={onItemSubmit} onComplete={onComplete} />);
    expect(screen.getByRole("button", { name: "Submit answer" })).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Answer" }), "Paris");
    await user.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(onItemSubmit).toHaveBeenCalledWith(expect.objectContaining({ itemId: "one", response: "Paris", result: { correct: true }, attemptNumber: 1 }));
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("Paris is the capital city.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Finish practice" }));
    expect(screen.getByText("Practice complete")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith([expect.objectContaining({ itemId: "one" })]);
  });

  it("navigates in controlled mode", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [index, setIndex] = useState(0);
      return <PracticeSet items={items} index={index} onIndexChange={setIndex} />;
    }
    render(<Controlled />);
    await user.type(screen.getByRole("textbox"), "Lyon");
    await user.click(screen.getByRole("button", { name: "Submit answer" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(screen.getByText("Name a primary color")).toBeInTheDocument();
  });

  it("supports localized labels and a useful empty state", () => {
    render(<PracticeSet labels={{ emptyHeading: "Sin ejercicios", emptyDescription: "Añade uno." }} />);
    expect(screen.getByText("Sin ejercicios")).toBeInTheDocument();
    expect(screen.getByText("Añade uno.")).toBeInTheDocument();
  });

  it("disables the current response and submission controls", () => {
    render(<PracticeSet items={[items[0]!]} disabled />);
    expect(screen.getByRole("textbox", { name: "Answer" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit answer" })).toBeDisabled();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<PracticeSet items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
