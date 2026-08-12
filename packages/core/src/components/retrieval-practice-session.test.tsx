import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import {
  RetrievalPracticeSession,
  type RetrievalPracticeItem,
} from "./retrieval-practice-session.js";

afterEach(cleanup);

const items: RetrievalPracticeItem[] = [
  { id: "a", title: "Mental maths", prompt: "2 + 2", answer: "4" },
  { id: "b", prompt: "3 + 3", answer: "6" },
];

async function respondAndCompare(user: ReturnType<typeof userEvent.setup>, response = "four") {
  await user.type(screen.getByRole("textbox", { name: "Your response" }), response);
  await user.click(screen.getByRole("button", { name: "Compare with model answer" }));
}

describe("RetrievalPracticeSession", () => {
  it("requires a written retrieval before exposing the model answer", async () => {
    const user = userEvent.setup();
    render(<RetrievalPracticeSession items={items} />);
    const compare = screen.getByRole("button", { name: "Compare with model answer" });
    expect(compare).toBeDisabled();
    expect(screen.queryByText("4")).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Your response" }), "four");
    expect(compare).toBeEnabled();
    await user.click(compare);

    expect(screen.getByRole("heading", { name: "Your response" })).toBeInTheDocument();
    expect(screen.getByText("four")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Model answer" })).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Good" })).toBeInTheDocument();
  });

  it("includes the constructed response when scheduling and persisting", async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    const onReview = vi.fn();
    const onComplete = vi.fn();
    render(
      <RetrievalPracticeSession
        items={[items[0]!]}
        persistence={{ save }}
        onReview={onReview}
        onComplete={onComplete}
      />,
    );
    await respondAndCompare(user, "I recall the answer is four");
    await user.click(screen.getByRole("button", { name: "Good" }));

    expect(onReview).toHaveBeenCalledWith(
      expect.objectContaining({
        grade: "good",
        response: "I recall the answer is four",
        item: items[0],
      }),
    );
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ result: expect.objectContaining({ dueAt: expect.any(Date) }) }),
    );
    expect(onComplete).toHaveBeenCalledWith([
      expect.objectContaining({ grade: "good", response: "I recall the answer is four" }),
    ]);
    expect(screen.getByText("Retrieval session complete")).toBeInTheDocument();
  });

  it("loads incoming state through the injected persistence adapter", async () => {
    const user = userEvent.setup();
    const onReview = vi.fn();
    render(
      <RetrievalPracticeSession
        items={[items[0]!]}
        persistence={{
          load: () => ({ repetitions: 1, intervalDays: 1, easinessFactor: 2.5 }),
          save: vi.fn(),
        }}
        onReview={onReview}
      />,
    );
    await respondAndCompare(user);
    await user.click(screen.getByRole("button", { name: "Good" }));
    expect(onReview.mock.calls[0]![0].result.state.intervalDays).toBe(6);
  });

  it("supports externally controlled responses and navigation", async () => {
    const user = userEvent.setup();
    const onResponseChange = vi.fn();
    function Controlled() {
      const [index, setIndex] = useState(0);
      const [responses, setResponses] = useState<Readonly<Record<string, string>>>({});
      return (
        <RetrievalPracticeSession
          items={items}
          maxItems={1}
          index={index}
          onIndexChange={setIndex}
          responses={responses}
          onResponseChange={(payload) => {
            onResponseChange(payload);
            setResponses((all) => ({ ...all, [payload.item.id]: payload.response }));
          }}
        />
      );
    }
    render(<Controlled />);
    await respondAndCompare(user, "4");
    expect(onResponseChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ item: items[0], response: "4" }),
    );
    await user.click(screen.getByRole("button", { name: "Again" }));
    expect(screen.getByText("Retrieval session complete")).toBeInTheDocument();
  });

  it("keeps partial items inert while prompt or model answer is loading", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<RetrievalPracticeSession items={[{ id: "pending" }]} />);
    expect(screen.getByText("This prompt is still loading.")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeDisabled();

    rerender(<RetrievalPracticeSession items={[{ id: "pending", prompt: "Question" }]} />);
    await user.type(screen.getByRole("textbox"), "Attempt");
    expect(screen.getByRole("button", { name: "Compare with model answer" })).toBeDisabled();
  });

  it("accepts a custom model-answer renderer without duplicating answer data", async () => {
    const user = userEvent.setup();
    render(
      <RetrievalPracticeSession
        items={[{ id: "custom", prompt: "Question" }]}
        renderAnswer={() => <strong>Rendered model</strong>}
      />,
    );
    await respondAndCompare(user, "Attempt");
    expect(screen.getByText("Rendered model")).toBeInTheDocument();
  });

  it("localizes labels and disables the whole action flow", () => {
    render(
      <RetrievalPracticeSession
        items={[items[0]!]}
        disabled
        labels={{ responseLabel: "Mi respuesta", compare: "Comparar" }}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Mi respuesta" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Comparar" })).toBeDisabled();
  });

  it("renders an empty state", () => {
    render(<RetrievalPracticeSession />);
    expect(screen.getByText("Nothing due for retrieval")).toBeInTheDocument();
  });

  it("has no accessibility violations before or after comparison", async () => {
    const user = userEvent.setup();
    const { container } = render(<RetrievalPracticeSession items={items} />);
    expect(await axe(container)).toHaveNoViolations();
    await respondAndCompare(user);
    expect(await axe(container)).toHaveNoViolations();
  });
});
