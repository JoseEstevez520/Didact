import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Flashcard } from "./flashcard.js";

// This workspace's vitest config does not enable `test.globals`, so @testing-library/react's
// auto-cleanup (which relies on detecting a global `afterEach`) never registers itself -- without
// this, every test's render would stay mounted in `document.body` and later `screen.getByRole`
// queries in this file would find duplicates, since every test in this suite renders the same
// front/back text and the same button labels.
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

  it("flips via a click on the flip button (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Flashcard front="Question" back="Answer" />);

    const flipButton = screen.getByRole("button", { name: "Show answer" });
    expect(flipButton).toHaveAttribute("aria-pressed", "false");

    await user.click(flipButton);

    expect(screen.getByRole("button", { name: "Show question" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Answer").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(screen.getByText("Question").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("flips via the keyboard (Tab + Enter), not just the mouse", async () => {
    const user = userEvent.setup();
    render(<Flashcard front="Question" back="Answer" />);

    await user.tab();
    const flipButton = screen.getByRole("button", { name: "Show answer" });
    expect(flipButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Show question" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls onFlip with the next flip state on every activation (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onFlip = vi.fn();
    render(<Flashcard front="Question" back="Answer" onFlip={onFlip} />);

    await user.click(screen.getByRole("button", { name: "Show answer" }));
    expect(onFlip).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByRole("button", { name: "Show question" }));
    expect(onFlip).toHaveBeenLastCalledWith(false);
    expect(onFlip).toHaveBeenCalledTimes(2);
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
    const flipButton = screen.getByRole("button", { name: "Show answer" });

    await user.click(flipButton);
    expect(onFlip).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Show question" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("does not change its flip state on click when `flipped` is set but the caller ignores onFlip", async () => {
    const user = userEvent.setup();
    render(<Flashcard front="Question" back="Answer" flipped={false} />);

    await user.click(screen.getByRole("button", { name: "Show answer" }));
    // Still showing "Show answer" because the caller (this test) never updated the `flipped` prop.
    expect(screen.getByRole("button", { name: "Show answer" })).toBeInTheDocument();
  });

  it("starts flipped when defaultFlipped is set (uncontrolled initial state)", () => {
    render(<Flashcard front="Question" back="Answer" defaultFlipped />);
    expect(screen.getByRole("button", { name: "Show question" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("marks the card as known via a labelled button, not color alone (RF-12, WCAG 1.4.1)", async () => {
    const user = userEvent.setup();
    const onMark = vi.fn();
    render(<Flashcard front="Question" back="Answer" onMark={onMark} />);

    const knownButton = screen.getByRole("button", { name: "Known" });
    expect(knownButton).toHaveAttribute("aria-pressed", "false");

    await user.click(knownButton);

    expect(onMark).toHaveBeenCalledWith("known");
    expect(knownButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Needs review" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("marks the card as needing review via a labelled button", async () => {
    const user = userEvent.setup();
    const onMark = vi.fn();
    render(<Flashcard front="Question" back="Answer" onMark={onMark} />);

    await user.click(screen.getByRole("button", { name: "Needs review" }));

    expect(onMark).toHaveBeenCalledWith("review");
    expect(screen.getByRole("button", { name: "Needs review" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("respects a controlled `status` prop instead of tracking its own", async () => {
    const user = userEvent.setup();
    const onMark = vi.fn();
    render(<Flashcard front="Question" back="Answer" status="known" onMark={onMark} />);

    const reviewButton = screen.getByRole("button", { name: "Needs review" });
    await user.click(reviewButton);

    // Caller never updated the `status` prop, so the button stays reflecting the controlled value.
    expect(onMark).toHaveBeenCalledWith("review");
    expect(screen.getByRole("button", { name: "Known" })).toHaveAttribute("aria-pressed", "true");
    expect(reviewButton).toHaveAttribute("aria-pressed", "false");
  });

  it("starts with the given defaultStatus (uncontrolled initial state)", () => {
    render(<Flashcard front="Question" back="Answer" defaultStatus="review" />);
    expect(screen.getByRole("button", { name: "Needs review" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("has no automatically detectable accessibility violations (front showing, unmarked)", async () => {
    const { container } = render(<Flashcard front="Question" back="Answer" />);
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
