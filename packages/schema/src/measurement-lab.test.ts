import { describe, expect, it } from "vitest";
import { MEASUREMENT_LAB_SCHEMA_VERSION, validateMeasurementLabDefinition, validateMeasurementLabResult, validateMeasurementLabState, type MeasurementLabDefinition } from "./measurement-lab";

const definition: MeasurementLabDefinition = { schemaVersion: MEASUREMENT_LAB_SCHEMA_VERSION, id: "science.temperature", title: "Read the dial", prompt: "Record the temperature", instrument: { kind: "dial", label: "Thermometer" }, scale: { min: -20, max: 120, majorStep: 20, minorDivisions: 10 }, units: [{ id: "celsius", symbol: "°C", label: "degrees Celsius" }, { id: "fahrenheit", symbol: "°F", label: "degrees Fahrenheit", factorToBase: 5 / 9, offsetToBase: -17.7777777778 }], baseUnitId: "celsius", initialReading: 20, target: { value: 37, unitId: "celsius", tolerance: { kind: "absolute", value: 0.5 } } };
const state = { status: "submitted" as const, reading: 37.2, unitId: "celsius" };

describe("measurement lab schema", () => {
  it("accepts a generic dial definition", () => expect(validateMeasurementLabDefinition(definition).success).toBe(true));
  it("accepts partial streaming definitions", () => expect(validateMeasurementLabDefinition({ id: "draft" }, { mode: "streaming" }).success).toBe(true));
  it("rejects invalid scales and unit references", () => expect(validateMeasurementLabDefinition({ ...definition, scale: { ...definition.scale, min: 10, max: 0 }, baseUnitId: "missing" }).success).toBe(false));
  it("validates readings against scale and units", () => { expect(validateMeasurementLabState(state, definition).success).toBe(true); expect(validateMeasurementLabState({ ...state, reading: 500, unitId: "missing" }, definition).success).toBe(false); });
  it("accepts host-generated error, evaluation data and events", () => expect(validateMeasurementLabResult({ status: "correct", state, score: 1, maxScore: 1, error: { signed: 0.2, absolute: 0.2, unitId: "celsius" }, events: [{ type: "reading-changed", reading: 37.2 }, { type: "submitted" }] }, definition).success).toBe(true));
  it("survives JSON round trips", () => expect(validateMeasurementLabDefinition(JSON.parse(JSON.stringify(definition))).success).toBe(true));
});
