import { DECISION_GRAPH_SCHEMA_VERSION, type DecisionGraphDefinition } from "@didact/schema";

export const salesConversationFixture = {
  schemaVersion: DECISION_GRAPH_SCHEMA_VERSION, id: "fixture.sales-discovery", title: "Discovery call", startNodeId: "opening", initialVariables: { trust: 0 }, navigation: { allowBacktrack: true, allowRestart: true }, nodes: [
    { id: "opening", kind: "decision", body: "The prospect has two minutes.", choices: [
      { id: "ask", label: "Ask one focused diagnostic question", targetNodeId: "need", effects: [{ variable: "trust", operation: "increment", value: 1 }] },
      { id: "pitch", label: "Give the complete pitch", targetNodeId: "ended" },
    ] },
    { id: "need", kind: "decision", body: "A concrete onboarding need appears.", choices: [{ id: "connect", label: "Connect one capability to the need", targetNodeId: "success", condition: { variable: "trust", operator: "greater-or-equal", value: 1 } }] },
    { id: "success", kind: "outcome", body: "A relevant next step is agreed.", outcome: { status: "completed", label: "Qualified conversation" } },
    { id: "ended", kind: "outcome", body: "The call ends.", outcome: { status: "neutral", label: "No next step" } },
  ],
} as const satisfies DecisionGraphDefinition;

export const safetyProcedureFixture = {
  schemaVersion: DECISION_GRAPH_SCHEMA_VERSION, id: "fixture.spill-response", title: "Chemical spill response", startNodeId: "notice", initialVariables: { isolated: false }, navigation: { allowBacktrack: true, allowRestart: true }, nodes: [
    { id: "notice", kind: "decision", body: "An unidentified liquid is leaking near a walkway.", choices: [
      { id: "isolate", label: "Isolate the area and alert the response contact", targetNodeId: "identified", effects: [{ variable: "isolated", operation: "set", value: true }] },
      { id: "clean", label: "Clean it immediately", targetNodeId: "unsafe" },
    ] },
    { id: "identified", kind: "decision", body: "The response requirements are now known.", choices: [{ id: "contain", label: "Follow the trained containment process", targetNodeId: "safe", condition: { variable: "isolated", operator: "truthy" } }] },
    { id: "safe", kind: "outcome", body: "The spill is contained and documented.", outcome: { status: "completed", label: "Safe procedure" } },
    { id: "unsafe", kind: "outcome", body: "The action creates avoidable exposure.", outcome: { status: "failed", label: "Unsafe response" } },
  ],
} as const satisfies DecisionGraphDefinition;

export const decisionGraphFixtures = [salesConversationFixture, safetyProcedureFixture] as const satisfies readonly DecisionGraphDefinition[];
