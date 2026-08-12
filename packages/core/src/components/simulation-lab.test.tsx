import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SIMULATION_SCHEMA_VERSION, type SimulationDefinition } from "@didact/schema";
import { SimulationLab } from "./simulation-lab.js";

afterEach(cleanup);
const definition: SimulationDefinition = { schemaVersion: SIMULATION_SCHEMA_VERSION, id: "inventory.test", title: "Inventory", parameters: [{ id: "demand", label: "Demand", kind: "number", initial: 5, min: 0, max: 20 }], variables: [{ id: "stock", label: "Stock", kind: "number", initial: 20, precision: 0 }], actions: [{ id: "replenish", label: "Replenish" }], clock: { mode: "manual", stepMs: 1000 }, snapshots: { enabled: true, max: 2 } };
const advance = ({ state }: { state: { parameters: Record<string, string | number | boolean>; values: Record<string, string | number | boolean> } }) => ({ stock: Number(state.values.stock) - Number(state.parameters.demand) });

describe("SimulationLab", () => {
  it("advances deterministically and reports ungraded state", async () => {
    const user = userEvent.setup(); const onStateChange = vi.fn(); const onResult = vi.fn();
    render(<SimulationLab definition={definition} advance={advance} onStateChange={onStateChange} onResult={onResult} />);
    await user.click(screen.getByRole("button", { name: "Advance one step" }));
    expect(screen.getByText("15")).toBeVisible();
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ elapsedMs: 1000, values: { stock: 15 } }), { type: "stepped", deltaMs: 1000 });
    expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({ status: "ungraded" }));
  });
  it("formats long simulation steps in a scale learners can read", async () => {
    const user = userEvent.setup();
    render(<SimulationLab definition={{ ...definition, clock: { mode: "manual", stepMs: 86_400_000 } }} advance={advance} />);
    await user.click(screen.getByRole("button", { name: "Advance one step" }));
    expect(screen.getByText(/Elapsed: 1 day/i)).toBeVisible();
  });
  it("changes parameters and performs injected actions", async () => {
    const user = userEvent.setup(); const action = vi.fn((_id, { state }) => ({ values: { stock: Number(state.values.stock) + 10 } }));
    render(<SimulationLab definition={definition} advance={advance} performAction={action} />);
    await user.clear(screen.getByLabelText("Demand")); await user.type(screen.getByLabelText("Demand"), "8");
    await user.click(screen.getByRole("button", { name: "Replenish" }));
    expect(action).toHaveBeenCalled(); expect(screen.getByText("30")).toBeVisible();
  });
  it("creates, restores and resets snapshots", async () => {
    const user = userEvent.setup(); render(<SimulationLab definition={definition} advance={advance} />);
    await user.click(screen.getByRole("button", { name: "Save snapshot" }));
    await user.click(screen.getByRole("button", { name: "Advance one step" }));
    await user.click(screen.getByRole("button", { name: "Restore" })); expect(screen.getByText("20")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Reset" })); expect(screen.queryByRole("button", { name: "Restore" })).not.toBeInTheDocument();
  });
  it("supports controlled and disabled state", () => {
    render(<SimulationLab definition={definition} advance={advance} disabled state={{ parameters: { demand: 5 }, values: { stock: 12 }, elapsedMs: 0, running: false, snapshots: [] }} />);
    expect(screen.getByText("12")).toBeVisible(); expect(screen.getByRole("button", { name: "Advance one step" })).toBeDisabled();
  });
  it("supports streaming and empty states", () => { const { rerender } = render(<SimulationLab streaming advance={() => ({})} />); expect(screen.getByRole("status")).toHaveTextContent("still loading"); rerender(<SimulationLab advance={() => ({})} />); expect(screen.getByText("There is no simulation to display.")).toBeVisible(); });
  it("has no detectable accessibility violations", async () => { const { container } = render(<SimulationLab definition={definition} advance={advance} />); expect(await axe(container)).toHaveNoViolations(); });
});
