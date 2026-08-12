import type { LocalizedText, ValidationIssue, ValidationResult } from "./types";

export const MEASUREMENT_LAB_SCHEMA_VERSION = "1.0.0" as const;
export type MeasurementInstrumentKind = "linear" | "dial";

export interface MeasurementUnit {
  readonly id: string;
  readonly symbol: string;
  readonly label: LocalizedText;
  readonly factorToBase?: number;
  readonly offsetToBase?: number;
}

export interface MeasurementScale {
  readonly min: number;
  readonly max: number;
  readonly majorStep: number;
  readonly minorDivisions: number;
}

export interface MeasurementTarget {
  readonly value: number;
  readonly unitId: string;
  readonly tolerance: { readonly kind: "absolute" | "relative"; readonly value: number };
}

export interface MeasurementLabDefinition {
  readonly schemaVersion: typeof MEASUREMENT_LAB_SCHEMA_VERSION;
  readonly id: string;
  readonly title: LocalizedText;
  readonly prompt: LocalizedText;
  readonly instrument: { readonly kind: MeasurementInstrumentKind; readonly label?: LocalizedText };
  readonly scale: MeasurementScale;
  readonly units: readonly MeasurementUnit[];
  readonly baseUnitId: string;
  readonly initialReading?: number;
  readonly target?: MeasurementTarget;
}

export interface MeasurementLabState {
  readonly status: "draft" | "submitted";
  readonly reading: number;
  readonly unitId: string;
}

export type MeasurementLabEvent =
  | { readonly type: "reading-changed"; readonly reading: number }
  | { readonly type: "unit-changed"; readonly unitId: string }
  | { readonly type: "submitted" };

/** A renderer or host may compare readings; this result only transports that evaluation. */
export interface MeasurementLabResult {
  readonly status: "ungraded" | "correct" | "incorrect" | "partial";
  readonly state: MeasurementLabState;
  readonly score?: number;
  readonly maxScore?: number;
  readonly error?: { readonly signed: number; readonly absolute: number; readonly unitId: string };
  readonly feedback?: readonly LocalizedText[];
  readonly evaluatedAt?: string;
  readonly events?: readonly MeasurementLabEvent[];
}

export interface MeasurementLabValidationOptions { readonly mode?: "complete" | "streaming" }

const ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const localized = (value: unknown): boolean => typeof value === "string" ? value.trim().length > 0 : record(value) && Object.keys(value).length > 0 && Object.values(value).every((entry) => typeof entry === "string" && entry.trim().length > 0);
const id = (value: unknown): value is string => typeof value === "string" && ID.test(value);
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const add = (issues: ValidationIssue[], path: string, code: string, message: string): void => { issues.push({ path, code, message, severity: "error" }); };

function validateScale(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!record(value)) { add(issues, path, "measurement.scale", "scale is required."); return; }
  if (!finite(value.min)) add(issues, `${path}.min`, "measurement.scale-min", "min must be finite.");
  if (!finite(value.max)) add(issues, `${path}.max`, "measurement.scale-max", "max must be finite.");
  if (finite(value.min) && finite(value.max) && value.min >= value.max) add(issues, path, "measurement.scale-order", "min must be less than max.");
  if (!finite(value.majorStep) || value.majorStep <= 0) add(issues, `${path}.majorStep`, "measurement.major-step", "majorStep must be positive.");
  if (!Number.isInteger(value.minorDivisions) || Number(value.minorDivisions) < 1) add(issues, `${path}.minorDivisions`, "measurement.minor-divisions", "minorDivisions must be a positive integer.");
}

