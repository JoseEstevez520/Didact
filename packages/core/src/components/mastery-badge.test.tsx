import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { MasteryBadge } from "./mastery-badge.js";

describe("MasteryBadge", () => {
  it("renders the level as visible text, not just a color (RF-12, WCAG 1.4.1)", () => {
    render(<MasteryBadge level="advanced" />);
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("renders the percentage as text when provided", () => {
    render(<MasteryBadge level="intermediate" percent={62} />);
    expect(screen.getByText("Intermediate -- 62%")).toBeInTheDocument();
  });

  it("clamps out-of-range percentages instead of rendering nonsense", () => {
    render(<MasteryBadge level="beginner" percent={140} />);
    expect(screen.getByText("Beginner -- 100%")).toBeInTheDocument();
  });

  it("renders a static, non-interactive badge by default (no button role)", () => {
    render(<MasteryBadge level="beginner" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("in interactive mode, is a real keyboard-operable button with aria-pressed", async () => {
    const user = userEvent.setup();
    render(<MasteryBadge level="advanced" percent={90} interactive />);

    const button = screen.getByRole("button", { name: "Advanced" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("90% mastery")).toBeInTheDocument();

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("is operable from the keyboard alone (Tab + Enter), not just the mouse", async () => {
    const user = userEvent.setup();
    render(<MasteryBadge level="intermediate" percent={50} interactive />);

    await user.tab();
    const button = screen.getByRole("button", { name: "Intermediate" });
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("has no automatically detectable accessibility violations (static)", async () => {
    const { container } = render(
      <MasteryBadge level="advanced" percent={95} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no automatically detectable accessibility violations (interactive)", async () => {
    const { container } = render(
      <MasteryBadge level="intermediate" percent={62} interactive />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
