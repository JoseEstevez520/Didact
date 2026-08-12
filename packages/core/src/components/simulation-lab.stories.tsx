import type { Meta, StoryObj } from "@storybook/react-vite";
import { SIMULATION_SCHEMA_VERSION, type SimulationDefinition } from "@didact/schema";
import { SimulationLab } from "./simulation-lab.js";

const motion: SimulationDefinition = {
  schemaVersion: SIMULATION_SCHEMA_VERSION, id: "motion.horizontal", title: "Horizontal motion", description: "Change velocity, advance time and inspect how position evolves.",
  parameters: [{ id: "velocity", label: "Velocity", kind: "number", initial: 18, min: -40, max: 40, step: 1, unit: "px/s" }],
  variables: [{ id: "position", label: "Position", kind: "number", initial: 10, unit: "%", precision: 1 }, { id: "direction", label: "Direction", kind: "string", initial: "right" }],
  actions: [{ id: "reverse", label: "Reverse direction" }], clock: { mode: "continuous", stepMs: 100, maxElapsedMs: 30_000 }, snapshots: { enabled: true, max: 4 },
};

const inventory: SimulationDefinition = {
  schemaVersion: SIMULATION_SCHEMA_VERSION, id: "operations.inventory", title: "Inventory dynamics", description: "Balance demand and replenishment without relying on animation or keyframes.",
  parameters: [{ id: "demand", label: "Demand per day", kind: "number", initial: 8, min: 0, max: 30, step: 1, unit: "units" }],
  variables: [{ id: "stock", label: "Available stock", kind: "number", initial: 60, unit: "units", precision: 0 }, { id: "unfulfilled", label: "Unfulfilled demand", kind: "number", initial: 0, unit: "units", precision: 0 }],
  actions: [{ id: "replenish", label: "Receive 30 units" }], clock: { mode: "manual", stepMs: 86_400_000 }, snapshots: { enabled: true, max: 3 },
};

const meta: Meta<typeof SimulationLab> = { title: "04 Applied experiences/Scenarios & simulation/Simulation Lab", component: SimulationLab, parameters: { layout: "centered" }, decorators: [(Story) => <div style={{ width: "min(48rem, calc(100vw - 2rem))" }}><Story /></div>] };
export default meta;
type Story = StoryObj<typeof SimulationLab>;

export const MotionSystem: Story = { args: {
  definition: motion,
  advance: ({ state }, deltaMs) => { const velocity = Number(state.parameters.velocity); const raw = Number(state.values.position) + velocity * deltaMs / 1000; const position = ((raw % 100) + 100) % 100; return { ...state.values, position, direction: velocity >= 0 ? "right" : "left" }; },
  performAction: (id, { state }) => id === "reverse" ? { parameters: { ...state.parameters, velocity: -Number(state.parameters.velocity) } } : undefined,
  renderSystem: ({ state }) => <div className="relative h-40" aria-label={`Object at ${Number(state.values.position).toFixed(1)} percent`}><div className="absolute inset-x-6 top-1/2 h-px bg-border" /><div className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-background transition-[left] duration-100" style={{ left: `${state.values.position}%` }} /></div>,
} };

export const InventorySystem: Story = { args: {
  definition: inventory,
  advance: ({ state }) => { const demand = Number(state.parameters.demand); const stock = Number(state.values.stock); return { stock: Math.max(0, stock - demand), unfulfilled: Number(state.values.unfulfilled) + Math.max(0, demand - stock) }; },
  performAction: (id, { state }) => id === "replenish" ? { values: { ...state.values, stock: Number(state.values.stock) + 30 } } : undefined,
  renderSystem: ({ state }) => <div className="space-y-3 p-5"><p className="text-sm text-muted-foreground">Warehouse capacity</p><div className="h-3 overflow-hidden rounded-full border"><div className="h-full bg-foreground transition-[width]" style={{ width: `${Math.min(100, Number(state.values.stock))}%` }} /></div></div>,
} };

export const Streaming: Story = { args: { streaming: true, advance: () => ({}) } };
export const Disabled: Story = { args: { ...InventorySystem.args, disabled: true } };
