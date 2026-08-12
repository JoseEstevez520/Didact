# `@didact/events`

Framework-neutral contracts for the meaningful learning events emitted by Didact components. The
package is pure TypeScript, has no runtime dependencies, and does not depend on React or a storage
provider.

The versioned envelope supports six events: `started`, `attempted`, `answered`, `feedbackViewed`,
`completed`, and `mastered`. Payloads are deliberately JSON-safe so the consumer can send them to
its own analytics, LMS, event bus, or local persistence layer.

```ts
import { createDidactEvent } from "@didact/events";

const event = createDidactEvent({
  type: "answered",
  componentId: "question-7",
  actorId: "learner-42",
  occurredAt: new Date().toISOString(),
  payload: {
    response: ["option-b"],
    correct: true,
    score: { raw: 1, min: 0, max: 1 },
  },
});
```

`createDidactEvent` validates, clones, and freezes the event. `validateDidactEvent` validates unknown
input without throwing; `isDidactEvent` and `isDidactEventType` narrow types. The optional
`createDidactEventEmitter` is a tiny synchronous subscriber utility, not an analytics system.

## Consumer responsibilities

The application decides identity, timestamps, consent, privacy, persistence, retries, ordering,
offline delivery, retention, and aggregation. This package neither generates identifiers nor writes
any data. A later `@didact/xapi` adapter may convert this neutral vocabulary into xAPI statements;
xAPI concepts intentionally do not leak into the core event contract.

Schema version `1.0` is explicit on every event. Consumers should persist it and reject or migrate
unsupported versions instead of assuming future envelopes have the same shape.
