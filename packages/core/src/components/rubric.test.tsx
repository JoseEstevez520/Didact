import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Rubric, type RubricCriterion } from "./rubric.js";

afterEach(cleanup);

const criteria: RubricCriterion[] = [
  {
    id: "evidence",
    label: "Uses evidence",
    description: "Support the claim with specific observations.",
    levels: [
      { id: "developing", label: "Developing", description: "Evidence is general." },
      { id: "secure", label: "Secure", description: "Evidence is specific and relevant." },
    ],
  },
  {
    id: "reasoning",
    label: "Explains reasoning",
    levels: [
      { id: "developing", label: "Developing" },
      { id: "secure", label: "Secure" },
    ],
  },
];

describe("Rubric", () => {
  it("renders criteria as independently named single-select groups", () => {
    render(<Rubric title="Essay reflection" criteria={criteria} />);

    expect(screen.getByRole("region", { name: "Essay reflection" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Uses evidence" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Explains reasoning" })).toBeInTheDocument();
    expect(screen.getByText("0 of 2 criteria assessed")).toBeInTheDocument();
  });

  it("records self-assessment without producing a score or correctness result", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rubric criteria={criteria} onValueChange={onValueChange} />);

    const evidence = screen.getByRole("radiogroup", { name: "Uses evidence" });
    await user.click(within(evidence).getByRole("radio", { name: /Secure/i }));

    expect(onValueChange).toHaveBeenLastCalledWith({ evidence: "secure" });
    expect(screen.getByText("1 of 2 criteria assessed")).toBeInTheDocument();
    expect(screen.queryByText(/correct|incorrect|score|grade/i)).not.toBeInTheDocument();
  });

  it("supports controlled selections without mutating them internally", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Rubric
        criteria={criteria}
        value={{ evidence: "developing" }}
        onValueChange={onValueChange}
      />,
    );

    const evidence = screen.getByRole("radiogroup", { name: "Uses evidence" });
    const developing = within(evidence).getByRole("radio", { name: /Developing/i });
    const secure = within(evidence).getByRole("radio", { name: /Secure/i });
    expect(developing).toBeChecked();
    await user.click(secure);

    expect(onValueChange).toHaveBeenCalledWith({ evidence: "secure" });
    expect(developing).toBeChecked();
    expect(secure).not.toBeChecked();
  });

  it("localizes progress and fallbacks while rendering partial streaming data", () => {
    render(
      <Rubric
        aria-label="Autoevaluacion"
        criteria={[{ id: "partial", levels: [{ id: "one" }] }, { id: "waiting" }]}
        labels={{
          criterion: (index) => `Criterio ${index}`,
          level: (index) => `Nivel ${index}`,
          progress: (done, total) => `${done} de ${total} evaluados`,
          levelsPending: "Niveles pendientes.",
        }}
      />,
    );

    expect(screen.getByRole("radiogroup", { name: "Criterio 1" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Nivel 1" })).toBeInTheDocument();
    expect(screen.getByText("Niveles pendientes.")).toBeInTheDocument();
    expect(screen.getByText("0 de 2 evaluados")).toBeInTheDocument();
  });

  it("renders an explicit empty state", () => {
    render(<Rubric criteria={[]} />);
    expect(screen.getByRole("region", { name: "Self-assessment rubric" })).toBeInTheDocument();
    expect(screen.getByText("No criteria yet.")).toBeInTheDocument();
  });

  it("disables all controls without hiding the criteria", () => {
    render(<Rubric criteria={criteria} disabled />);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <Rubric
        title="Accessible reflection"
        description="Choose the description that best matches your work."
        criteria={criteria}
        defaultValue={{ evidence: "secure" }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
