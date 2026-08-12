# Component integration patterns

Didact components share a small set of conventions so consumers do not need a different mental
model for every activity.

## The common lifecycle

1. A `definition` describes authored learning content.
2. `state` or `value` contains the learner-owned response.
3. `onStateChange` or `onValueChange` reports edits.
4. Submission produces a serializable result.
5. Feedback appears only after the appropriate learner action.

Most components support both uncontrolled (`defaultState` / `defaultValue`) and controlled
(`state` / `value`) usage. Controlled mode is the right choice when responses must be persisted or
synchronized with a course engine.

## Minimal, controlled, and review examples

Each Storybook component includes representative normal, streaming, empty, and disabled states.
When documenting a component for a product, use this four-part structure:

```tsx
// Minimal
<Component definition={definition} />

// Controlled
<Component state={state} onStateChange={setState} />

// Result and feedback
<Component evaluate={evaluate} onSubmit={saveResult} />

// Review / loading
<Component definition={definition} state={state} disabled />
<Component streaming />
```

## Evaluation ports

Some answers cannot be graded safely or meaningfully by a UI component. Those components accept a
host evaluator:

```tsx
<EquationWorkbench
  definition={definition}
  evaluate={async (state, activity) => {
    const response = await gradeEquation(state, activity);
    return { status: response.status, feedback: response.explanation };
  }}
  onResult={saveResult}
/>
```

Without `evaluate`, submission is `ungraded`. Do not embed answer keys in client definitions for
high-stakes assessment; call a trusted service and return only the result and feedback.

## Runtime and sandbox ports

`CodeExercise` owns editing and presentation, not untrusted execution. Inject an execution adapter
implemented with a worker, Sandpack, WebContainers, or a remote sandbox. Apply time, memory,
network, and output limits in that adapter.

`SimulationLab` follows the same boundary: the component renders controls and state while the host
provides deterministic transitions. A simulation definition must remain data, not executable code.

## Media ports

`MediaPlayer` can be used alone. `InteractiveMedia` composes a player, transcript, progress, and
timed child activities. Use native audio/video for simple sources or provide a player integration
for a streaming vendor. The learning checkpoints remain independent of the media provider.

## Scheduling and persistence

`RetrievalPracticeSession` accepts a scheduler; SM-2 is available as copied headless logic.
Consumers own learner identity, due-item persistence, clocks, retries, and cross-device sync.

## Drag and spatial interactions

Dragging is an enhancement, never the only input method. `WordBank`, `LabelDiagram`, and related
components expose click/keyboard alternatives over the same response state. Do not remove those
paths when restyling copied source.

## Localization

Pass the component's `labels` object to replace interface copy. Keep authored content in the
definition and interface language in `labels`; this avoids mixing course translation with control
translation.

## What the consumer owns

- persistence and autosave;
- authenticated learner identity;
- assessment security and answer-key access;
- analytics consent, retention, and transport;
- LMS-specific QTI/xAPI/SCORM integration;
- media hosting and sandbox infrastructure;
- product-specific theming and course composition.

Didact owns the interaction contract, accessible UI, serializable response/result shapes, and
registry dependency closure.
