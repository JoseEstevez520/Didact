import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Flashcard, type FlashcardStatus } from "./flashcard.js";

// This workspace's vitest config does not enable `test.globals`, so @testing-library/react's
// auto-cleanup (which relies on detecting a global `afterEach`) never registers itself -- without
// this, every test's render would stay mounted in `document.body` and later `screen.getByRole`
// queries in this file would find duplicates, since every test in this suite renders the same
// front/back text and the same control labels.
afterEach(cleanup);

describe("Flashcard", () => {
  it("renders the front face and hides the back face from the accessibility tree by default", () => {
    render(<Flashcard front="Question" back="Answer" />);

    expect(screen.getByText("Question")).toBeInTheDocument();
    expect(screen.getByText("Answer")).toBeInTheDocument();
    expect(screen.getByText("Question").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(screen.getByText("Answer").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("shows a single primary reveal action and no rating control before reveal", () => {
    render(<Flashcard front="Question" back="Answer" />);

    const reveal = screen.getByRole("button", { name: "Reveal answer" });
    expect(reveal).toHaveAttribute("aria-expanded", "false");
    // The rating control must not exist yet -- rating before reveal was the flagged bad flow.
    expect(screen.queryByRole("radio", { name: "Known" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Known" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Rate your recall" })).not.toBeInTheDocument();
  });

  it("reveals the back face and the rating control on click (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Flashcard front="Question" back="Answer" />);

    await user.click(screen.getByRole("button", { name: "Reveal answer" }));

    expect(screen.getByText("Answer").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(screen.getByText("Question").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    // Only now, after reveal, does the rating control (a single segmented ToggleGroup, not two
    // competing primary buttons) exist.
    expect(screen.getByRole("radiogroup", { name: "Rate your recall" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Known" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Needs review" })).toBeInTheDocument();
  });

  it("reveals via the keyboard (Tab + Enter), not just the mouse", async () => {
    const user = userEvent.setup();
    render(<Flashcard front="Question" back="Answer" />);

    await user.tab();
    const reveal = screen.getByRole("button", { name: "Reveal answer" });
    expect(reveal).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(reveal).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("radiogroup", { name: "Rate your recall" })).toBeInTheDocument();
  });

  it("calls onFlip(true) when the reveal control is activated (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    render(<Flashcard front="Question" back="Answer" onFlip={onFlip} />);

    await user.click(screen.getByRole("button", { name: "Reveal answer" }));
    expect(onFlip).toHaveBeenCalledWith(true);
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it("behaves as a controlled component when `flipped` is provided: the caller decides the state", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();

    function Controlled() {
      const [flipped, setFlipped] = useState(false);
      return (
        <Flashcard
          front="Question"
          back="Answer"
          flipped={flipped}
          onFlip={(next: boolean) => {
            onFlip(next);
            setFlipped(next);
          }}
        />
      );
    }

    render(<Controlled />);
    const reveal = screen.getByRole("button", { name: "Reveal answer" });

    await user.click(reveal);
    expect(onFlip).toHaveBeenCalledWith(true);
    // The front face (and its "Reveal answer" button) is now aria-hidden + inert, so it is no
    // longer reachable by role query -- only the rating control should be.
    expect(screen.queryByRole("button", { name: "Reveal answer" })).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Rate your recall" })).toBeInTheDocument();
  });

  it("does not change its flip state on click when `flipped` is set but the caller ignores onFlip", async () => {
    const user = userEvent.setup();
    render(<Flashcard front="Question" back="Answer" flipped={false} />);

    await user.click(screen.getByRole("button", { name: "Reveal answer" }));
    // Still not expanded and still no rating control, because the caller (this test) never
    // updated the `flipped` prop.
    expect(screen.getByRole("button", { name: "Reveal answer" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("radiogroup", { name: "Rate your recall" })).not.toBeInTheDocument();
  });

  it("starts flipped when defaultFlipped is set (uncontrolled initial state), rating control included", () => {
    render(<Flashcard front="Question" back="Answer" defaultFlipped />);
    // The front face (and its "Reveal answer" button) is aria-hidden + inert from the start.
    expect(screen.queryByRole("button", { name: "Reveal answer" })).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Rate your recall" })).toBeInTheDocument();
  });

  it("a controlled caller can still show the front face again after reveal (e.g. next card)", () => {
    const { rerender } = render(<Flashcard front="Question" back="Answer" flipped />);
    expect(screen.getByRole("radiogroup", { name: "Rate your recall" })).toBeInTheDocument();

    rerender(<Flashcard front="Question" back="Answer" flipped={false} />);
    expect(screen.queryByRole("radiogroup", { name: "Rate your recall" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reveal answer" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("marks the card as known via the rating control, not color alone (RF-12, WCAG 1.4.1)", async () => {
    const user = userEvent.setup();
    const onMark = vi.fn();
    render(<Flashcard front="Question" back="Answer" defaultFlipped onMark={onMark} />);

    const known = screen.getByRole("radio", { name: "Known" });
    expect(known).toHaveAttribute("aria-checked", "false");

    await user.click(known);

    expect(onMark).toHaveBeenCalledWith("known");
    expect(known).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Needs review" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("marks the card as needing review via the rating control", async () => {
    const user = userEvent.setup();
    const onMark = vi.fn();
    render(<Flashcard front="Question" back="Answer" defaultFlipped onMark={onMark} />);

    await user.click(screen.getByRole("radio", { name: "Needs review" }));

    expect(onMark).toHaveBeenCalledWith("review");
    expect(screen.getByRole("radio", { name: "Needs review" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("is operable from the keyboard alone (Enter activates, arrow keys move focus within the group)", async () => {
    // Focuses the first rating control directly (rather than Tab-ing in from the top of the
    // document) because jsdom does not implement the `inert` attribute's focus-blocking behavior
    // (verified: jsdom 30 leaves a real `<button inert>` focusable), so a `user.tab()` walk here
    // would non-representatively land on the hidden front face's "Reveal answer" button instead
    // of skipping over it the way a real browser does. Real inert support is a browser guarantee
    // this component relies on, not something this suite can exercise through jsdom; the
    // aria-hidden/inert *attributes themselves* are asserted directly elsewhere in this file.
    const user = userEvent.setup();
    const onMark = vi.fn();
    render(<Flashcard front="Question" back="Answer" defaultFlipped onMark={onMark} />);

    const known = screen.getByRole("radio", { name: "Known" });
    known.focus();
    expect(known).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onMark).toHaveBeenCalledWith("known");

    await user.keyboard("{ArrowRight}");
    const needsReview = screen.getByRole("radio", { name: "Needs review" });
    expect(needsReview).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onMark).toHaveBeenCalledWith("review");
  });

  it("respects a controlled `status` prop instead of tracking its own", async () => {
    const user = userEvent.setup();
    const onMark = vi.fn();
    render(
      <Flashcard front="Question" back="Answer" defaultFlipped status="known" onMark={onMark} />,
    );

    const needsReview = screen.getByRole("radio", { name: "Needs review" });
    await user.click(needsReview);

    // Caller never updated the `status` prop, so the control stays reflecting the controlled value.
    expect(onMark).toHaveBeenCalledWith("review");
    expect(screen.getByRole("radio", { name: "Known" })).toHaveAttribute("aria-checked", "true");
    expect(needsReview).toHaveAttribute("aria-checked", "false");
  });

  it("starts with the given defaultStatus (uncontrolled initial state)", () => {
    render(<Flashcard front="Question" back="Answer" defaultFlipped defaultStatus="review" />);
    expect(screen.getByRole("radio", { name: "Needs review" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("a controlled `status` caller sees onMark fire for both ratings in sequence", async () => {
    const user = userEvent.setup();
    const onMark = vi.fn();

    function Controlled() {
      const [status, setStatus] = useState<FlashcardStatus | undefined>(undefined);
      return (
        <Flashcard
          front="Question"
          back="Answer"
          defaultFlipped
          status={status}
          onMark={(next) => {
            onMark(next);
            setStatus(next);
          }}
        />
      );
    }

    render(<Controlled />);
    await user.click(screen.getByRole("radio", { name: "Known" }));
    expect(screen.getByRole("radio", { name: "Known" })).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("radio", { name: "Needs review" }));
    expect(onMark).toHaveBeenLastCalledWith("review");
    expect(screen.getByRole("radio", { name: "Needs review" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Known" })).toHaveAttribute("aria-checked", "false");
  });

  it("has no automatically detectable accessibility violations (front showing, unmarked)", async () => {
    const { container } = render(<Flashcard front="Question" back="Answer" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no automatically detectable accessibility violations (back showing, unmarked)", async () => {
    const { container } = render(<Flashcard front="Question" back="Answer" defaultFlipped />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no automatically detectable accessibility violations (back showing, marked known)", async () => {
    const { container } = render(
      <Flashcard front="Question" back="Answer" defaultFlipped defaultStatus="known" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
