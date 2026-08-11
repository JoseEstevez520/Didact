import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { SpacedRepetitionDeck, type SpacedRepetitionCard } from "./spaced-repetition-deck.js";

afterEach(cleanup);

const CARDS: SpacedRepetitionCard[] = [
  { id: "a", front: "2 + 2", back: "4" },
  { id: "b", front: "Capital of France", back: "Paris" },
];

/** Reveal the current card and rate it, driving the deck forward one step. */
async function revealAndRate(user: ReturnType<typeof userEvent.setup>, rating: RegExp | string) {
  await user.click(screen.getByRole("button", { name: "Reveal answer" }));
  await user.click(screen.getByRole("radio", { name: rating }));
}

describe("SpacedRepetitionDeck", () => {
  it("shows the first card and a progress indicator", () => {
    render(<SpacedRepetitionDeck cards={CARDS} />);
    expect(screen.getByText("Card 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("2 + 2")).toBeInTheDocument();
  });

  it("advances to the next card after the current one is rated", async () => {
    const user = userEvent.setup();
    render(<SpacedRepetitionDeck cards={CARDS} />);

    await revealAndRate(user, "Known");

    expect(screen.getByText("Card 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Capital of France")).toBeInTheDocument();
    // A freshly advanced card is back on its front face (reveal button available again).
    expect(screen.getByRole("button", { name: "Reveal answer" })).toBeInTheDocument();
  });

  it("fires onReview with the card, rating, mapped grade, and scheduler result", async () => {
    const user = userEvent.setup();
    const onReview = vi.fn();
    render(<SpacedRepetitionDeck cards={CARDS} onReview={onReview} />);

    await revealAndRate(user, "Known");

    expect(onReview).toHaveBeenCalledTimes(1);
    const review = onReview.mock.calls[0]![0];
    expect(review.card.id).toBe("a");
    expect(review.index).toBe(0);
    expect(review.status).toBe("known");
    expect(review.grade).toBe("good"); // default mapping known -> good
    // SM-2: first successful review schedules the card 1 day out.
    expect(review.result.state.intervalDays).toBe(1);
    expect(review.result.dueAt).toBeInstanceOf(Date);
  });

  it("maps a 'needs review' rating to the 'again' grade by default", async () => {
    const user = userEvent.setup();
    const onReview = vi.fn();
    render(<SpacedRepetitionDeck cards={CARDS} onReview={onReview} />);

    await revealAndRate(user, "Needs review");
    expect(onReview.mock.calls[0]![0].grade).toBe("again");
  });

  it("honors a custom gradeForStatus mapping", async () => {
    const user = userEvent.setup();
    const onReview = vi.fn();
    render(
      <SpacedRepetitionDeck
        cards={CARDS}
        onReview={onReview}
        gradeForStatus={(status) => (status === "known" ? "easy" : "hard")}
      />,
    );

    await revealAndRate(user, "Known");
    expect(onReview.mock.calls[0]![0].grade).toBe("easy");
  });

  it("fires onComplete once after the last card and shows the completion state", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<SpacedRepetitionDeck cards={CARDS} onComplete={onComplete} />);

    await revealAndRate(user, "Known");
    expect(onComplete).not.toHaveBeenCalled();

    await revealAndRate(user, "Known");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Review complete/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review again" })).toBeInTheDocument();
  });

  it("restarts from the beginning via 'Review again'", async () => {
    const user = userEvent.setup();
    render(<SpacedRepetitionDeck cards={CARDS} />);

    await revealAndRate(user, "Known");
    await revealAndRate(user, "Known");
    await user.click(screen.getByRole("button", { name: "Review again" }));

    expect(screen.getByText("Card 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("2 + 2")).toBeInTheDocument();
  });

  it("renders an empty state when there are no cards", () => {
    render(<SpacedRepetitionDeck cards={[]} />);
    expect(screen.getByText("No cards to review")).toBeInTheDocument();
    expect(screen.queryByText(/Card 1 of/)).not.toBeInTheDocument();
  });

  it("carries a card's incoming state into the scheduler instead of a fresh state", async () => {
    const user = userEvent.setup();
    const onReview = vi.fn();
    // A card mid-schedule (repetitions=1) rated 'good' should advance to the I(2)=6-day interval,
    // proving the deck fed the incoming state (not a brand-new one) to the scheduler.
    const cards: SpacedRepetitionCard[] = [
      { id: "seeded", front: "Q", back: "A", state: { repetitions: 1, easinessFactor: 2.5, intervalDays: 1 } },
    ];
    render(<SpacedRepetitionDeck cards={cards} onReview={onReview} />);

    await revealAndRate(user, "Known");
    expect(onReview.mock.calls[0]![0].result.state.intervalDays).toBe(6);
  });

  it("behaves as a controlled component when `index` is provided", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();

    function Controlled() {
      const [index, setIndex] = useState(0);
      return (
        <SpacedRepetitionDeck
          cards={CARDS}
          index={index}
          onIndexChange={(next) => {
            onIndexChange(next);
            setIndex(next);
          }}
        />
      );
    }

    render(<Controlled />);
    await revealAndRate(user, "Known");
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(screen.getByText("Card 2 of 2")).toBeInTheDocument();
  });

  it("does not advance in controlled mode if the caller ignores onIndexChange", async () => {
    const user = userEvent.setup();
    render(<SpacedRepetitionDeck cards={CARDS} index={0} />);

    await revealAndRate(user, "Known");
    // The caller never updated `index`, so the deck stays on card 1.
    expect(screen.getByText("Card 1 of 2")).toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations (reviewing)", async () => {
    const { container } = render(<SpacedRepetitionDeck cards={CARDS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no automatically detectable accessibility violations (empty)", async () => {
    const { container } = render(<SpacedRepetitionDeck cards={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
