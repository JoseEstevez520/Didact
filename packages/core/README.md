# @didact/core

Layer 3 of Didact's 3-layer architecture (`specs/education-components/design.md` §2): the
**education components** with pedagogical meaning (Flashcard, MatchingExercise, QuizItem,
Glossary, Hint/Reveal, Timeline, Rubric, MasteryBadge…), built on top of a
layer 2 of neutral theming and a layer 1 of accessible primitives.

```
┌─────────────────────────────────────────────┐
│ 3. Education molecules                       │  Flashcard, MatchingExercise, QuizItem,
│    (components with pedagogical meaning)     │  RetrievalPracticeSession, Glossary, Hint,
│                                               │  Timeline, Rubric, MasteryBadge…
├─────────────────────────────────────────────┤
│ 2. Styled layer                               │  Tailwind v4 + cva over @didact/theme's
│    (neutral theme, restyleable)              │  tokens. A single place for theming.
├─────────────────────────────────────────────┤
│ 1. Accessible primitives                     │  Accessible behavior with no styling of its
│    (headless)                                │  own (focus, keyboard, ARIA). Radix UI by default.
└─────────────────────────────────────────────┘
```

## Status

`MediaPlayer` is the neutral audio/video foundation: it can be used alone without a transcript,
checkpoints, title, objective or completion policy. `InteractiveMedia` composes that player with the
educational layer when a course needs timed activities, transcript navigation and completion state.
The foundation does not count as an additional educational type in the catalog.

`DataExplorer` is the experimental data-and-coordinate experience. Mathematical functions and
scientific or business series share its axes, series, selection and point-override state. The graph
and table are synchronized projections of that state. `FunctionExplorer` is deliberately not a
second export while it would only duplicate this contract; hosts inject and secure any expression
evaluator they choose to use.

`BranchingScenario` is the experimental decision-and-procedure experience. Conversations and
procedures share a serializable graph of variables, conditions, effects and history. A separate
`ProcedureTrainer` is intentionally not exported while it would only rename the same contract.

`SimulationLab` is the experimental systems foundation. It owns accessible controls and serializable
state, while consumers inject deterministic transitions and domain renderers. Motion, physics,
finance and inventory remain recipes until one proves that it needs a different public contract.

**Diversification across Phases 8–10 is in progress.** The package exports `Flashcard`, `RetrievalPracticeSession`, the `QuizItem`
family, `Timeline`, `Glossary`/`Term`, `Hint`/`Reveal`, `ProgressIndicator`/`ProgressOverview`,
`Rubric`, the RF-3 `MatchingExercise`/`SortExercise`/`CategorizeExercise` family, and
`MasteryBadge`, plus the first active-learning bundle: `PracticeSet`,
`RetrievalPracticeSession`, `SelfExplanationPrompt`, `WorkedExample`, and `CompletionProblem`.
The next cross-domain bundle adds `NumericQuestion`, `WordBank`, and `Hotspot` for quantitative,
language, and spatial learning activities.
Each component ships with Storybook states, behavior and automated accessibility tests, and a
registry item.

## Decisions already closed (not reopened during implementation)

- **Tailwind v4 IS the core's styling layer** — a product decision by Jose (2026-08-11, see
  `research/decisions.md` D1). `specs/education-components/research.md` P3 concluded, with
  evidence, that Didact's distribution mechanism **does not require** Tailwind technically (the
  `tailwind` field in `registry-item.json` is deprecated in favor of `cssVars.theme`) — that
  conclusion still stands and is not rewritten. What changes is that Jose chooses to use Tailwind
  anyway, for visual consistency with Didact's own visual language (see `docs/visual-language.md`),
  not because the mechanism forced it. In practice: components are styled with **Tailwind + `cva`**
  (`class-variance-authority`) over `@didact/theme`'s tokens (CSS custom properties + Tailwind v4
  `@theme` block) — see that package's README for the detail of the two theming levels.
- **Radix UI as the default layer 1**, documenting the peer-dependency friction with stable
  React 19 (research.md P2) and watching Base UI as a cleaner alternative in the medium term.
- Any external dependency of this layer that isn't copied alongside the component (Radix,
  Tailwind, `cva`) is pinned to an exact version with a drift test (RNF-5) — see
  `@didact/validators/drift`.

## Scope: broad and organized in complexity waves, not a "minimal v1"

Product decision by Jose (2026-08-11, see `research/decisions.md` D2): Didact aims to cover **as
much educational ground as possible**, with good style — from matching/drag exercises to code
exercises and complex components — not a minimal cutdown designed only for the first consumer.
This reverses any earlier "out of v1" framing:

- QTI's **graphical/image-based** interactions (`hotspot`, `hot-text`, `graphic-order`,
  `graphic-associate`, `graphic-gap-match`, `position-object`, `select-point`, `drawing`) and
  **numeric/slider response** (research.md §9.2) are **in scope**, as a higher-complexity wave —
  not dropped. See `packages/validators/pedagogy/qti-mapping.json`
  (`scope: "planned"`, `phase: "advanced-wave"`).
- **RF-11 (code exercise)**, backed by Sandpack for execution (research.md §9.3, checking remains
  our own work), is in scope, prioritized behind the components with the strongest pedagogical
  evidence (RF-2/RF-4, see `packages/validators/pedagogy/evidence.json`) but not dropped.
- The real implementation order still relies on evidence and precedent (research.md §9.1 and
  Question 7), not on "easiest first" — but "more complex" no longer means "out of scope."

## Relationship to the rest of the monorepo

- `@didact/theme` is layer 2: this package consumes it as a dependency for its Tailwind/CSS custom
  property tokens, never redefining colors or radii on its own.
- Each component in this package is described as an entry in `@didact/registry` for Didact's
  registry-based distribution mechanism (RF-15).
- `@didact/validators` provides the data (a11y, pedagogical evidence, schema, drift) against which
  each component is validated before being published in the registry.
- The SkillNet adapter (`adapters/skillnet/`, outside this monorepo) consumes components from this
  layer; no SkillNet decision should leak in here.

See `specs/education-components/design.md` for the full architecture and `research.md` for the
evidence behind each decision.
