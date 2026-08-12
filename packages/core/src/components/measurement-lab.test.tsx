import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeasurementLab, type MeasurementLabDefinition } from "./measurement-lab.js";

afterEach(cleanup);

const definition: MeasurementLabDefinition = {
  id: "temperature",
  title: "Read the thermometer",
  instructions: "Set the measured temperature.",
  instrument: { kind: "linear", min: -10, max: 50, step: 0.5, majorStep: 10, unit: "°C" },
};

describe("MeasurementLab", () => {
  it("keeps the reading controlled", () => {
    const onStateChange = vi.fn();
    const { rerender } = render(<MeasurementLab definition={definition} state={{ reading: 10 }} onStateChange={onStateChange} />);
    fireEvent.change(screen.getByLabelText("Set the measured value"), { target: { value: "20" } });
    expect(onStateChange).toHaveBeenCalledWith({ reading: 20 });
    expect(screen.getByLabelText("Current reading")).toHaveValue(10);
    rerender(<MeasurementLab definition={definition} state={{ reading: 20 }} onStateChange={onStateChange} />);
    expect(screen.getByLabelText("Current reading")).toHaveValue(20);
  });

  it("supports keyboard-accessible exact entry", () => {
    render(<MeasurementLab definition={definition} />);
    fireEvent.change(screen.getByLabelText("Current reading"), { target: { value: "12.5" } });
    expect(screen.getByLabelText("Current reading")).toHaveValue(12.5);
  });

  it("is ungraded without a host evaluator", async () => {
    const onSubmit = vi.fn();
    render(<MeasurementLab definition={definition} defaultState={{ reading: 15 }} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit reading" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: "ungraded", reading: 15, unit: "°C" })));
  });

  it("shows injected feedback only after submission", async () => {
    render(<MeasurementLab definition={definition} defaultState={{ reading: 21 }} evaluate={() => ({ status: "correct", feedback: "Within the accepted uncertainty." })} />);
    expect(screen.queryByText("Within the accepted uncertainty.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Submit reading" }));
    expect(await screen.findByText("Within the accepted uncertainty.")).toBeInTheDocument();
  });

  it("renders a dial from the same state contract", () => {
    render(<MeasurementLab definition={{ ...definition, instrument: { kind: "dial", min: 0, max: 100, step: 1, majorStep: 20, unit: "kPa" } }} defaultState={{ reading: 40 }} />);
    expect(screen.getByRole("img", { name: "Indicator at 40 kPa." })).toBeInTheDocument();
  });

  it("keeps an observed instrument reading independent from the learner response", () => {
    render(<MeasurementLab definition={{ ...definition, observedReading: 21.5 }} defaultState={{ reading: 10 }} />);
    expect(screen.getByRole("img", { name: "Indicator between 20.0 and 30.0 °C." })).toBeInTheDocument();
    expect(screen.getByLabelText("Current reading")).toHaveValue(10);
  });

  it("handles streaming, empty and disabled states", () => {
    const { rerender } = render(<MeasurementLab streaming />);
    expect(screen.getByText("The instrument is still loading.")).toBeInTheDocument();
    rerender(<MeasurementLab />);
    expect(screen.getByText("There is no instrument to measure yet.")).toBeInTheDocument();
    rerender(<MeasurementLab definition={definition} disabled defaultState={{ reading: 10 }} />);
    expect(screen.getByRole("button", { name: "Submit reading" })).toBeDisabled();
  });

  it("has no obvious accessibility violations", async () => {
    const { container } = render(<MeasurementLab definition={definition} defaultState={{ reading: 18.5 }} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
