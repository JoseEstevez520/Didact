import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import {
  CompletionProblem,
  SelfExplanationPrompt,
  WorkedExample,
  type CompletionProblemValue,
} from "./generative-learning.js";

afterEach(cleanup);

describe("SelfExplanationPrompt", () => {
  it("supports an uncontrolled response, guidance and submission without automatic grading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SelfExplanationPrompt
        prompt="Why does the result follow?"
        scaffolds={["Name the rule.", "Connect it to the evidence."]}
        modelExplanation="One possible explanation"
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("complementary", { name: "Guidance" })).toBeInTheDocument();
    expect(screen.queryByText("One possible explanation")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Your explanation"), "Because the rule applies.");
    await user.click(screen.getByRole("button", { name: "Submit explanation" }));

    expect(onSubmit).toHaveBeenCalledWith({ value: "Because the rule applies." });
    expect(screen.getByText("Explanation submitted.")).toBeInTheDocument();
    expect(screen.getByText("One possible explanation")).toBeInTheDocument();
    expect(screen.queryByText(/correct|incorrect/i)).not.toBeInTheDocument();
  });

  it("honors controlled value and disables submit below minLength", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SelfExplanationPrompt
        prompt="Explain"
        value="fixed"
        minLength={10}
        onValueChange={onValueChange}
      />,
    );
    await user.type(screen.getByLabelText("Your explanation"), " addition");
    expect(onValueChange).toHaveBeenCalled();
    expect(screen.getByLabelText("Your explanation")).toHaveValue("fixed");
    expect(screen.getByRole("button", { name: "Submit explanation" })).toBeDisabled();
  });

  it("renders partial content and a disabled state safely", () => {
    render(<SelfExplanationPrompt disabled scaffolds={[undefined, "Consider the context."]} />);
    expect(screen.getByText("The explanation prompt is still loading.")).toBeInTheDocument();
    expect(screen.getByLabelText("Your explanation")).toBeDisabled();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <SelfExplanationPrompt prompt="Explain the relationship" scaffolds={["Compare both ideas."]} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("WorkedExample", () => {
  const steps = [
    { id: "one", title: "Identify", content: "Set x = 2", rationale: "This isolates the variable." },
    { id: "two", title: "Substitute", content: "2 + 3 = 5" },
  ];

  it("shows all content in static mode without assessment language", () => {
    render(<WorkedExample problem="Solve the expression" steps={steps} summary="Use the same pattern." />);
    expect(screen.getByText("Set x = 2")).toBeInTheDocument();
    expect(screen.getByText("2 + 3 = 5")).toBeInTheDocument();
    expect(screen.getByText("This isolates the variable.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("reveals progressive steps from the keyboard and reports controlled requests", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <WorkedExample
        problem="Solve"
        steps={steps}
        mode="progressive"
        revealedStepCount={1}
        onRevealedStepCountChange={onChange}
      />,
    );
    expect(screen.queryByText("2 + 3 = 5")).not.toBeInTheDocument();
    const next = screen.getByRole("button", { name: "Show next step" });
    next.focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.queryByText("2 + 3 = 5")).not.toBeInTheDocument();
  });

  it("supports uncontrolled progressive reveal and empty or partial steps", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<WorkedExample problem="Loading" steps={[]} />);
    expect(screen.getByText("No solution steps yet.")).toBeInTheDocument();

    rerender(
      <WorkedExample problem="Loading" steps={[{ id: "partial" }, { id: "later", content: "Done" }]} mode="progressive" />,
    );
    expect(screen.getByText("Step content is still loading.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show next step" }));
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<WorkedExample problem="Solve" steps={steps} mode="progressive" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("CompletionProblem", () => {
  const steps = [
    { id: "given", kind: "worked" as const, title: "Given", content: "3x = 12" },
    {
      id: "divide",
      kind: "completion" as const,
      prompt: "Divide both sides",
      acceptedAnswers: ["x = 4"],
      feedback: "Both sides must be divided by three.",
    },
    {
      id: "explain",
      kind: "completion" as const,
      prompt: "Explain why",
      multiline: true,
      feedback: "This response can be reviewed by an instructor.",
    },
  ];

  it("requires every gap, then returns mixed graded and ungraded outcomes with feedback", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CompletionProblem problem="Complete the solution" steps={steps} onSubmit={onSubmit} />);

    const submit = screen.getByRole("button", { name: "Check responses" });
    expect(submit).toBeDisabled();
    expect(screen.queryByText("x = 4")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Divide both sides"), "x = 5");
    await user.type(screen.getByLabelText("Explain why"), "Equivalent operations preserve equality.");
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      status: "partial",
      steps: { divide: "incorrect", explain: "ungraded" },
    }));
    expect(screen.getByText("Needs revision")).toBeInTheDocument();
    expect(screen.getByText("Submitted for review")).toBeInTheDocument();
    expect(screen.getByText("x = 4")).toBeInTheDocument();
    expect(screen.getByText("Both sides must be divided by three.")).toBeInTheDocument();
  });

  it("supports controlled answers without mutating caller state", async () => {
    const onValueChange = vi.fn();
    render(
      <CompletionProblem
        problem="Complete"
        steps={[steps[1]!]}
        value={{ divide: "fixed" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Divide both sides"), {
      target: { value: "fixed more" },
    });
    expect(onValueChange).toHaveBeenCalledWith({ divide: "fixed more" });
    expect(screen.getByLabelText("Divide both sides")).toHaveValue("fixed");
  });

  it("works as a controlled wrapper and computes a partial result", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function Controlled() {
      const [value, setValue] = useState<CompletionProblemValue>({});
      return (
        <CompletionProblem
          problem="Two gaps"
          steps={[
            { id: "a", kind: "completion", prompt: "First", acceptedAnswers: ["yes"] },
            { id: "b", kind: "completion", prompt: "Second", acceptedAnswers: ["no"] },
          ]}
          value={value}
          onValueChange={setValue}
          onSubmit={onSubmit}
        />
      );
    }
    render(<Controlled />);
    await user.type(screen.getByLabelText("First"), "yes");
    await user.type(screen.getByLabelText("Second"), "wrong");
    await user.click(screen.getByRole("button", { name: "Check responses" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: "partial" }));
  });

  it("renders empty and disabled states safely", () => {
    const { rerender } = render(<CompletionProblem />);
    expect(screen.getByText("No problem steps yet.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<CompletionProblem problem="Disabled" steps={[steps[1]!]} disabled defaultValue={{ divide: "x = 4" }} />);
    expect(screen.getByLabelText("Divide both sides")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Check responses" })).toBeDisabled();
  });

  it("has no detectable accessibility violations before and after feedback", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CompletionProblem problem="Complete" steps={[steps[1]!]} defaultValue={{ divide: "x = 4" }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Check responses" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
