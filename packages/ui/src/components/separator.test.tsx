import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

import { Separator } from "./separator.js";

afterEach(cleanup);

describe("Separator", () => {
  it("is decorative (role=none) by default, since a decorative divider needs no semantics", () => {
    render(<Separator data-testid="sep" />);
    const separator = screen.getByTestId("sep");
    expect(separator).toHaveAttribute("data-slot", "separator");
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    // Radix renders decorative separators with role="none" rather than "separator".
    expect(separator).toHaveAttribute("role", "none");
  });

  it("exposes role=separator and aria-orientation when explicitly marked non-decorative", () => {
    render(<Separator decorative={false} orientation="vertical" data-testid="sep" />);
    const separator = screen.getByTestId("sep");
    expect(separator).toHaveAttribute("role", "separator");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
  });

  it("has no automatically detectable accessibility violations (decorative)", async () => {
    const { container } = render(<Separator />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no automatically detectable accessibility violations (semantic, vertical)", async () => {
    const { container } = render(<Separator decorative={false} orientation="vertical" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