export function validateMeasurementLabDefinition(input: unknown, options: MeasurementLabValidationOptions = {}): ValidationResult<MeasurementLabDefinition> {
  const issues: ValidationIssue[] = []; const complete = (options.mode ?? "complete") === "complete";
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "measurement.object", message: "Measurement lab must be an object.", severity: "error" }] };
  if (input.schemaVersion !== undefined ? input.schemaVersion !== MEASUREMENT_LAB_SCHEMA_VERSION : complete) add(issues, "schemaVersion", "measurement.version", `schemaVersion must be ${MEASUREMENT_LAB_SCHEMA_VERSION}.`);
  if (input.id !== undefined ? !id(input.id) : complete) add(issues, "id", "measurement.id", "id must be a stable lowercase identifier.");
  for (const key of ["title", "prompt"] as const) if (input[key] !== undefined ? !localized(input[key]) : complete) add(issues, key, `measurement.${key}`, `${key} is required and must contain text.`);
  if (!record(input.instrument)) { if (complete) add(issues, "instrument", "measurement.instrument", "instrument is required."); }
  else { if (input.instrument.kind !== "linear" && input.instrument.kind !== "dial") add(issues, "instrument.kind", "measurement.instrument-kind", "instrument.kind must be linear or dial."); if (input.instrument.label !== undefined && !localized(input.instrument.label)) add(issues, "instrument.label", "measurement.instrument-label", "Instrument label must contain text."); }
  if (input.scale !== undefined || complete) validateScale(input.scale, "scale", issues);
  const unitIds = new Set<string>();
  if (!Array.isArray(input.units)) { if (complete) add(issues, "units", "measurement.units", "units must be a list."); }
  else { if (complete && input.units.length === 0) add(issues, "units", "measurement.units-empty", "At least one unit is required."); input.units.forEach((unit, index) => { const path = `units[${index}]`; if (!record(unit)) { add(issues, path, "measurement.unit", "Unit must be an object."); return; } if (!id(unit.id)) add(issues, `${path}.id`, "measurement.unit-id", "Unit id must be stable."); else if (unitIds.has(unit.id)) add(issues, `${path}.id`, "measurement.unit-duplicate", "Unit ids must be unique."); else unitIds.add(unit.id); if (typeof unit.symbol !== "string" || !unit.symbol.trim()) add(issues, `${path}.symbol`, "measurement.unit-symbol", "Unit symbol is required."); if (!localized(unit.label)) add(issues, `${path}.label`, "measurement.unit-label", "Unit label is required."); if (unit.factorToBase !== undefined && (!finite(unit.factorToBase) || unit.factorToBase <= 0)) add(issues, `${path}.factorToBase`, "measurement.unit-factor", "factorToBase must be positive."); if (unit.offsetToBase !== undefined && !finite(unit.offsetToBase)) add(issues, `${path}.offsetToBase`, "measurement.unit-offset", "offsetToBase must be finite."); }); }
  if (input.baseUnitId !== undefined ? !unitIds.has(String(input.baseUnitId)) : complete) add(issues, "baseUnitId", "measurement.base-unit-reference", "baseUnitId must reference a unit.");
  if (input.initialReading !== undefined && !finite(input.initialReading)) add(issues, "initialReading", "measurement.initial-reading", "initialReading must be finite.");
  if (finite(input.initialReading) && record(input.scale) && finite(input.scale.min) && finite(input.scale.max) && (input.initialReading < input.scale.min || input.initialReading > input.scale.max)) add(issues, "initialReading", "measurement.initial-range", "initialReading must be within the scale.");
  if (input.target !== undefined) {
    if (!record(input.target)) add(issues, "target", "measurement.target", "target must be an object.");
    else { if (!finite(input.target.value)) add(issues, "target.value", "measurement.target-value", "Target value must be finite."); if (!unitIds.has(String(input.target.unitId))) add(issues, "target.unitId", "measurement.target-unit", "Target unitId must reference a unit."); if (!record(input.target.tolerance)) add(issues, "target.tolerance", "measurement.tolerance", "Target tolerance is required."); else { if (input.target.tolerance.kind !== "absolute" && input.target.tolerance.kind !== "relative") add(issues, "target.tolerance.kind", "measurement.tolerance-kind", "Tolerance kind must be absolute or relative."); if (!finite(input.target.tolerance.value) || input.target.tolerance.value < 0) add(issues, "target.tolerance.value", "measurement.tolerance-value", "Tolerance value must be finite and non-negative."); if (input.target.tolerance.kind === "relative" && finite(input.target.tolerance.value) && input.target.tolerance.value > 1) add(issues, "target.tolerance.value", "measurement.relative-tolerance", "Relative tolerance must be between zero and one."); } }
  }
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as MeasurementLabDefinition, issues };
}

