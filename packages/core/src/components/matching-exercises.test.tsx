import { describe, expect, it, vi } from "vitest";
import { render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { CategorizeExercise, MatchingExercise, SortExercise } from "./matching-exercises.js";

const sources = [
  { id: "fr", content: "France" },
  { id: "jp", content: "Japan" },
];
const targets = [
  { id: "paris", content: "Paris" },
  { id: "tokyo", content: "Tokyo" },
];

describe("MatchingExercise", () => {
  it("supports select-source then select-target without dragging and submits a correct result", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const view = render(
      <MatchingExercise
        title="Match capitals"
        sources={sources}
        targets={targets}
        correctMatches={{ fr: "paris", jp: "tokyo" }}
        onSubmit={onSubmit}
      />,
    );
    const ui = within(view.container);

    await user.click(ui.getByText("France"));
    expect(ui.getByRole("button", { name: "Select France for matching" }))
      .toHaveAttribute("aria-pressed", "true");
    expect(ui.getByRole("button", { name: "Select France for matching" })).toHaveClass("bg-accent");
    expect(ui.getByRole("button", { name: "Select France for matching" })).not.toHaveClass("bg-primary/5");
    expect(ui.queryByText("Not assigned")).not.toBeInTheDocument();
    await user.click(ui.getByText("Paris"));
    await waitFor(() => {
      expect(view.container.querySelectorAll('[data-slot="matching-connectors"] path')).toHaveLength(1);
    });
    expect(view.container.querySelectorAll('[data-connected="true"]')).toHaveLength(2);
    await user.click(ui.getByRole("button", { name: "Select Japan for matching" }));
    await user.click(ui.getByRole("button", { name: "Select Tokyo for matching" }));
    await user.click(ui.getByRole("button", { name: "Check answer" }));

    expect(ui.getByText("Correct")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({ value: { fr: "paris", jp: "tokyo" }, correct: true });
  });

  it("can start a connection from the right-hand side", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const view = render(
      <MatchingExercise title="Match" sources={sources} targets={targets} correctMatches={{}} onValueChange={onValueChange} />,
    );
    const ui = within(view.container);

    await user.click(ui.getByText("Paris"));
    expect(ui.getByRole("button", { name: "Select Paris for matching" })).toHaveAttribute("aria-pressed", "true");
    await user.click(ui.getByText("France"));

    expect(onValueChange).toHaveBeenLastCalledWith({ fr: "paris" });
    expect(view.container.querySelectorAll('[data-slot="matching-connectors"] path')).toHaveLength(1);
    expect(view.container.querySelectorAll('[data-connected="true"]')).toHaveLength(2);
  });

  it("keeps destinations one-to-one when a new source replaces an existing match", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const view = render(
      <MatchingExercise title="Match" sources={sources} targets={targets} correctMatches={{}} onValueChange={onValueChange} />,
    );
    const ui = within(view.container);

    await user.click(ui.getByRole("button", { name: "Select France for matching" }));
    await user.click(ui.getByRole("button", { name: "Select Paris for matching" }));
    await user.click(ui.getByRole("button", { name: "Select Japan for matching" }));
    await user.click(ui.getByRole("button", { name: "Select Paris for matching" }));

    expect(onValueChange).toHaveBeenLastCalledWith({ jp: "paris" });
  });

  it("reports an incorrect result with icon and text, not color alone", async () => {
    const user = userEvent.setup();
    const view = render(
      <MatchingExercise
        title="Match"
        sources={sources}
        targets={targets}
        correctMatches={{ fr: "paris", jp: "tokyo" }}
        defaultValue={{ fr: "tokyo", jp: "paris" }}
      />,
    );
    const ui = within(view.container);
    await user.click(ui.getByRole("button", { name: "Check answer" }));
    expect(ui.getByText("Not quite")).toBeInTheDocument();
    expect(ui.getByText("Not quite").parentElement?.querySelector("svg")).not.toBeNull();
  });
});

describe("SortExercise", () => {
  const items = [
    { id: "one", content: "First" },
    { id: "two", content: "Second" },
    { id: "three", content: "Third" },
  ];

  it("offers explicit move buttons as a non-dragging pointer and keyboard alternative", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const view = render(
      <SortExercise title="Order steps" items={items} correctOrder={["one", "two", "three"]} defaultValue={["two", "one", "three"]} onValueChange={onValueChange} />,
    );
    const ui = within(view.container);

    const up = ui.getByRole("button", { name: "Move First up" });
    up.focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["one", "two", "three"]);
  });

  it("submits the current order and locks controls", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const view = render(<SortExercise title="Order" items={items} correctOrder={["one", "two", "three"]} onSubmit={onSubmit} />);
    const ui = within(view.container);
    await user.click(ui.getByRole("button", { name: "Check answer" }));
    expect(ui.getByText("Correct")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({ value: ["one", "two", "three"], correct: true });
    expect(ui.getByRole("button", { name: "Move First down" })).toBeDisabled();
  });
});

describe("CategorizeExercise", () => {
  const items = [
    { id: "salmon", content: "Salmon" },
    { id: "oak", content: "Oak" },
  ];
  const categories = [
    { id: "animal", content: "Animal" },
    { id: "plant", content: "Plant" },
  ];

  it("assigns multiple items through select-item then select-category", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const view = render(
      <CategorizeExercise title="Classify" items={items} categories={categories} correctCategories={{ salmon: "animal", oak: "plant" }} onSubmit={onSubmit} />,
    );
    const ui = within(view.container);
    await user.click(ui.getByRole("button", { name: "Select Salmon" }));
    await user.click(ui.getByRole("button", { name: /Move selected here.*Animal/ }));
    const animalColumn = ui.getByRole("heading", { name: "Animal" }).closest("section");
    expect(animalColumn).not.toBeNull();
    expect(within(animalColumn!).getByRole("button", { name: "Select Salmon" })).toBeInTheDocument();
    await user.click(ui.getByRole("button", { name: "Select Oak" }));
    await user.click(ui.getByRole("button", { name: /Move selected here.*Plant/ }));
    await user.click(ui.getByRole("button", { name: "Check answer" }));
    expect(onSubmit).toHaveBeenCalledWith({ value: { salmon: "animal", oak: "plant" }, correct: true });
  });
});

describe("RF-3 accessibility and empty states", () => {
  it.each([
    <MatchingExercise key="matching" title="Empty match" sources={[]} targets={[]} correctMatches={{}} />,
    <SortExercise key="sort" title="Empty sort" items={[]} correctOrder={[]} />,
    <CategorizeExercise key="categorize" title="Empty categorize" items={[]} categories={[]} correctCategories={{}} />,
  ])("renders an explicit empty state with no detectable a11y violations", async (component) => {
    const view = render(component);
    expect(within(view.container).getByText("There are no items in this exercise.")).toBeInTheDocument();
    expect(await axe(view.container)).toHaveNoViolations();
  });

  it("has no detectable accessibility violations in populated matching state", async () => {
    const view = render(<MatchingExercise title="Accessible matching" instructions="Match every country." sources={sources} targets={targets} correctMatches={{ fr: "paris", jp: "tokyo" }} />);
    expect(await axe(view.container)).toHaveNoViolations();
  });
});
