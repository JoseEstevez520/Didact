import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { RadioGroup, RadioGroupItem } from "./radio-group.js";
import { Label } from "./label.js";

afterEach(cleanup);

function Fixture({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <RadioGroup aria-label="Difficulty" onValueChange={onValueChange}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <RadioGroupItem value="easy" id="easy" />
        <Label htmlFor="easy">Easy</Label>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <RadioGroupItem value="hard" id="hard" />
        <Label htmlFor="hard">Hard</Label>
      </div>
    </RadioGroup>
  );
}

describe("RadioGroup / RadioGroupItem", () => {
  it("renders items with their data-slot", () => {
    render(<Fixture />);
    expect(screen.getByRole("radio", { name: "Easy" })).toHaveAttribute(
      "data-slot",
      "radio-group-item",
    );
  });

  it("single-select: selecting one item deselects the previous one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Fixture onValueChange={onValueChange} />);

    const easy = screen.getByRole("radio", { name: "Easy" });
    const hard = screen.getByRole("radio", { name: "Hard" });

    await user.click(easy);
    expect(onValueChange).toHaveBeenLastCalledWith("easy");
    expect(easy).toHaveAttribute("aria-checked", "true");

    await user.click(hard);
    expect(onValueChange).toHaveBeenLastCalledWith("hard");
    expect(hard).toHaveAttribute("aria-checked", "true");
    expect(easy).toHaveAttribute("aria-checked", "false");
  });

  it("supports roving keyboard navigation (Tab in, ArrowDown moves focus between items)", async () => {
    // Asserts roving focus only, not selection-follows-focus: in a real browser ArrowDown also
    // selects the newly focused radio, but jsdom does not dispatch the focus-driven selection
    // reliably. Selection itself is covered by the click-based single-select test above.
    const user = userEvent.setup();
    render(<Fixture />);

    await user.tab();
    expect(screen.getByRole("radio", { name: "Easy" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Hard" })).toHaveFocus();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Fixture />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
