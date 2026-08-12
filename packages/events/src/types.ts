export const DIDACT_EVENT_SCHEMA_VERSION = "1.0" as const;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue };

export interface DidactEventContext {
  readonly courseId?: string;
  readonly lessonId?: string;
  readonly activityId?: string;
  readonly sessionId?: string;
  readonly registrationId?: string;
  readonly metadata?: JsonObject;
}

export interface DidactScore {
  readonly raw: number;
  readonly min?: number;
  readonly max?: number;
}

export interface StartedPayload {
  readonly attemptNumber?: number;
}

export interface AttemptedPayload {
  readonly action?: string;
  readonly response?: JsonValue;
  readonly attemptNumber?: number;
}

export interface AnsweredPayload {
  readonly response: JsonValue;
  readonly correct?: boolean;
  readonly score?: DidactScore;
}

export type FeedbackKind = "corrective" | "explanatory" | "hint" | "solution" | "other";

export interface FeedbackViewedPayload {
  readonly feedbackId?: string;
  readonly feedbackKind?: FeedbackKind;
}

export interface CompletedPayload {
  readonly success?: boolean;
  readonly score?: DidactScore;
}

export interface MasteredPayload {
  readonly level?: number;
  readonly evidence?: JsonValue;
}

export interface DidactEventPayloadMap {
  readonly started: StartedPayload;
  readonly attempted: AttemptedPayload;
  readonly answered: AnsweredPayload;
  readonly feedbackViewed: FeedbackViewedPayload;
  readonly completed: CompletedPayload;
  readonly mastered: MasteredPayload;
}

export type DidactEventType = keyof DidactEventPayloadMap;

export interface DidactEventEnvelope<
  TType extends DidactEventType = DidactEventType,
  TPayload extends DidactEventPayloadMap[TType] = DidactEventPayloadMap[TType],
> {
  readonly schemaVersion: typeof DIDACT_EVENT_SCHEMA_VERSION;
  readonly type: TType;
  readonly payload: Readonly<TPayload>;
  readonly eventId?: string;
  readonly occurredAt?: string;
  readonly componentId?: string;
  readonly actorId?: string;
  readonly context?: Readonly<DidactEventContext>;
}

export type DidactEvent = {
  [TType in DidactEventType]: DidactEventEnvelope<TType, DidactEventPayloadMap[TType]>;
}[DidactEventType];

export type DidactEventInput<TType extends DidactEventType = DidactEventType> = Omit<
  DidactEventEnvelope<TType, DidactEventPayloadMap[TType]>,
  "schemaVersion"
>;
