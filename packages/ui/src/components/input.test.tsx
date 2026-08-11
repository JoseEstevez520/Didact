import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Input } from "./input.js";
import { Label } from "./label.js";

afterEach(cleanup);

describe("Input", () => {
  it("renders a native text input carrying its data-slot", () => {
    render(<Input aria-label="Name" defaultValue="" />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" />);
    const input = screen.getByRole("textbox", { name: "Name" });
    await user.type(input, "Ada");
    expect(input).toHaveValue("Ada");
  });

  it("reflects the invalid state via aria-invalid (not color alone)", () => {
    render(<Input aria-label="Name" aria-invalid aria-describedby="err" />);
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute("aria-invalid", "true");
  });

  it("does not accept input when disabled", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" disabled />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toBeDisabled();
    await user.type(input, "x");
    expect(input).toHaveValue("");
  });

  it("has no automatically detectable accessibility violations when labelled", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
