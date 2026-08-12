import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

import { NumericQuestion } from "./numeric-question.js";

afterEach(cleanup);

describe("NumericQuestion", () => {
  it("grades an absolute tolerance without exposing the answer before submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <NumericQuestion
        prompt="Estimate pi"
        rule={{ kind: "value", value: 3.14, tolerance: { absolute: 0.01 } }}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByText(/3\.14/)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Your answer"), "3.149");
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      rawValue: "3.149",
      value: 3.149,
      status: "correct",
      reason: "matched",
    }));
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByLabelText("Your answer")).toBeDisabled();
  });

  it("combines relative and absolute tolerances with an explicit policy", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <NumericQuestion
        prompt="Measurement"
        defaultValue="108"
        rule={{
          kind: "value",
          value: 100,
          tolerance: { absolute: 5, relative: 0.1, mode: "both" },
        }}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      status: "incorrect",
      reason: "outside-tolerance",
    }));
    expect(screen.getByText("Expected value: 100")).toBeInTheDocument();
  });

  it("supports inclusive and exclusive range boundaries", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <NumericQuestion
        prompt="Normal range"
        defaultValue="10"
        rule={{ kind: "range", min: 10, max: 20, includeMin: false }}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: "incorrect" }));
    expect(screen.getByText("Accepted range: (10, 20]")).toBeInTheDocument();
  });

  it("distinguishes a fixed display unit from a required typed unit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(
      <NumericQuestion
        prompt="Length"
        unit={{ symbol: "cm", policy: "display" }}
        rule={{ kind: "value", value: 12 }}
        defaultValue="12"
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText("cm")).toHaveAttribute("aria-hidden", "true");
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ status: "correct", unit: "cm" }));

    rerender(
      <NumericQuestion
        key="required"
        prompt="Mass"
        unit={{ symbol: "kg", policy: "required", aliases: ["kilograms"] }}
        rule={{ kind: "value", value: 2 }}
        defaultValue="2 kilograms"
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText("Include the unit kg.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ status: "correct", value: 2 }));
  });

  it("reports malformed numbers and missing required units informatively", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <NumericQuestion prompt="Value" defaultValue="1,000" rule={{ kind: "value", value: 1000 }} />,
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Enter a valid number.")).toBeInTheDocument();
    expect(screen.getByLabelText("Your answer")).toHaveAttribute("aria-invalid", "true");

    rerender(
      <NumericQuestion
        key="unit"
        prompt="Speed"
        defaultValue="30"
        unit={{ symbol: "m/s", policy: "required" }}
        rule={{ kind: "value", value: 30 }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Use the required unit m/s.")).toBeInTheDocument();
  });

  it("accepts a localized decimal separator and can remain deliberately ungraded", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <NumericQuestion
        prompt="Your estimate"
        numberFormat={{ decimalSeparator: ",", allowExponent: false }}
        defaultValue="2,5"
        feedback={{ ungraded: "Compare estimates with your group." }}
        onSubmit={onSubmit}
        labels={{ submit: "Enviar", ungraded: "Respuesta registrada" }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      value: 2.5,
      status: "ungraded",
      reason: "ungraded",
    }));
    expect(screen.getByText("Respuesta registrada")).toBeInTheDocument();
    expect(screen.getByText("Compare estimates with your group.")).toBeInTheDocument();
  });

  it("supports controlled input and submitted state", () => {
    const onValueChange = vi.fn();
    const onSubmittedChange = vi.fn();
    render(
      <NumericQuestion
        prompt="Controlled"
        value="4"
        onValueChange={onValueChange}
        submitted={false}
        onSubmittedChange={onSubmittedChange}
        rule={{ kind: "value", value: 4 }}
      />,
    );
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "42" } });
    expect(onValueChange).toHaveBeenCalledWith("42");
    expect(screen.getByLabelText("Your answer")).toHaveValue("4");
    fireEvent.submit(screen.getByRole("button", { name: "Check answer" }).closest("form")!);
    expect(onSubmittedChange).toHaveBeenCalledWith(true);
  });

  it("renders streaming, disabled and pre-submitted states safely", () => {
    const { rerender } = render(<NumericQuestion key="streaming" />);
    expect(screen.getByText("The question is still loading.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();

    rerender(<NumericQuestion key="locked" prompt="Locked" defaultValue="8" disabled />);
    expect(screen.getByLabelText("Your answer")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();

    rerender(
      <NumericQuestion
        key="completed"
        prompt="Completed"
        defaultValue="8"
        defaultSubmitted
        rule={{ kind: "value", value: 8 }}
      />,
    );
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("submits from the keyboard and has no detectable accessibility violations", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <NumericQuestion
        prompt="Temperature"
        description="Use one decimal place."
        defaultValue="37.0 °C"
        unit={{ symbol: "°C", policy: "required" }}
        rule={{ kind: "range", min: 36.5, max: 37.5 }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
    screen.getByLabelText("Your answer").focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