export function validateMeasurementLabState(input: unknown, definition: MeasurementLabDefinition): ValidationResult<MeasurementLabState> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "measurement.state", message: "State must be an object.", severity: "error" }] };
  if (input.status !== "draft" && input.status !== "submitted") add(issues, "status", "measurement.state-status", "status must be draft or submitted.");
  if (!finite(input.reading)) add(issues, "reading", "measurement.reading", "reading must be finite.");
  else if (input.reading < definition.scale.min || input.reading > definition.scale.max) add(issues, "reading", "measurement.reading-range", "reading must be within the scale.");
  if (!definition.units.some(({ id }) => id === input.unitId)) add(issues, "unitId", "measurement.state-unit", "unitId must reference a unit.");
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as MeasurementLabState, issues };
}

export function validateMeasurementLabResult(input: unknown, definition: MeasurementLabDefinition): ValidationResult<MeasurementLabResult> {
  const issues: ValidationIssue[] = [];
  if (!record(input)) return { success: false, issues: [{ path: "$", code: "measurement.result", message: "Result must be an object.", severity: "error" }] };
  if (!["ungraded", "correct", "incorrect", "partial"].includes(String(input.status))) add(issues, "status", "measurement.result-status", "Unknown result status.");
  const state = validateMeasurementLabState(input.state, definition); state.issues.forEach((entry) => issues.push({ ...entry, path: `state.${entry.path}` }));
  if (input.score !== undefined && !finite(input.score)) add(issues, "score", "measurement.score", "score must be finite.");
  if (input.maxScore !== undefined && (!finite(input.maxScore) || input.maxScore <= 0)) add(issues, "maxScore", "measurement.max-score", "maxScore must be positive.");
  if (finite(input.score) && finite(input.maxScore) && (input.score < 0 || input.score > input.maxScore)) add(issues, "score", "measurement.score-range", "score must be between zero and maxScore.");
  if (input.error !== undefined) { if (!record(input.error)) add(issues, "error", "measurement.error", "error must be an object."); else { const error = input.error; if (!finite(error.signed) || !finite(error.absolute) || Number(error.absolute) < 0) add(issues, "error", "measurement.error-values", "Error values must be finite and absolute must be non-negative."); if (!definition.units.some(({ id }) => id === error.unitId)) add(issues, "error.unitId", "measurement.error-unit", "Error unitId must reference a unit."); } }
  if (input.feedback !== undefined && (!Array.isArray(input.feedback) || !input.feedback.every(localized))) add(issues, "feedback", "measurement.feedback", "feedback must be a list of localized text values.");
  if (input.events !== undefined) {
    if (!Array.isArray(input.events)) add(issues, "events", "measurement.events", "events must be a list.");
    else input.events.forEach((event, index) => { const path = `events[${index}]`; if (!record(event)) { add(issues, path, "measurement.event", "Event must be an object."); return; } if (event.type === "reading-changed") { if (!finite(event.reading)) add(issues, `${path}.reading`, "measurement.event-reading", "reading must be finite."); } else if (event.type === "unit-changed") { if (!definition.units.some(({ id }) => id === event.unitId)) add(issues, `${path}.unitId`, "measurement.event-unit", "unitId must reference a unit."); } else if (event.type !== "submitted") add(issues, `${path}.type`, "measurement.event-type", "Unknown event type."); });
  }
  return issues.length ? { success: false, issues } : { success: true, data: input as unknown as MeasurementLabResult, issues };
}
