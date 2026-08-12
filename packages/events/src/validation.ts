import {
  DIDACT_EVENT_SCHEMA_VERSION,
  type DidactEvent,
  type DidactEventType,
  type FeedbackKind,
} from "./types";

export type EventValidationIssueCode =
  | "invalidType"
  | "missingField"
  | "unsupportedVersion"
  | "notJsonSafe"
  | "invalidValue";

export interface EventValidationIssue {
  readonly code: EventValidationIssueCode;
  readonly path: string;
  readonly message: string;
}

export type EventValidationResult =
  | { readonly valid: true; readonly event: DidactEvent }
  | { readonly valid: false; readonly issues: readonly EventValidationIssue[] };

const eventTypes = new Set<DidactEventType>([
  "started",
  "attempted",
  "answered",
  "feedbackViewed",
  "completed",
  "mastered",
]);
const feedbackKinds = new Set<FeedbackKind>([
  "corrective",
  "explanatory",
  "hint",
  "solution",
  "other",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function issue(
  issues: EventValidationIssue[],
  code: EventValidationIssueCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function validateJson(value: unknown, path: string, issues: EventValidationIssue[], seen: Set<object>): void {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) issue(issues, "notJsonSafe", path, "Numbers must be finite.");
    return;
  }
  if (typeof value !== "object") {
    issue(issues, "notJsonSafe", path, "Value must be JSON-safe.");
    return;
  }
  if (seen.has(value)) {
    issue(issues, "notJsonSafe", path, "Circular references are not JSON-safe.");
    return;
  }
  if (!Array.isArray(value) && !isRecord(value)) {
    issue(issues, "notJsonSafe", path, "Only plain objects and arrays are JSON-safe.");
    return;
  }
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateJson(item, `${path}[${index}]`, issues, seen));
  } else {
    for (const [key, item] of Object.entries(value)) validateJson(item, `${path}.${key}`, issues, seen);
  }
  seen.delete(value);
}

function optionalString(record: Record<string, unknown>, key: string, path: string, issues: EventValidationIssue[]): void {
  if (key in record && (typeof record[key] !== "string" || record[key] === "")) {
    issue(issues, "invalidValue", `${path}.${key}`, "Value must be a non-empty string.");
  }
}

function optionalFiniteNumber(record: Record<string, unknown>, key: string, path: string, issues: EventValidationIssue[]): void {
  if (key in record && (typeof record[key] !== "number" || !Number.isFinite(record[key]))) {
    issue(issues, "invalidValue", `${path}.${key}`, "Value must be a finite number.");
  }
}

function optionalPositiveInteger(record: Record<string, unknown>, key: string, path: string, issues: EventValidationIssue[]): void {
  if (key in record && (typeof record[key] !== "number" || !Number.isInteger(record[key]) || record[key] < 1)) {
    issue(issues, "invalidValue", `${path}.${key}`, "Value must be a positive integer.");
  }
}

function validateScore(value: unknown, path: string, issues: EventValidationIssue[]): void {
  if (!isRecord(value)) {
    issue(issues, "invalidType", path, "Score must be an object.");
    return;
  }
  if (!("raw" in value)) issue(issues, "missingField", `${path}.raw`, "Raw score is required.");
  else optionalFiniteNumber(value, "raw", path, issues);
  optionalFiniteNumber(value, "min", path, issues);
  optionalFiniteNumber(value, "max", path, issues);
  if (typeof value.min === "number" && typeof value.max === "number" && value.min > value.max) {
    issue(issues, "invalidValue", path, "Score min cannot exceed max.");
  }
}

function validatePayload(type: DidactEventType, payload: Record<string, unknown>, issues: EventValidationIssue[]): void {
  optionalPositiveInteger(payload, "attemptNumber", "$.payload", issues);
  if (type === "attempted") optionalString(payload, "action", "$.payload", issues);
  if (type === "answered") {
    if (!("response" in payload)) issue(issues, "missingField", "$.payload.response", "Answer response is required.");
    if ("correct" in payload && typeof payload.correct !== "boolean") {
      issue(issues, "invalidType", "$.payload.correct", "Correct must be a boolean.");
    }
  }
  if (type === "feedbackViewed") {
    optionalString(payload, "feedbackId", "$.payload", issues);
    if ("feedbackKind" in payload && !feedbackKinds.has(payload.feedbackKind as FeedbackKind)) {
      issue(issues, "invalidValue", "$.payload.feedbackKind", "Unknown feedback kind.");
    }
  }
  if (type === "completed" && "success" in payload && typeof payload.success !== "boolean") {
    issue(issues, "invalidType", "$.payload.success", "Success must be a boolean.");
  }
  if ((type === "answered" || type === "completed") && "score" in payload) {
    validateScore(payload.score, "$.payload.score", issues);
  }
  if (type === "mastered") optionalFiniteNumber(payload, "level", "$.payload", issues);
}

export function validateDidactEvent(value: unknown): EventValidationResult {
  const issues: EventValidationIssue[] = [];
  if (!isRecord(value)) {
    return { valid: false, issues: [{ code: "invalidType", path: "$", message: "Event must be a plain object." }] };
  }

  if (value.schemaVersion !== DIDACT_EVENT_SCHEMA_VERSION) {
    issue(issues, "unsupportedVersion", "$.schemaVersion", `Expected schema version ${DIDACT_EVENT_SCHEMA_VERSION}.`);
  }
  if (typeof value.type !== "string" || !eventTypes.has(value.type as DidactEventType)) {
    issue(issues, "invalidValue", "$.type", "Unknown Didact event type.");
  }
  for (const key of ["eventId", "componentId", "actorId"] as const) optionalString(value, key, "$", issues);
  if ("occurredAt" in value && (typeof value.occurredAt !== "string" || Number.isNaN(Date.parse(value.occurredAt)))) {
    issue(issues, "invalidValue", "$.occurredAt", "Timestamp must be a valid ISO-compatible date string.");
  }
  if (!isRecord(value.payload)) {
    issue(issues, "invalidType", "$.payload", "Payload must be a plain object.");
  } else if (typeof value.type === "string" && eventTypes.has(value.type as DidactEventType)) {
    validatePayload(value.type as DidactEventType, value.payload, issues);
  }
  if ("context" in value && !isRecord(value.context)) {
    issue(issues, "invalidType", "$.context", "Context must be a plain object.");
  } else if (isRecord(value.context)) {
    for (const key of ["courseId", "lessonId", "activityId", "sessionId", "registrationId"] as const) {
      optionalString(value.context, key, "$.context", issues);
    }
    if ("metadata" in value.context && !isRecord(value.context.metadata)) {
      issue(issues, "invalidType", "$.context.metadata", "Context metadata must be a plain object.");
    }
  }

  validateJson(value, "$", issues, new Set());
  return issues.length === 0
    ? { valid: true, event: value as unknown as DidactEvent }
    : { valid: false, issues };
}

export function isDidactEvent(value: unknown): value is DidactEvent {
  return validateDidactEvent(value).valid;
}

export function isDidactEventType<TType extends DidactEventType>(
  event: DidactEvent,
  type: TType,
): event is Extract<DidactEvent, { type: TType }> {
  return event.type === type;
}
