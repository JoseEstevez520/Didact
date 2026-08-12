import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

afterEach(cleanup);

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Open notes</PopoverTrigger>
      <PopoverContent aria-label="Notes">Supplementary content</PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("opens from the keyboard, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.tab();
    const trigger = screen.getByRole("button", { name: "Open notes" });
    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByText("Supplementary content")).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Supplementary content")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open notes" }));
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
