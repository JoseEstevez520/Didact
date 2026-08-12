import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

import { ProgressIndicator, ProgressOverview } from "./progress-indicator.js";

afterEach(cleanup);

describe("ProgressIndicator", () => {
  it("shows lesson progress as text and an accessible progressbar", () => {
    render(<ProgressIndicator label="Cell biology" kind="lesson" value={3} max={4} />);
    expect(screen.getByText("75% complete")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Lesson: Cell biology" })).toHaveAttribute("aria-valuenow", "3");
  });

  it("does not misrepresent a missing streaming value as zero", () => {
    render(<ProgressIndicator label="Reasoning" kind="skill" />);
    expect(screen.getByText("Progress pending")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Skill: Reasoning" })).not.toHaveAttribute("aria-valuenow");
  });

  it("clamps invalid values and supports translated labels", () => {
    render(<ProgressIndicator label="Tema" kind="lesson" value={15} max={10} labels={{ lesson: "LecciÃ³n", complete: "completado" }} />);
    expect(screen.getByText("100% completado")).toBeVisible();
    expect(screen.getByText("LecciÃ³n:")).toHaveClass("sr-only");
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<ProgressIndicator label="Writing" kind="skill" value={58} description="Current mastery estimate" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ProgressOverview", () => {
  it("renders lesson and skill snapshots in a named list", () => {
    render(<ProgressOverview aria-label="Learning progress" entries={[{ label: "Lesson one", kind: "lesson", value: 100 }, { label: "Analysis", kind: "skill", value: 42 }]} />);
    expect(screen.getByRole("list", { name: "Learning progress" })).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders a localizable empty state", () => {
    render(<ProgressOverview aria-label="Progreso" entries={[]} emptyLabel="Sin datos todavÃ­a." />);
    expect(screen.getByText("Sin datos todavÃ­a.")).toBeVisible();
  });
});
