import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Checkbox } from "./checkbox.js";
import { Label } from "./label.js";

afterEach(cleanup);

describe("Checkbox", () => {
  it("renders with its data-slot and unchecked by default", () => {
    render(<Checkbox aria-label="Accept" />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box).toHaveAttribute("data-slot", "checkbox");
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("toggles checked state on click and fires onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);

    const box = screen.getByRole("checkbox", { name: "Accept" });
    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box).toHaveAttribute("aria-checked", "true");

    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("toggles from the keyboard (Space)", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" />);
    const box = screen.getByRole("checkbox", { name: "Accept" });

    await user.tab();
    expect(box).toHaveFocus();
    await user.keyboard(" ");
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" disabled />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    await user.click(box);
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("has no automatically detectable accessibility violations when labelled", async () => {
    const { container } = render(
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Checkbox id="terms" />
        <Label htmlFor="terms">I have read the material</Label>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
