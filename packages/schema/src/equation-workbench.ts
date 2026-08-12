import type { LocalizedText, ValidationIssue, ValidationResult } from "./types";

export const EQUATION_WORKBENCH_SCHEMA_VERSION = "1.0.0" as const;

export interface EquationExpression {
  readonly notation: "latex" | "plain-text";
  readonly value: string;
  readonly accessibleText?: LocalizedText;
}

export interface EquationStepPolicy {
  readonly minimumSteps?: number;
  readonly maximumSteps?: number;
  readonly requireJustification?: boolean;
}

export interface EquationWorkbenchDefinition {
  readonly schemaVersion: typeof EQUATION_WORKBENCH_SCHEMA_VERSION;
  readonly id: string;
  readonly title: LocalizedText;
  readonly prompt: LocalizedText;
  readonly initialExpression: EquationExpression;
  readonly goal?: LocalizedText;
  readonly variables?: readonly string[];
  readonly stepPolicy?: EquationStepPolicy;
}

export interface EquationWorkbenchStep {
  readonly id: string;
  readonly expression: EquationExpression;
  readonly justification?: string;
}

export interface EquationWorkbenchState {
  readonly status: "draft" | "submitted";
  readonly steps: readonly EquationWorkbenchStep[];
}

export type EquationWorkbenchEvent =
  | { readonly type: "step-added"; readonly step: EquationWorkbenchStep }
  | { readonly type: "step-updated"; readonly step: EquationWorkbenchStep }
  | { readonly type: "step-removed"; readonly stepId: string }
  | { readonly type: "submitted" };

/** Evaluation is supplied by the host; the schema never parses or executes expressions. */
export interface EquationWorkbenchResult {
  readonly status: "ungraded" | "correct" | "incorrect" | "partial";
  readonly state: EquationWorkbenchState;
  readonly score?: number;
  readonly maxScore?: number;
  readonly feedback?: readonly LocalizedText[];
  readonly evaluatedAt?: string;
  readonly events?: readonly EquationWorkbenchEvent[];
}

export interface EquationWorkbenchValidationOptions { readonly mode?: "complete" | "streaming" }

const ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const VARIABLE = /^[A-Za-z][A-Za-z0-9_]*$/;
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): boolean => typeof value === "string" ? value.trim().length > 0 : record(value) && Object.keys(value).length > 0 && Object.values(value).every((entry) => typeof entry === "string" && entry.trim().length > 0);
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const identifier = (value: unknown): value is string => typeof value === "string" && ID.test(value);
const add = (issues: ValidationIssue[], path: string, code: string, message: string): void => { issues.push({ path, code, message, severity: "error" }); };

function validateExpression(value: unknown, path: string, issues: ValidationIssue[], complete: boolean): void {
  if (!record(value)) { if (complete) add(issues, path, "equation.expression", "Expression is required."); return; }
  if (value.notation !== "latex" && value.notation !== "plain-text") add(issues, `${path}.notation`, "equation.notation", "notation must be latex or plain-text.");
  if (complete && (typeof value.value !== "string" || value.value.trim().length === 0)) add(issues, `${path}.value`, "equation.expression-value", "Expression value is required.");
  if (value.value !== undefined && typeof value.value !== "string") add(issues, `${path}.value`, "equation.expression-value", "Expression value must be a string.");
  if (value.accessibleText !== undefined && !text(value.accessibleText)) add(issues, `${path}.accessibleText`, "equation.accessible-text", "accessibleText must contain text.");
}

export function validateEquationWorkbenchDefinition(input: unknown, options: EquationWorkbenchValidationOptions = {}): ValidationResult<EquationWorkbenchDefinition> {
  const issues: ValidationIssue[] = []; const complete = (options.mode ?? "complete") === "complete";
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "equation.object", message: "Equation workbench must be an object.", severity: "error" }] };
  if (input.schemaVersion !== undefined ? input.schemaVersion !== EQUATION_WORKBENCH_SCHEMA_VERSION : complete) add(issues, "schemaVersion", "equation.version", `schemaVersion must be ${EQUATION_WORKBENCH_SCHEMA_VERSION}.`);
  if (input.id !== undefined ? !identifier(input.id) : complete) add(issues, "id", "equation.id", "id must be a stable lowercase identifier.");
  if (complete && !text(input.title)) add(issues, "title", "equation.title", "title is required."); else if (input.title !== undefined && !text(input.title)) add(issues, "title", "equation.title", "title must contain text.");
  if (complete && !text(input.prompt)) add(issues, "prompt", "equation.prompt", "prompt is required."); else if (input.prompt !== undefined && !text(input.prompt)) add(issues, "prompt", "equation.prompt", "prompt must contain text.");
  validateExpression(input.initialExpression, "initialExpression", issues, complete);
  if (input.goal !== undefined && !text(input.goal)) add(issues, "goal", "equation.goal", "goal must contain text.");
  if (input.variables !== undefined) {
    if (!Array.isArray(input.variables)) add(issues, "variables", "equation.variables", "variables must be a list.");
    else { const seen = new Set<string>(); input.variables.forEach((entry, index) => { if (typeof entry !== "string" || !VARIABLE.test(entry)) add(issues, `variables[${index}]`, "equation.variable", "Variable names must be valid identifiers."); else if (seen.has(entry)) add(issues, `variables[${index}]`, "equation.variable-duplicate", "Variable names must be unique."); else seen.add(entry); }); }
  }
  if (input.stepPolicy !== undefined) {
    if (!record(input.stepPolicy)) add(issues, "stepPolicy", "equation.step-policy", "stepPolicy must be an object.");
    else {
      const min = input.stepPolicy.minimumSteps; const max = input.stepPolicy.maximumSteps;
      if (min !== undefined && (!Number.isInteger(min) || Number(min) < 0)) add(issues, "stepPolicy.minimumSteps", "equation.minimum-steps", "minimumSteps must be a non-negative integer.");
      if (max !== undefined && (!Number.isInteger(max) || Number(max) < 1)) add(issues, "stepPolicy.maximumSteps", "equation.maximum-steps", "maximumSteps must be a positive integer.");
      if (Number.isInteger(min) && Number.isInteger(max) && Number(min) > Number(max)) add(issues, "stepPolicy", "equation.step-range", "minimumSteps cannot exceed maximumSteps.");
      if (input.stepPolicy.requireJustification !== undefined && typeof input.stepPolicy.requireJustification !== "boolean") add(issues, "stepPolicy.requireJustification", "equation.justification-policy", "requireJustification must be boolean.");
    }
  }
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as EquationWorkbenchDefinition, issues };
}

