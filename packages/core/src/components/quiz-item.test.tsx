import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import {
  FillInTheBlankQuiz,
  MultiSelectQuiz,
  ShortAnswerQuiz,
  SingleChoiceQuiz,
  TrueFalseQuiz,
  type QuizOption,
} from "./quiz-item.js";

afterEach(cleanup);

const OPTIONS: QuizOption[] = [
  { value: "mercury", label: "Mercury" },
  { value: "venus", label: "Venus" },
  { value: "mars", label: "Mars" },
];

describe("SingleChoiceQuiz", () => {
  it("renders the question and options without leaking the correct answer before submit", () => {
    render(
      <SingleChoiceQuiz
        question="Which planet is closest to the Sun?"
        options={OPTIONS}
        correctValue="mercury"
      />,
    );
    expect(screen.getByText("Which planet is closest to the Sun?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Mercury" })).toBeInTheDocument();
    // Nothing marks the correct answer yet.
    expect(screen.queryByText("Correct answer")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps submit disabled until an option is chosen, then fires onAnswer", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(
      <SingleChoiceQuiz
        question="Q"
        options={OPTIONS}
        correctValue="mercury"
        onAnswer={onAnswer}
      />,
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "Venus" }));
    expect(onAnswer).toHaveBeenCalledWith("venus");
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
  });

  it("shows a correct result (icon + text, not color alone) and marks the correct option", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SingleChoiceQuiz
        question="Q"
        options={OPTIONS}
        correctValue="mercury"
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "Mercury" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith({ value: "mercury", correct: true });
    const result = screen.getByRole("status");
    expect(result).toHaveTextContent("Correct");
    expect(result).toHaveAttribute("data-correct", "true");
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    // The group locks after submission.
    expect(screen.getByRole("radio", { name: /Mercury/ })).toBeDisabled();
  });

  it("shows an incorrect result and marks both the correct option and the wrong choice", async () => {
    const user = userEvent.setup();
    render(<SingleChoiceQuiz question="Q" options={OPTIONS} correctValue="mercury" />);
    await user.click(screen.getByRole("radio", { name: "Mars" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const result = screen.getByRole("status");
    expect(result).toHaveTextContent("Not quite");
    expect(result).toHaveAttribute("data-correct", "false");
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    expect(screen.getByText("Your answer")).toBeInTheDocument();
  });

  it("renders informative feedback only after submission", async () => {
    const user = userEvent.setup();
    render(
      <SingleChoiceQuiz
        question="Q"
        options={OPTIONS}
        correctValue="mercury"
        feedback="Mercury orbits the Sun at ~58 million km."
      />,
    );
    expect(screen.queryByText(/58 million km/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Mercury" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText(/58 million km/)).toBeInTheDocument();
  });

  it("supports controlled answer state", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string | undefined>(undefined);
      return (
        <SingleChoiceQuiz
          question="Q"
          options={OPTIONS}
          correctValue="mercury"
          value={value}
          onAnswer={setValue}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("radio", { name: "Venus" }));
    expect(screen.getByRole("radio", { name: "Venus" })).toBeChecked();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <SingleChoiceQuiz question="Q" options={OPTIONS} correctValue="mercury" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("MultiSelectQuiz", () => {
  const options: QuizOption[] = [
    { value: "o2", label: "Oxygen" },
    { value: "glucose", label: "Glucose" },
    { value: "co2", label: "Carbon dioxide" },
  ];

  it("grades a set of answers as correct only on an exact set match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <MultiSelectQuiz
        question="What does photosynthesis produce?"
        options={options}
        correctValues={["o2", "glucose"]}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Oxygen" }));
    await user.click(screen.getByRole("checkbox", { name: "Glucose" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith({ value: ["o2", "glucose"], correct: true });
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
  });

  it("grades a partial selection as incorrect", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelectQuiz
        question="Q"
        options={options}
        correctValues={["o2", "glucose"]}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Oxygen" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not quite");
  });

  it("shows the 'select all that apply' instruction and no leak before submit", () => {
    render(
      <MultiSelectQuiz question="Q" options={options} correctValues={["o2", "glucose"]} />,
    );
    expect(screen.getByText("Select all that apply.")).toBeInTheDocument();
    expect(screen.queryByText("Correct answer")).not.toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <MultiSelectQuiz question="Q" options={options} correctValues={["o2"]} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("TrueFalseQuiz", () => {
  it("grades a true/false judgement", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TrueFalseQuiz
        question="The Earth orbits the Sun."
        correctValue={true}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "True" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledWith({ value: true, correct: true });
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
  });

  it("does not leak which judgement is correct before submit", () => {
    render(<TrueFalseQuiz question="Q" correctValue={false} />);
    expect(screen.queryByText("Correct answer")).not.toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<TrueFalseQuiz question="Q" correctValue />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FillInTheBlankQuiz", () => {
  it("accepts a case-insensitive, whitespace-normalized match by default", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <FillInTheBlankQuiz
        question="The powerhouse of the cell is the ___."
        answers={["mitochondria"]}
        onSubmit={onSubmit}
      />,
    );
    await user.type(screen.getByRole("textbox"), "  Mitochondria ");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledWith({ value: "  Mitochondria ", correct: true });
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
  });

  it("reveals the accepted answer only after an incorrect submission", async () => {
    const user = userEvent.setup();
    render(
      <FillInTheBlankQuiz question="Q" answers={["mitochondria"]} />,
    );
    expect(screen.queryByText(/Accepted answer/)).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "ribosome");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not quite");
    expect(screen.getByText(/Accepted answer/)).toHaveTextContent("mitochondria");
  });

  it("respects caseSensitive when requested", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <FillInTheBlankQuiz question="Q" answers={["DNA"]} caseSensitive onSubmit={onSubmit} />,
    );
    await user.type(screen.getByRole("textbox"), "dna");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledWith({ value: "dna", correct: false });
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<FillInTheBlankQuiz question="Q" answers={["a"]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ShortAnswerQuiz", () => {
  it("reveals the model answer and self-assessment only after submit (assisted verification)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onSelfAssess = vi.fn();
    render(
      <ShortAnswerQuiz
        question="Explain spaced repetition in one sentence."
        modelAnswer="Reviewing material at increasing intervals to counter forgetting."
        onSubmit={onSubmit}
        onSelfAssess={onSelfAssess}
      />,
    );
    // Model answer must not be in the DOM before submission.
    expect(screen.queryByText(/increasing intervals/)).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "Spacing reviews out over time.");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith({ value: "Spacing reviews out over time." });
    expect(screen.getByText(/increasing intervals/)).toBeInTheDocument();
    // No correct/incorrect banner until the learner self-assesses.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "I was right" }));
    expect(onSelfAssess).toHaveBeenCalledWith(true);
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <ShortAnswerQuiz question="Q" modelAnswer="A model answer." />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
