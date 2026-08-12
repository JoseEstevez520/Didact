# Didact

Accessible React components for building real online learning experiences.

Didact provides educational interactions rather than another generic UI kit: practice sets,
feedback and scaffolding, diagrams, media checkpoints, simulations, code exercises, concept maps,
evidence annotation, mathematical workspaces, measurement instruments, and more. Components are
distributed through a shadcn-compatible registry, so applications copy the source and own it.

> **Status: private beta.** The library contains 34 public educational types and 56 registry
> artifacts. The code is tested and installable from a clean consumer, but there is no public,
> immutable release URL yet. See [Release readiness](docs/release-readiness.md).

## Mission

Make high-quality learning interfaces as practical to adopt as general-purpose UI components.

Didact is built around four commitments:

1. **Learning actions, not decorative widgets.** A component must represent a meaningful learner
   action or a stable educational composition.
2. **Accessible by construction.** Keyboard and textual alternatives operate on the same state as
   visual, spatial, and drag interactions.
3. **Portable contracts.** Definitions, responses, results, and events are serializable; products
   keep ownership of persistence, identity, analytics, and grading services.
4. **Copy-paste ownership.** Installation copies reviewed source into the application. Consumers
   can inspect, adapt, and update it deliberately.

## What is included

- **34 differentiated educational types** across assessment, retrieval, generative learning,
  media, data, scenarios, simulation, visual construction, and domain tools.
- **Six curated kits:** Learning Essentials, Mathematics & Data, Language Learning, Visual &
  Spatial, Corporate Training, and Technical Training.
- **Framework-neutral contracts** in `@didact/schema` and learning events in `@didact/events`.
- **56 shadcn-compatible registry artifacts** with local imports and an automatically installed
  semantic theme.
- **Storybook documentation**, controlled/uncontrolled states, streaming support, localization,
  behavior tests, and automated accessibility checks.

[SkillNet](https://github.com/ANFAIA/SkillNet) is Didact's first real consumer and the product where
the library is validated in dynamically generated corporate courses. Didact remains independent:
it contains no SkillNet-specific adapter or data model, and every public contract must remain useful
to other learning products.

## Quick start

### Requirements

- React 19
- Tailwind CSS 4
- A shadcn-compatible `components.json` with the `@/*` alias pointing to `src/*`

### 1. Install one component

This will be the public installation command once Didact has an immutable, unauthenticated release
URL. It is shown now so the adoption contract is explicit; the private repository cannot yet serve
this command to ordinary consumers:

```bash
pnpm dlx shadcn@latest add \
  https://raw.githubusercontent.com/JoseEstevez520/Didact/main/packages/registry/public/r/hint-reveal.json
```

Do not use the mutable `main` URL in production. Contributors can run the complete clean-consumer
gate locally with `pnpm --filter @didact/registry test`; the first public release will replace this
preview with a tagged or hosted URL.

### 2. Render the copied source

```tsx
import { HintReveal } from "@/components/didact/hint-reveal";

export function LessonHelp() {
  return (
    <HintReveal
      heading="Why can the browser reuse this response?"
      hints={["Inspect Cache-Control.", "Look for max-age."]}
      solution="The cached response is still fresh."
    />
  );
}
```

The registry installs its Button, Card, utilities, and `didact-theme` dependencies automatically.

### 3. Install a complete kit

```bash
pnpm dlx shadcn@latest add \
  https://raw.githubusercontent.com/JoseEstevez520/Didact/main/packages/registry/public/r/math-foundations.json
```

Kits contain registry dependencies rather than duplicate component files.

### 4. Verify the application

```bash
pnpm exec tsc --noEmit
pnpm exec vite build
```

The complete setup, theme customization, installation choices, and troubleshooting are documented
in the [10-minute Quick Start](docs/quick-start.md).

## Components with host capabilities

Most components work immediately. Advanced components deliberately require the application to
provide capabilities that should not be hidden inside a UI library:

| Capability | Components | Consumer provides |
|---|---|---|
| Evaluation | EquationWorkbench, DrawingResponse, ConceptMap, MeasurementLab | A sync/async evaluator returning a result and informative feedback |
| Execution | CodeExercise | A sandbox/runtime and optional grader |
| Simulation | SimulationLab | Deterministic state transitions and domain renderer |
| Media | MediaPlayer, InteractiveMedia | Media source/player integration when native playback is not enough |
| Scheduling | RetrievalPracticeSession | Scheduler plus persistence |

Without an evaluator, applicable components submit an explicit `ungraded` result. They never infer
correctness from presentation or leak a solution before submission. See
[Integrating components](docs/component-integration.md).

## Customize the visual language

Every registry component installs semantic light/dark tokens. Override them in the consuming
application instead of editing every component:

```css
:root {
  --primary: oklch(0.55 0.16 250);
  --primary-foreground: oklch(0.98 0 0);
  --radius: 0.5rem;
}
```

Copied files also accept `className` for instance-level composition. The design contract lives in
[design principles](docs/design-principles.md) and [visual language](docs/visual-language.md).

## Explore and develop

```bash
pnpm install
pnpm --filter @didact/docs storybook
pnpm lint
pnpm test
pnpm build
```

Storybook runs at `http://localhost:6006` and resolves workspace packages to source for HMR.

## Quality gates

The current repository passes:

- 223 core component tests
- 73 schema tests
- 56 UI primitive tests
- catalog, events, spaced-repetition, and registry tests
- clean-consumer dependency and import verification
- TypeScript builds and a production Storybook build

The remaining adoption gate is a public immutable registry release and installation in a real
external application. It is tracked in [Release readiness](docs/release-readiness.md).

## Repository map

```text
packages/core/               Educational React components
packages/ui/                 Accessible UI primitives
packages/schema/             Serializable authoring/state/result contracts
packages/events/             Neutral learning event envelopes
packages/catalog/            Manifests, facets, collections, and kits
packages/registry/           Source registry and generated public artifacts
packages/validators/         Accessibility, evidence, mapping, and drift data
apps/docs/                   Storybook catalog
docs/                        Adoption and architecture documentation
specs/education-components/  Product requirements, research, and design source of truth
```

## Documentation

- [Quick Start](docs/quick-start.md)
- [Component integration patterns](docs/component-integration.md)
- [Release readiness](docs/release-readiness.md)
- [Catalog architecture](docs/catalog-architecture.md)
- [Collections and downloads](docs/distribution-collections.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT - see [LICENSE](LICENSE).
