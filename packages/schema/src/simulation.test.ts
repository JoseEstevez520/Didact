import { describe, expect, it } from "vitest";
import { createSimulationInitialState, SIMULATION_SCHEMA_VERSION, validateSimulationDefinition, validateSimulationState, type SimulationDefinition } from "./simulation";

const definition: SimulationDefinition = {
  schemaVersion: SIMULATION_SCHEMA_VERSION, id: "motion.horizontal", title: "Horizontal motion",
  parameters: [{ id: "speed", label: "Speed", kind: "number", initial: 2, min: 0, max: 10, step: 0.5, unit: "m/s" }],
  variables: [{ id: "position", label: "Position", kind: "number", initial: 0, unit: "m", precision: 2 }],
  actions: [{ id: "reverse", label: "Reverse" }], clock: { mode: "continuous", stepMs: 100, maxElapsedMs: 10_000 }, snapshots: { enabled: true, max: 3 },
};

describe("simulation schema", () => {
  it("validates a complete definition", () => expect(validateSimulationDefinition(definition).success).toBe(true));
  it("creates deterministic initial state", () => expect(createSimulationInitialState(definition)).toEqual({ parameters: { speed: 2 }, values: { position: 0 }, elapsedMs: 0, running: false, snapshots: [] }));
  it("validates state against declared values", () => expect(validateSimulationState(createSimulationInitialState(definition), definition).success).toBe(true));
  it("rejects duplicate ids and invalid clock", () => {
    const result = validateSimulationDefinition({ ...definition, variables: [{ id: "speed", label: "Position", kind: "number", initial: 0 }], clock: { mode: "continuous", stepMs: 0 } });
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining(["simulation.field-duplicate", "simulation.clock-step"]));
  });
  it("accepts a partial streaming definition", () => expect(validateSimulationDefinition({ schemaVersion: SIMULATION_SCHEMA_VERSION, id: "draft", parameters: [], variables: [], clock: { mode: "manual", stepMs: 1 } }, { mode: "streaming" }).success).toBe(true));
  it("rejects state with missing variables", () => expect(validateSimulationState({ parameters: { speed: 2 }, values: {}, elapsedMs: 0, running: false, snapshots: [] }, definition).issues.some(({ code }) => code === "simulation.state-variable")).toBe(true));
});