function validateStep(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!record(value)) { add(issues, path, "equation.step", "Step must be an object."); return; }
  if (!identifier(value.id)) add(issues, `${path}.id`, "equation.step-id", "Step id must be stable.");
  validateExpression(value.expression, `${path}.expression`, issues, true);
  if (value.justification !== undefined && (typeof value.justification !== "string" || value.justification.trim().length === 0)) add(issues, `${path}.justification`, "equation.justification", "Justification must contain text.");
}

export function validateEquationWorkbenchState(input: unknown, definition?: EquationWorkbenchDefinition): ValidationResult<EquationWorkbenchState> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "equation.state", message: "State must be an object.", severity: "error" }] };
  if (input.status !== "draft" && input.status !== "submitted") add(issues, "status", "equation.state-status", "status must be draft or submitted.");
  if (!Array.isArray(input.steps)) add(issues, "steps", "equation.steps", "steps must be a list.");
  else {
    const ids = new Set<string>(); input.steps.forEach((step, index) => { validateStep(step, `steps[${index}]`, issues); if (record(step) && identifier(step.id)) { if (ids.has(step.id)) add(issues, `steps[${index}].id`, "equation.step-duplicate", "Step ids must be unique."); ids.add(step.id); } });
    const policy = definition?.stepPolicy;
    if (input.status === "submitted" && policy?.minimumSteps !== undefined && input.steps.length < policy.minimumSteps) add(issues, "steps", "equation.steps-minimum", "Submitted state does not meet minimumSteps.");
    if (policy?.maximumSteps !== undefined && input.steps.length > policy.maximumSteps) add(issues, "steps", "equation.steps-maximum", "State exceeds maximumSteps.");
    if (policy?.requireJustification && input.status === "submitted") input.steps.forEach((step, index) => { if (!record(step) || typeof step.justification !== "string" || !step.justification.trim()) add(issues, `steps[${index}].justification`, "equation.justification-required", "Every submitted step requires justification."); });
  }
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as EquationWorkbenchState, issues };
}

export function validateEquationWorkbenchResult(input: unknown, definition?: EquationWorkbenchDefinition): ValidationResult<EquationWorkbenchResult> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "equation.result", message: "Result must be an object.", severity: "error" }] };
  if (!["ungraded", "correct", "incorrect", "partial"].includes(String(input.status))) add(issues, "status", "equation.result-status", "Unknown result status.");
  const state = validateEquationWorkbenchState(input.state, definition); state.issues.forEach((entry) => issues.push({ ...entry, path: `state.${entry.path}` }));
  if (input.score !== undefined && !finite(input.score)) add(issues, "score", "equation.score", "score must be finite.");
  if (input.maxScore !== undefined && (!finite(input.maxScore) || input.maxScore <= 0)) add(issues, "maxScore", "equation.max-score", "maxScore must be positive.");
  if (finite(input.score) && finite(input.maxScore) && (input.score < 0 || input.score > input.maxScore)) add(issues, "score", "equation.score-range", "score must be between zero and maxScore.");
  if (input.feedback !== undefined && (!Array.isArray(input.feedback) || !input.feedback.every(text))) add(issues, "feedback", "equation.feedback", "feedback must be a list of localized text values.");
  if (input.events !== undefined) {
    if (!Array.isArray(input.events)) add(issues, "events", "equation.events", "events must be a list.");
    else input.events.forEach((event, index) => { const path = `events[${index}]`; if (!record(event)) { add(issues, path, "equation.event", "Event must be an object."); return; } if (event.type === "step-added" || event.type === "step-updated") validateStep(event.step, `${path}.step`, issues); else if (event.type === "step-removed") { if (!identifier(event.stepId)) add(issues, `${path}.stepId`, "equation.event-step", "stepId must be stable."); } else if (event.type !== "submitted") add(issues, `${path}.type`, "equation.event-type", "Unknown event type."); });
  }
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as EquationWorkbenchResult, issues };
}
