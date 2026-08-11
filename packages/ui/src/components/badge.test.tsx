import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

import { Badge } from "./badge.js";

afterEach(cleanup);

describe("Badge", () => {
  it("renders a span by default with its data-slot/data-variant", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("reflects an explicit variant in its data attribute", () => {
    render(<Badge variant="destructive">Overdue</Badge>);
    expect(screen.getByText("Overdue")).toHaveAttribute("data-variant", "destructive");
  });

  it("with asChild, renders onto the child element instead of a <span>", () => {
    render(
      <Badge asChild>
        <a href="/skills/reading">Reading</a>
      </Badge>,
    );
    const link = screen.getByRole("link", { name: "Reading" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("data-slot", "badge");
  });

  it("merges a caller className last", () => {
    render(<Badge className="custom-badge">New</Badge>);
    expect(screen.getByText("New")).toHaveClass("custom-badge");
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Badge variant="outline">Draft</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
