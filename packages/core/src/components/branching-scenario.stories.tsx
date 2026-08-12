import type { Meta, StoryObj } from "@storybook/react-vite";
import { DECISION_GRAPH_SCHEMA_VERSION, type DecisionGraphDefinition } from "@didact/schema";
import { BranchingScenario } from "./branching-scenario.js";

const sales: DecisionGraphDefinition = {
  schemaVersion: DECISION_GRAPH_SCHEMA_VERSION,
  id: "sales.discovery-call",
  title: "Discovery call",
  description: "Practice responding to a prospect without following a fixed script.",
  startNodeId: "opening",
  initialVariables: { trust: 0 },
  navigation: { allowBacktrack: true, allowRestart: true },
  nodes: [
    { id: "opening", kind: "decision", title: "The prospect is in a hurry", body: "They say: ‘I only have two minutes. What are you selling?’", choices: [
      { id: "pitch", label: "Give the complete product pitch", targetNodeId: "lost", consequence: "The pitch uses the little time available without establishing relevance." },
      { id: "question", label: "Ask which operational problem matters most today", targetNodeId: "need", effects: [{ variable: "trust", operation: "increment", value: 1 }], consequence: "A focused question earns permission to understand the context." },
    ] },
    { id: "need", kind: "decision", title: "A concrete need appears", body: "They mention that onboarding takes too long and varies between teams.", choices: [
      { id: "demo", label: "Connect one capability to that onboarding problem", targetNodeId: "success", condition: { variable: "trust", operator: "greater-or-equal", value: 1 }, consequence: "The response stays tied to the need the prospect named." },
      { id: "features", label: "List every available feature", targetNodeId: "lost", consequence: "The conversation loses focus and exceeds the promised time." },
    ] },
    { id: "success", kind: "outcome", body: "The prospect agrees to a longer session with the onboarding lead.", outcome: { status: "completed", label: "Relevant next step agreed", feedback: "The sequence used a focused question, connected the answer to one need, and respected the time constraint." } },
    { id: "lost", kind: "outcome", body: "The prospect ends the call without scheduling a next step.", outcome: { status: "neutral", label: "Conversation ended", feedback: "Review where the response became broader than the information available, then try a more diagnostic route." } },
  ],
};

const safety: DecisionGraphDefinition = {
  schemaVersion: DECISION_GRAPH_SCHEMA_VERSION,
  id: "safety.chemical-spill",
  title: "Respond to a chemical spill",
  description: "Apply a safety procedure when information arrives in stages.",
  startNodeId: "notice",
  initialVariables: { areaIsolated: false },
  navigation: { allowBacktrack: true, allowRestart: true },
  nodes: [
    { id: "notice", kind: "decision", title: "You notice an unidentified liquid", body: "A container is leaking near a busy walkway. No one appears injured.", choices: [
      { id: "clean", label: "Start wiping it up immediately", targetNodeId: "unsafe", consequence: "The substance has not been identified and the required protection is unknown." },
      { id: "isolate", label: "Keep people away and alert the site response contact", targetNodeId: "identify", effects: [{ variable: "areaIsolated", operation: "set", value: true }], consequence: "The immediate exposure risk is reduced before anyone approaches the spill." },
    ] },
    { id: "identify", kind: "decision", title: "The label becomes visible", body: "The response contact confirms that only trained staff with the specified PPE may contain it.", choices: [
      { id: "contain", label: "Maintain isolation and follow the trained response process", targetNodeId: "safe", condition: { variable: "areaIsolated", operator: "equals", value: true }, consequence: "The response follows the identified hazard controls." },
      { id: "reopen", label: "Reopen the walkway while equipment is collected", targetNodeId: "unsafe", consequence: "People would again be exposed to the uncontrolled area." },
    ] },
    { id: "safe", kind: "outcome", body: "The trained team contains the spill and documents the incident.", outcome: { status: "completed", label: "Procedure completed safely", feedback: "Isolation came before identification and containment, preserving the order of the safety controls." } },
    { id: "unsafe", kind: "outcome", body: "The response introduces avoidable exposure.", outcome: { status: "failed", label: "Unsafe response", feedback: "The first priority is controlling access. Cleanup begins only after identification, authorization, and protection requirements are known." } },
  ],
};

const meta: Meta<typeof BranchingScenario> = { title: "04 Applied experiences/Scenarios & simulation/Branching Scenario", component: BranchingScenario, parameters: { layout: "centered" }, decorators: [(Story) => <div style={{ width: "min(42rem, calc(100vw - 2rem))" }}><Story /></div>] };
export default meta;
type Story = StoryObj<typeof meta>;
export const SalesConversation: Story = { args: { definition: sales } };
export const SafetyProcedure: Story = { args: { definition: safety } };
export const Streaming: Story = { args: { streaming: true } };
export const Disabled: Story = { args: { definition: safety, disabled: true } };
