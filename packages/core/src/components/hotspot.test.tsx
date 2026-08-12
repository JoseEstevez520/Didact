import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Hotspot, type HotspotRegion, type HotspotValue } from "./hotspot.js";

afterEach(cleanup);

const regions: HotspotRegion[] = [
  { id: "north", label: "Northern chamber", description: "Upper half", x: 0.1, y: 0.1, width: 0.35, height: 0.35 },
  { id: "south", label: "Southern chamber", description: "Lower half", x: 0.55, y: 0.55, width: 0.35, height: 0.35 },
];

describe("Hotspot", () => {
  it("offers equivalent overlay and textual region controls without leaking correctness", async () => {
    const user = userEvent.setup();
    render(<Hotspot alt="Two chamber diagram" media={<svg />} regions={regions} grading={{ kind: "regions", correctRegionIds: ["north"] }} />);
    expect(screen.getByRole("img", { name: "Two chamber diagram" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(document.querySelector("[data-correct]")).not.toBeInTheDocument();
    const controls = screen.getAllByRole("button", { name: /Select: Northern chamber|Select$/ });
    expect(controls.length).toBeGreaterThanOrEqual(1);
    await user.click(screen.getAllByRole("button", { name: "Select" })[0]!);
    expect(screen.getByRole("button", { name: "Submit selection" })).toBeEnabled();
  });

  it("grades multiple regions as partial and reveals informative feedback only after submit", async () => {
    const user = userEvent.setup();
    render(<Hotspot alt="Diagram" media={<svg />} regions={regions} selection="multiple" grading={{ kind: "regions", correctRegionIds: ["north", "south"] }} feedback={(result) => `Matched result: ${result}`} />);
    expect(screen.queryByText(/Matched result/)).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Select" })[0]!);
    await user.click(screen.getByRole("button", { name: "Submit selection" }));
    expect(screen.getByRole("status")).toHaveTextContent("Partially correct");
    expect(screen.getByText("Matched result: partial")).toBeInTheDocument();
  });

  it("converts responsive pointer coordinates into normalized values", () => {
    const onValueChange = vi.fn();
    render(<Hotspot alt="Map" media={<svg />} interaction="points" onValueChange={onValueChange} />);
    const diagram = screen.getByRole("img", { name: "Map" }).parentElement!;
    vi.spyOn(diagram, "getBoundingClientRect").mockReturnValue({ x: 100, y: 50, left: 100, top: 50, right: 500, bottom: 250, width: 400, height: 200, toJSON: () => ({}) });
    fireEvent.click(diagram, { clientX: 300, clientY: 100 });
    expect(onValueChange).toHaveBeenCalledWith({ regionIds: [], points: [{ x: 0.5, y: 0.25 }] });
  });

  it("provides a keyboard-operable numeric alternative for free points", async () => {
    const user = userEvent.setup();
    render(<Hotspot alt="Map" media={<svg />} interaction="points" />);
    const x = screen.getByRole("spinbutton", { name: "Horizontal position (%)" });
    const y = screen.getByRole("spinbutton", { name: "Vertical position (%)" });
    await user.clear(x); await user.type(x, "25");
    await user.clear(y); await user.type(y, "75");
    await user.click(screen.getByRole("button", { name: "Add point" }));
    expect(screen.getByText("25%, 75%")).toBeInTheDocument();
  });

  it("supports controlled single selection", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<HotspotValue>({ regionIds: [], points: [] });
      return <Hotspot alt="Diagram" media={<svg />} regions={regions} value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    await user.click(screen.getAllByRole("button", { name: "Select" })[1]!);
    expect(screen.getByRole("button", { name: /Selected · Remove/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("returns ungraded when no answer key is supplied", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Hotspot alt="Diagram" media={<svg />} regions={regions} onSubmit={onSubmit} />);
    await user.click(screen.getAllByRole("button", { name: "Select" })[0]!);
    await user.click(screen.getByRole("button", { name: "Submit selection" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ result: "ungraded" }));
    expect(screen.getByRole("status")).toHaveTextContent("Response submitted");
  });

  it("handles streaming and disabled states", () => {
    const { rerender } = render(<Hotspot alt="Loading diagram" />);
    expect(screen.getByText("Diagram is still loading.")).toBeInTheDocument();
    expect(screen.getByText("Regions are still loading.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit selection" })).toBeDisabled();
    rerender(<Hotspot alt="Diagram" media={<svg />} regions={regions} disabled />);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it("exposes alt and long description and has no axe violations", async () => {
    const { container } = render(<Hotspot alt="Anatomical heart diagram" longDescription="The upper chamber appears above the lower chamber." media={<svg aria-hidden="true" />} regions={regions} />);
    expect(screen.getByRole("img", { name: "Anatomical heart diagram" })).toHaveAccessibleDescription("The upper chamber appears above the lower chamber.");
    expect(await axe(container)).toHaveNoViolations();
  });
});
