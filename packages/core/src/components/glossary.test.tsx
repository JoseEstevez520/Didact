import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Glossary, Term } from "./glossary.js";

afterEach(cleanup);

describe("Term", () => {
  it("opens in place and closes with Escape while restoring focus (RF-5/RF-12)", async () => {
    const user = userEvent.setup();
    render(<p>A <Term term="habitat" definition="The place where an organism lives." />.</p>);

    const trigger = screen.getByRole("button", { name: "habitat" });
    await user.click(trigger);
    expect(screen.getByText("The place where an organism lives.")).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("The place where an organism lives.")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps an active-recall definition out of the DOM until explicitly revealed", async () => {
    const user = userEvent.setup();
    render(
      <Term
        term="mitosis"
        definition="Cell division producing two genetically identical daughter cells."
        recallPrompt="Try to define it before looking."
      />,
    );

    await user.click(screen.getByRole("button", { name: "mitosis" }));
    expect(screen.getByText("Try to define it before looking.")).toBeVisible();
    expect(screen.queryByText(/Cell division producing/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reveal definition" }));
    expect(screen.getByText(/Cell division producing/)).toBeVisible();
  });

  it("supports controlled state and open-state notification", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Term term="atom" definition="Smallest unit of an element." open={false} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "atom" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("has no automatically detectable accessibility violations while open", async () => {
    const user = userEvent.setup();
    render(<Term term="orbit" definition="A repeating path around a body." />);
    await user.click(screen.getByRole("button", { name: "orbit" }));
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("Glossary", () => {
  it("renders entries as a named list", () => {
    render(
      <Glossary
        aria-label="Biology glossary"
        entries={[{ id: "cell", term: "Cell", definition: "The basic unit of life." }]}
      />,
    );
    const list = screen.getByRole("list", { name: "Biology glossary" });
    expect(list).toContainElement(screen.getByRole("button", { name: "Cell" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders a useful, localizable empty state while entries stream in", () => {
    render(<Glossary aria-label="Glosario" entries={[]} emptyLabel="AÃºn no hay tÃ©rminos." />);
    expect(screen.getByText("AÃºn no hay tÃ©rminos.")).toBeVisible();
  });
});
