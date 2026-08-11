import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Textarea } from "./textarea.js";
import { Label } from "./label.js";

afterEach(cleanup);

describe("Textarea", () => {
  it("renders a native textarea carrying its data-slot", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });

  it("accepts multi-line typed text", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" />);
    const area = screen.getByRole("textbox", { name: "Notes" });
    await user.type(area, "line one{enter}line two");
    expect(area).toHaveValue("line one\nline two");
  });

  it("does not accept input when disabled", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" disabled />);
    const area = screen.getByRole("textbox", { name: "Notes" });
    expect(area).toBeDisabled();
    await user.type(area, "x");
    expect(area).toHaveValue("");
  });

  it("has no automatically detectable accessibility violations when labelled", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
