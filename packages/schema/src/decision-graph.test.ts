import { describe, expect, it } from "vitest";
import { applyDecisionEffects, DECISION_GRAPH_SCHEMA_VERSION, evaluateDecisionCondition, validateDecisionGraphDefinition, type DecisionGraphDefinition } from "./decision-graph";

const valid: DecisionGraphDefinition = {
  schemaVersion: DECISION_GRAPH_SCHEMA_VERSION,
  id: "sales.discovery",
  title: "Discovery call",
  startNodeId: "opening",
  initialVariables: { trust: 0, consent: false },
  navigation: { allowBacktrack: true, allowRestart: true },
  nodes: [
    { id: "opening", kind: "decision", body: "The client is short on time.", choices: [
      { id: "ask", label: "Ask one focused question", targetNodeId: "discovery", effects: [{ variable: "trust", operation: "increment", value: 1 }] },
      { id: "pitch", label: "Start the pitch", targetNodeId: "end" },
    ] },
    { id: "discovery", kind: "decision", body: "You have permission to continue.", choices: [{ id: "continue", label: "Continue", targetNodeId: "success", condition: { variable: "trust", operator: "greater-or-equal", value: 1 } }] },
    { id: "success", kind: "outcome", body: "A next step is agreed.", outcome: { status: "completed", label: "Qualified conversation" } },
    { id: "end", kind: "outcome", body: "The client ends the call.", outcome: { status: "neutral", label: "Conversation ended" } },
  ],
};

describe("decision graph", () => {
  it("validates a complete graph", () => expect(validateDecisionGraphDefinition(valid).success).toBe(true));
  it("accepts partial streaming definitions", () => expect(validateDecisionGraphDefinition({ schemaVersion: DECISION_GRAPH_SCHEMA_VERSION, id: "draft", nodes: [] }, { mode: "streaming" }).success).toBe(true));
  it("rejects broken node references", () => {
    const result = validateDecisionGraphDefinition({ ...valid, startNodeId: "missing", nodes: [{ ...valid.nodes[0], choices: [{ id: "bad", label: "Bad", targetNodeId: "missing" }] }] });
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining(["decision.start-reference", "decision.target-reference"]));
  });
  it("rejects duplicate nodes and undeclared variables", () => {
    const result = validateDecisionGraphDefinition({ ...valid, nodes: [valid.nodes[0], valid.nodes[0], { id: "x", kind: "decision", body: "x", choices: [{ id: "x", label: "x", targetNodeId: "opening", condition: { variable: "missing", operator: "truthy" } }] }] });
    expect(result.issues.map(({ code }) => code)).toEqual(expect.arrayContaining(["decision.node-duplicate", "decision.variable-reference"]));
  });
  it("evaluates typed conditions", () => {
    expect(evaluateDecisionCondition({ variable: "score", operator: "greater-than", value: 2 }, { score: 3 })).toBe(true);
    expect(evaluateDecisionCondition({ variable: "ready", operator: "truthy" }, { ready: false })).toBe(false);
  });
  it("applies immutable effects", () => {
    const before = { count: 1, active: false } as const;
    expect(applyDecisionEffects(before, [{ variable: "count", operation: "increment", value: 2 }, { variable: "active", operation: "toggle" }])).toEqual({ count: 3, active: true });
    expect(before).toEqual({ count: 1, active: false });
  });
});
