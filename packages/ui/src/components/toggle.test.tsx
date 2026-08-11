import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Toggle } from "./toggle.js";

afterEach(cleanup);

describe("Toggle", () => {
  it("renders as an unpressed button by default, with data-slot", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle).toHaveAttribute("data-slot", "toggle");
    expect(toggle).toHaveAttribute("data-state", "off");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles data-state/aria-pressed on click", async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Bold">B</Toggle>);
    const toggle = screen.getByRole("button", { name: "Bold" });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "on");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "off");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("is operable from the keyboard alone (Tab + Enter)", async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Bold">B</Toggle>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("data-state", "on");
  });

  it("calls onPressedChange with the next pressed state", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Toggle aria-label="Bold">B</Toggle>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
