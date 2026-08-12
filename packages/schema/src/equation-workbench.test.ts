import { describe, expect, it } from "vitest";
import { EQUATION_WORKBENCH_SCHEMA_VERSION, validateEquationWorkbenchDefinition, validateEquationWorkbenchResult, validateEquationWorkbenchState, type EquationWorkbenchDefinition } from "./equation-workbench";

const definition: EquationWorkbenchDefinition = { schemaVersion: EQUATION_WORKBENCH_SCHEMA_VERSION, id: "algebra.linear", title: "Linear equation", prompt: "Solve for x", initialExpression: { notation: "latex", value: "2x+3=9", accessibleText: "two x plus three equals nine" }, variables: ["x"], stepPolicy: { minimumSteps: 2, maximumSteps: 4, requireJustification: true } };
const state = { status: "submitted" as const, steps: [{ id: "subtract", expression: { notation: "latex" as const, value: "2x=6" }, justification: "Subtract three" }, { id: "divide", expression: { notation: "latex" as const, value: "x=3" }, justification: "Divide by two" }] };

describe("equation workbench schema", () => {
  it("accepts a complete definition", () => expect(validateEquationWorkbenchDefinition(definition).success).toBe(true));
  it("accepts partial streaming definitions", () => expect(validateEquationWorkbenchDefinition({ id: "draft" }, { mode: "streaming" }).success).toBe(true));
  it("rejects invalid step ranges and duplicate variables", () => expect(validateEquationWorkbenchDefinition({ ...definition, variables: ["x", "x"], stepPolicy: { minimumSteps: 3, maximumSteps: 2 } }).success).toBe(false));
  it("validates submitted steps against policy", () => { expect(validateEquationWorkbenchState(state, definition).success).toBe(true); expect(validateEquationWorkbenchState({ status: "submitted", steps: state.steps.slice(0, 1) }, definition).success).toBe(false); });
  it("accepts externally produced evaluation data and events", () => expect(validateEquationWorkbenchResult({ status: "correct", state, score: 1, maxScore: 1, feedback: ["Valid transformation"], events: [{ type: "submitted" }] }, definition).success).toBe(true));
  it("survives JSON round trips", () => expect(validateEquationWorkbenchDefinition(JSON.parse(JSON.stringify(definition))).success).toBe(true));
});
