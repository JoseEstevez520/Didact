import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { Hint, Reveal } from "./hint-reveal.js";

afterEach(cleanup);

describe("Reveal", () => {
  it("does not mount protected content until requested and removes it again on hide", async () => {
    const user = userEvent.setup();
    render(<Reveal>Exact protected answer</Reveal>);

    expect(screen.queryByText("Exact protected answer")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reveal solution" }));
    expect(screen.getByRole("region", { name: "Solution" })).toHaveTextContent("Exact protected answer");
    await user.click(screen.getByRole("button", { name: "Hide solution" }));
    expect(screen.queryByText("Exact protected answer")).not.toBeInTheDocument();
  });

  it("supports controlled state without mutating it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Reveal revealed={false} onRevealedChange={onChange}>Answer</Reveal>);
    await user.click(screen.getByRole("button", { name: "Reveal solution" }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Answer")).not.toBeInTheDocument();
  });
});

describe("Hint", () => {
  it("does not reserve an empty content gap before the first reveal", () => {
    const { container } = render(
      <Hint hints={["First clue"]} solution="Protected solution" />,
    );

    expect(container.querySelector('[data-slot="card-content"]')).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show next hint" })).toBeVisible();
  });

  it("reveals hints progressively and never leaks later hints or solution", async () => {
    const user = userEvent.setup();
    render(<Hint hints={["Start with the denominator.", "Find a common multiple."]} solution="The answer is 3/4." />);

    expect(screen.queryByText("Start with the denominator.")).not.toBeInTheDocument();
    expect(screen.queryByText("Find a common multiple.")).not.toBeInTheDocument();
    expect(screen.queryByText("The answer is 3/4.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show next hint" }));
    expect(screen.getByText("Start with the denominator.")).toBeVisible();
    expect(screen.queryByText("Find a common multiple.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show next hint" }));
    expect(screen.getByText("Find a common multiple.")).toBeVisible();
    expect(screen.queryByText("The answer is 3/4.")).not.toBeInTheDocument();
  });

  it("reveals and hides solution plus informative feedback together", async () => {
    const user = userEvent.setup();
    render(<Hint solution="42" feedback="Substitute the value to check it." />);
    await user.click(screen.getByRole("button", { name: "Reveal solution" }));
    expect(screen.getByRole("region", { name: "Solution" })).toHaveTextContent("42");
    expect(screen.getByText("Substitute the value to check it.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Hide solution" }));
    expect(screen.queryByText("42")).not.toBeInTheDocument();
    expect(screen.queryByText("Substitute the value to check it.")).not.toBeInTheDocument();
  });

  it("supports localized labels and partial streaming props", () => {
    const { rerender } = render(<Hint hints={[undefined]} labels={{ title: "¿Una pista?", contentPending: "Cargando…" }} />);
    expect(screen.getByRole("region", { name: "¿Una pista?" })).toBeVisible();
    expect(screen.getByText("Cargando…")).toBeVisible();
    rerender(<Hint hints={["Busca el verbo.", undefined]} labels={{ title: "¿Una pista?", nextHint: "Ver pista" }} />);
    expect(screen.getByRole("button", { name: "Ver pista" })).toBeEnabled();
  });

  it("is keyboard operable and has no automatic accessibility violations", async () => {
    const user = userEvent.setup();
    render(<Hint hints={["A keyboard hint"]} solution="A keyboard solution" />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Show next hint" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("A keyboard hint")).toBeVisible();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
