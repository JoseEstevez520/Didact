# Domain tools foundation

**Status:** first wave implemented  
**Scope:** reusable learning tools that model a domain action without coupling Didact to one subject or consumer

## Why this layer exists

General quiz and authoring patterns cannot represent many authentic learning tasks. Domain tools sit between universal interactions and course-specific recipes: they preserve a stable, serializable learner artifact while the host supplies specialist rendering, execution or evaluation.

A tool enters the public catalog only when it introduces a genuinely new learner action and supports at least two contrasting uses. A chemistry example and an algebra example may share symbolic transformation; a thermometer and a pressure gauge may share measurement. Those examples are recipes, not separate components.

## First three contracts

### EquationWorkbench

Owns ordered symbolic steps and learner justifications. It never parses expressions, executes mathematics or infers equivalence from text. Renderers and evaluators are host-owned ports. Algebra and chemical balancing demonstrate that the durable artifact is the transformation chain rather than a notation engine.

### EvidenceAnnotation

Owns stable text evidence, classifications, notes and claim relationships. Source offsets and identifiers make the response portable; DOM selection is not the data model. A keyboard-operable segment list performs the same actions as the reading surface. Historical source analysis and incident investigation demonstrate distinct domains.

### MeasurementLab

Owns a scale, units, precision and a selected reading for generic linear or dial instruments. Concrete rulers, thermometers, gauges and multimeters remain recipes unless they require a different response model. Visual instruments always share state with native range and numeric inputs.

## Shared boundaries

- Definitions, state, events and results are JSON-safe in `@didact/schema`.
- Specialist rendering and evaluation remain explicit host ports.
- Without a host evaluator, submission is `ungraded`.
- Expected solutions and feedback are never exposed before submission.
- Domain libraries are opt-in adapters, not mandatory dependencies.
- Every visual or specialist operation has a textual and keyboard-operable path over the same state.

## Admission gate for later tools

A candidate must identify its learner artifact, a new meaningful action, two contrasting recipes, an accessible equivalent and a clear host boundary. If it only changes appearance or subject vocabulary, it is a recipe or tag. Future candidates include geometric construction, scientific models and musical notation, but none is admitted solely to increase the component count.
