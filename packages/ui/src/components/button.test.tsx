import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Button } from "./button.js";

// See packages/core's flashcard.test.tsx for why this is needed: this workspace's vitest config
// does not enable `test.globals`, so Testing Library's auto-cleanup never registers itself.
afterEach(cleanup);

describe("Button", () => {
  it("renders a native button by default, with its data-slot/data-variant/data-size", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).toHaveAttribute("data-size", "default");
  });

  it("reflects an explicit variant and size in their data attributes", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveAttribute("data-variant", "destructive");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("is operable from the keyboard alone (Tab + Enter), not just the mouse", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Continue
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("with asChild, renders its classes/behavior onto the child element instead of a <button>", () => {
    render(
      <Button asChild>
        <a href="/lessons">Go to lessons</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Go to lessons" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("merges a caller className last, after its own variant classes", () => {
    render(<Button className="custom-class">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("custom-class");
    expect(button.className).toContain("inline-flex");
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Button>Save</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no automatically detectable accessibility violations when disabled", async () => {
    const { container } = render(<Button disabled>Save</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
