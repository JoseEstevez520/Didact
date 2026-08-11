import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group.js";

afterEach(cleanup);

describe("ToggleGroup / ToggleGroupItem", () => {
  it("renders each item with its data-slot and the group's shared variant/size", () => {
    render(
      <ToggleGroup type="single" variant="outline" size="sm" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          Center
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const left = screen.getByRole("radio", { name: "Align left" });
    expect(left).toHaveAttribute("data-slot", "toggle-group-item");
    expect(left).toHaveAttribute("data-variant", "outline");
    expect(left).toHaveAttribute("data-size", "sm");
  });

  it("single-select: selecting one item deselects the previous one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" onValueChange={onValueChange} aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          Center
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const left = screen.getByRole("radio", { name: "Align left" });
    const center = screen.getByRole("radio", { name: "Align center" });

    await user.click(left);
    expect(onValueChange).toHaveBeenLastCalledWith("left");
    expect(left).toHaveAttribute("data-state", "on");

    await user.click(center);
    expect(onValueChange).toHaveBeenLastCalledWith("center");
    expect(center).toHaveAttribute("data-state", "on");
    expect(left).toHaveAttribute("data-state", "off");
  });

  it("multiple-select: items toggle independently", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="multiple" aria-label="Formatting">
        <ToggleGroupItem value="bold" aria-label="Bold">
          B
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          I
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });

    await user.click(bold);
    await user.click(italic);
    expect(bold).toHaveAttribute("data-state", "on");
    expect(italic).toHaveAttribute("data-state", "on");

    await user.click(bold);
    expect(bold).toHaveAttribute("data-state", "off");
    expect(italic).toHaveAttribute("data-state", "on");
  });

  it("supports roving keyboard navigation between items (Tab in, ArrowRight between)", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="single" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          Center
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    await user.tab();
    expect(screen.getByRole("radio", { name: "Align left" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Align center" })).toHaveFocus();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(
      <ToggleGroup type="single" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          Center
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
