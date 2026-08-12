import { describe, expect, it, vi } from "vitest";
import {
  createDidactEvent,
  createDidactEventEmitter,
  isDidactEvent,
  isDidactEventType,
  validateDidactEvent,
  type DidactEventInput,
  type DidactEventType,
} from "./index";

const inputs: Record<DidactEventType, DidactEventInput> = {
  started: { type: "started", payload: { attemptNumber: 1 } },
  attempted: { type: "attempted", payload: { action: "reorder", response: [2, 1], attemptNumber: 1 } },
  answered: { type: "answered", payload: { response: "b", correct: true, score: { raw: 1, max: 1 } } },
  feedbackViewed: { type: "feedbackViewed", payload: { feedbackId: "feedback-1", feedbackKind: "explanatory" } },
  completed: { type: "completed", payload: { success: true, score: { raw: 8, min: 0, max: 10 } } },
  mastered: { type: "mastered", payload: { level: 0.9, evidence: { reviews: 4 } } },
};

describe("Didact events", () => {
  it.each(Object.keys(inputs) as DidactEventType[])("creates and validates %s", (type) => {
    const event = createDidactEvent(inputs[type]);
    expect(event.schemaVersion).toBe("1.0");
    expect(event.type).toBe(type);
    expect(isDidactEvent(event)).toBe(true);
    expect(isDidactEventType(event, type)).toBe(true);
  });

  it("survives a JSON round trip", () => {
    const event = createDidactEvent({
      type: "answered",
      eventId: "event-1",
      occurredAt: "2026-08-11T12:00:00.000Z",
      context: { courseId: "course-1", metadata: { cohort: "summer" } },
      payload: { response: { selected: ["a", "c"] }, correct: false },
    });
    const restored: unknown = JSON.parse(JSON.stringify(event));
    expect(validateDidactEvent(restored)).toEqual({ valid: true, event: restored });
  });

  it("clones and deeply freezes created events", () => {
    const response = { nested: ["a"] };
    const event = createDidactEvent({ type: "answered", payload: { response } });
    response.nested.push("mutated");
    expect(event.payload.response).toEqual({ nested: ["a"] });
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(Object.isFrozen((event.payload.response as { nested: string[] }).nested)).toBe(true);
  });

  it("returns actionable issues for invalid unknown input", () => {
    const result = validateDidactEvent({ schemaVersion: "2", type: "answered", payload: { correct: "yes" } });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues.map((item) => item.path)).toEqual(expect.arrayContaining(["$.schemaVersion", "$.payload.response", "$.payload.correct"]));
  });

  it("validates the typed context at runtime", () => {
    const result = validateDidactEvent({
      schemaVersion: "1.0",
      type: "started",
      context: { courseId: 42, metadata: [] },
      payload: {},
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.map((item) => item.path)).toEqual(
        expect.arrayContaining(["$.context.courseId", "$.context.metadata"]),
      );
    }
  });

  it("rejects values that JSON cannot represent faithfully", () => {
    expect(() => createDidactEvent({ type: "answered", payload: { response: Number.NaN } })).toThrow(TypeError);
    expect(isDidactEvent({ schemaVersion: "1.0", type: "started", payload: { nope: undefined } })).toBe(false);
    expect(isDidactEvent({ schemaVersion: "1.0", type: "started", payload: { when: new Date() } })).toBe(false);
  });

  it("delivers synchronously and supports unsubscribe", () => {
    const emitter = createDidactEventEmitter();
    const subscriber = vi.fn();
    const unsubscribe = emitter.subscribe(subscriber);
    const event = createDidactEvent({ type: "started", payload: {} });
    emitter.emit(event);
    unsubscribe();
    emitter.emit(event);
    expect(subscriber).toHaveBeenCalledOnce();
    expect(subscriber).toHaveBeenCalledWith(event);
  });
});
