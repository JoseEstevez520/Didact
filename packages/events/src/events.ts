import { DIDACT_EVENT_SCHEMA_VERSION, type DidactEvent, type DidactEventInput, type DidactEventType } from "./types";
import { validateDidactEvent } from "./validation";

function cloneAndFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  const clone = Array.isArray(value)
    ? value.map((item) => cloneAndFreeze(item))
    : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneAndFreeze(item)]));
  return Object.freeze(clone) as T;
}

export function createDidactEvent<TType extends DidactEventType>(input: DidactEventInput<TType>): Extract<DidactEvent, { type: TType }> {
  const candidate = { ...input, schemaVersion: DIDACT_EVENT_SCHEMA_VERSION };
  const result = validateDidactEvent(candidate);
  if (!result.valid) {
    const details = result.issues.map((item) => `${item.path}: ${item.message}`).join("; ");
    throw new TypeError(`Invalid Didact event: ${details}`);
  }
  return cloneAndFreeze(result.event) as Extract<DidactEvent, { type: TType }>;
}

export type DidactEventSubscriber = (event: DidactEvent) => void;

export interface DidactEventEmitter {
  readonly emit: (event: DidactEvent) => void;
  readonly subscribe: (subscriber: DidactEventSubscriber) => () => void;
}

/** Synchronous in-memory delivery only: no persistence, buffering, replay or transport. */
export function createDidactEventEmitter(): DidactEventEmitter {
  const subscribers = new Set<DidactEventSubscriber>();
  return {
    emit(event) {
      for (const subscriber of [...subscribers]) subscriber(event);
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}
