import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Label } from "./label.js";
import { Input } from "./input.js";

afterEach(cleanup);

describe("Label", () => {
  it("renders its text carrying the data-slot", () => {
    render(<Label htmlFor="x">Username</Label>);
    expect(screen.getByText("Username")).toHaveAttribute("data-slot", "label");
  });

  it("associates with a control so clicking the label focuses it", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" />
      </div>,
    );

    await user.click(screen.getByText("Username"));
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveFocus();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
