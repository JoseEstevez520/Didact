import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

import { Progress } from "./progress.js";

afterEach(cleanup);

describe("Progress", () => {
  it("exposes a named determinate value and clamps it to max", () => {
    render(<Progress aria-label="Course progress" value={140} max={100} />);
    const progress = screen.getByRole("progressbar", { name: "Course progress" });
    expect(progress).toHaveAttribute("aria-valuenow", "100");
    expect(progress).toHaveAttribute("aria-valuemax", "100");
  });

  it("supports an indeterminate state while data is unavailable", () => {
    render(<Progress aria-label="Loading progress" value={null} />);
    expect(screen.getByRole("progressbar", { name: "Loading progress" })).not.toHaveAttribute("aria-valuenow");
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Progress aria-label="Accessible progress" value={42} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
