import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";

import { Timeline, type TimelineStep } from "./timeline.js";

const steps: TimelineStep[] = [
  { id: "prepare", title: "Prepare the sample", description: "Gather the materials." },
  { id: "measure", title: "Measure the result", content: <a href="#results">Open results</a> },
  { id: "record", title: "Record the observation" },
];

describe("Timeline", () => {
  it("renders the sequence as a named ordered list", () => {
    render(<Timeline aria-label="Lab protocol" steps={steps} currentStep={1} />);

    const list = screen.getByRole("list", { name: "Lab protocol" });
    const items = within(list).getAllByRole("listitem");
    expect(list.tagName).toBe("OL");
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute("aria-current", "step");
  });

  it("derives completed, current, and upcoming statuses from currentStep", () => {
    render(<Timeline aria-label="Course steps" steps={steps} currentStep={1} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-status", "complete");
    expect(items[1]).toHaveAttribute("data-status", "current");
    expect(items[2]).toHaveAttribute("data-status", "upcoming");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[2]).not.toHaveAttribute("aria-current");
  });

  it("lets an explicit status override the derived status", () => {
    render(
      <Timeline
        aria-label="Exception handling"
        currentStep={0}
        steps={[{ title: "Already done", status: "complete" }, { title: "Waiting" }]}
      />,
    );

    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("data-status", "complete");
  });

  it("exposes translated textual statuses instead of relying on color", () => {
    render(
      <Timeline
        aria-label="Pasos"
        steps={steps.slice(0, 2)}
        currentStep={1}
        labels={{ complete: "Completado", current: "Paso actual", upcoming: "Próximo" }}
      />,
    );

    expect(screen.getByText("Completado:")).toBeInTheDocument();
    expect(screen.getByText("Paso actual:")).toBeInTheDocument();
  });

  it("preserves rich content and custom markers without making the marker the accessible label", () => {
    render(
      <Timeline
        aria-label="Rich steps"
        steps={[{ title: "Review", marker: <span>R</span>, content: <button>Continue</button> }]}
      />,
    );

    const list = screen.getByRole("list", { name: "Rich steps" });
    expect(within(list).getByRole("button", { name: "Continue" })).toBeInTheDocument();
    expect(within(list).getByText("R").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(within(list).getByText("Upcoming:")).toBeInTheDocument();
  });

  it("supports horizontal orientation and forwards native ordered-list props", () => {
    render(
      <Timeline
        aria-label="Horizontal steps"
        steps={steps}
        orientation="horizontal"
        data-testid="timeline"
      />,
    );

    expect(screen.getByTestId("timeline")).toHaveAttribute("data-orientation", "horizontal");
  });

  it("renders an empty, named ordered list while steps stream in", () => {
    render(<Timeline aria-label="Loading steps" steps={[]} />);
    expect(screen.getByRole("list", { name: "Loading steps" })).toBeEmptyDOMElement();
  });

  it.each(["vertical", "horizontal"] as const)(
    "has no automatically detectable accessibility violations (%s)",
    async (orientation) => {
      const { container } = render(
        <Timeline
          aria-label="Accessible process"
          steps={steps}
          currentStep={1}
          orientation={orientation}
        />,
      );

      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
