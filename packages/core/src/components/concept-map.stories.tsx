import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConceptMap, type ConceptMapDefinition, type ConceptMapState } from "./concept-map.js";

const carbonCycle: ConceptMapDefinition = {
  id: "science.carbon-cycle",
  title: "Build the carbon cycle",
  description: "Connect reservoirs and processes to explain how carbon moves through an ecosystem.",
  instructions: "Choose two concepts, name the relationship and connect them. Add a missing concept if you need one.",
  nodes: [
    { id: "atmosphere", label: "Atmosphere", position: { x: 50, y: 14 } },
    { id: "plants", label: "Plants", position: { x: 18, y: 48 } },
    { id: "animals", label: "Animals", position: { x: 82, y: 48 } },
    { id: "soil", label: "Soil", position: { x: 50, y: 84 } },
  ],
  initialRelations: [{ id: "photosynthesis", from: "atmosphere", to: "plants", label: "photosynthesis", directed: true }],
  relationLabels: ["photosynthesis", "respiration", "consumption", "decomposition"],
  allowNodeCreation: true,
  allowRelationRemoval: true,
  evaluation: { enabled: true },
};

const incidentProcess: ConceptMapDefinition = {
  id: "business.incident-response",
  title: "Incident response dependencies",
  description: "Map the hand-offs in a production incident without forcing them into one linear sequence.",
  nodes: [
    { id: "alert", label: "Alert", position: { x: 14, y: 50 } },
    { id: "triage", label: "Triage", position: { x: 38, y: 24 } },
    { id: "containment", label: "Containment", position: { x: 64, y: 24 } },
    { id: "recovery", label: "Recovery", position: { x: 86, y: 50 } },
    { id: "review", label: "Post-incident review", position: { x: 50, y: 82 } },
  ],
  initialRelations: [
    { id: "r1", from: "alert", to: "triage", label: "triggers" },
    { id: "r2", from: "triage", to: "containment", label: "informs" },
  ],
  relationLabels: ["triggers", "informs", "requires", "feeds into"],
  allowRelationRemoval: true,
  evaluation: { enabled: true },
};

const evaluateScience = (state: ConceptMapState) => {
  const expected = ["atmosphere:plants", "plants:animals", "animals:atmosphere", "animals:soil"];
  const present = new Set(state.relations.map(({ from, to }) => `${from}:${to}`));
  const correct = expected.filter((relation) => present.has(relation)).length;
  return correct === expected.length
    ? { status: "correct" as const, feedback: "The main carbon transfers are represented." }
    : correct > 1
      ? { status: "partial" as const, feedback: `${correct} of ${expected.length} key transfers are represented.` }
      : { status: "incorrect" as const, feedback: "Add relationships for consumption, respiration and decomposition." };
};

const meta: Meta<typeof ConceptMap> = {
  title: "04 Applied experiences/Knowledge construction/Concept Map",
  component: ConceptMap,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: "min(54rem, calc(100vw - 2rem))" }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ConceptMap>;

export const CarbonCycle: Story = { args: { definition: carbonCycle, evaluate: evaluateScience } };
export const IncidentResponse: Story = {
  args: {
    definition: incidentProcess,
    evaluate: (state) => state.relations.some(({ from, to }) => from === "recovery" && to === "review")
      ? { status: "correct", feedback: "The operational loop includes learning after recovery." }
      : { status: "partial", feedback: "Recovery should feed into the post-incident review." },
  },
};
export const Streaming: Story = { args: { streaming: true } };
export const Disabled: Story = { args: { definition: incidentProcess, disabled: true } };
