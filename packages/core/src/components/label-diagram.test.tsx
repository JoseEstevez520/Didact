import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { LabelDiagram, type LabelDiagramTarget, type LabelDiagramValue } from "./label-diagram.js";

afterEach(cleanup);

const targets: LabelDiagramTarget[] = [
  { id: "upper", label: "Upper chamber", description: "Destination one", x: 0.25, y: 0.3, correctItemIds: ["atrium"] },
  { id: "lower", label: "Lower chamber", description: "Destination two", x: 0.7, y: 0.72, correctItemIds: ["ventricle"] },
];
const items = [
  { id: "atrium", content: "Atrium", accessibleLabel: "Atrium label" },
  { id: "ventricle", content: "Ventricle", accessibleLabel: "Ventricle label" },
  { id: "aorta", content: "Aorta", accessibleLabel: "Aorta label" },
];

describe("LabelDiagram", () => {
  it("assigns labels using the click and keyboard path and does not leak answers", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<LabelDiagram alt="Heart cross-section" media={<svg aria-hidden="true" />} targets={targets} items={items} onValueChange={onValueChange} />);
    expect(screen.getByRole("img", { name: "Heart cross-section" })).toBeInTheDocument();
    expect(document.querySelector("[data-correct], [data-answer]")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Atrium label" }));
    await user.click(screen.getAllByRole("button", { name: "Upper chamber: Empty" })[0]!);
    expect(onValueChange).toHaveBeenLastCalledWith({ upper: "atrium" });
    expect(screen.getByRole("button", { name: "Submit labels" })).toBeDisabled();
  });

  it("grades a mixed response as partial only after submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LabelDiagram alt="Diagram" media={<svg aria-hidden="true" />} targets={targets} items={items} onSubmit={onSubmit} />);
    expect(screen.queryByText("Partially correct")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Atrium label" }));
    await user.click(screen.getAllByRole("button", { name: "Upper chamber: Empty" })[0]!);
    await user.click(screen.getByRole("button", { name: "Aorta label" }));
    await user.click(screen.getAllByRole("button", { name: "Lower chamber: Empty" })[0]!);
    await user.click(screen.getByRole("button", { name: "Submit labels" }));
    expect(screen.getByText("Partially correct")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: "partial", value: { upper: "atrium", lower: "aorta" } }));
  });

  it("returns ungraded when targets do not include an answer key", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const ungraded = targets.map(({ correctItemIds: _key, ...target }) => target);
    render(<LabelDiagram alt="Machine" media={<svg aria-hidden="true" />} targets={ungraded} items={items} defaultValue={{ upper: "atrium", lower: "ventricle" }} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Submit labels" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: "ungraded" }));
    expect(screen.getByText("Response submitted")).toBeInTheDocument();
  });

  it("supports a controlled value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<LabelDiagramValue>({});
      return <LabelDiagram alt="Diagram" media={<svg aria-hidden="true" />} targets={targets} items={items} value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Atrium label" }));
    await user.click(screen.getAllByRole("button", { name: "Upper chamber: Empty" })[0]!);
    expect(screen.getAllByRole("button", { name: "Upper chamber: Atrium label" })).toHaveLength(2);
  });

  it("uses normalized coordinates for responsive destinations", () => {
    render(<LabelDiagram alt="Diagram" media={<svg aria-hidden="true" />} targets={targets} items={items} />);
    const overlay = screen.getAllByRole("button", { name: "Upper chamber: Empty" })[0]!;
    expect(overlay).toHaveStyle({ left: "25%", top: "30%" });
  });

  it("distinguishes streaming, empty, and disabled states", () => {
    const { rerender } = render(<LabelDiagram alt="Loading" streaming />);
    expect(screen.getByText("The diagram is still loading.")).toBeInTheDocument();
    expect(screen.getByText("Destinations are still loading.")).toBeInTheDocument();
    expect(screen.getByText("Labels are still loading.")).toBeInTheDocument();
    rerender(<LabelDiagram alt="Empty" targets={[]} items={[]} />);
    expect(screen.getByText("There is nothing to label yet.")).toBeInTheDocument();
    rerender(<LabelDiagram alt="Disabled" media={<svg aria-hidden="true" />} targets={targets} items={items} disabled />);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it("exposes an equivalent textual destination list and has no axe violations", async () => {
    const { container } = render(<LabelDiagram alt="Heart cross-section" longDescription="Two chambers with numbered destinations." media={<svg aria-hidden="true" />} targets={targets} items={items} />);
    expect(screen.getByRole("img", { name: "Heart cross-section" })).toHaveAccessibleDescription("Two chambers with numbered destinations.");
    expect(screen.getByRole("group", { name: "Destinations" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
