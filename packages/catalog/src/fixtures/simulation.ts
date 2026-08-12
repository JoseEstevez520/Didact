import { SIMULATION_SCHEMA_VERSION, type SimulationDefinition } from "@didact/schema";

export const motionSimulationFixture = {
  schemaVersion: SIMULATION_SCHEMA_VERSION, id: "fixture.horizontal-motion", title: "Horizontal motion",
  parameters: [{ id: "velocity", label: "Velocity", kind: "number", initial: 18, min: -40, max: 40, step: 1, unit: "px/s" }],
  variables: [{ id: "position", label: "Position", kind: "number", initial: 10, unit: "%", precision: 1 }, { id: "direction", label: "Direction", kind: "string", initial: "right" }],
  actions: [{ id: "reverse", label: "Reverse direction" }], clock: { mode: "continuous", stepMs: 100, maxElapsedMs: 30_000 }, snapshots: { enabled: true, max: 4 },
} as const satisfies SimulationDefinition;

export const inventorySimulationFixture = {
  schemaVersion: SIMULATION_SCHEMA_VERSION, id: "fixture.inventory-dynamics", title: "Inventory dynamics",
  parameters: [{ id: "demand", label: "Demand per day", kind: "number", initial: 8, min: 0, max: 30, step: 1, unit: "units" }],
  variables: [{ id: "stock", label: "Available stock", kind: "number", initial: 60, unit: "units", precision: 0 }, { id: "unfulfilled", label: "Unfulfilled demand", kind: "number", initial: 0, unit: "units", precision: 0 }],
  actions: [{ id: "replenish", label: "Receive 30 units" }], clock: { mode: "manual", stepMs: 86_400_000 }, snapshots: { enabled: true, max: 3 },
} as const satisfies SimulationDefinition;

export const simulationFixtures = [motionSimulationFixture, inventorySimulationFixture] as const satisfies readonly SimulationDefinition[];
