# Didact

Didact is a **general-purpose education components library**: flashcards, matching exercises,
quiz variants, spaced repetition, glossary, progressive hints, progress/mastery indicators,
timelines, and rubrics, designed to be usable in **any React project**, not just the project where
the need was born.

Didact's distribution model is **a registry + a source-code copy mechanism** into the consuming
project ("copy-paste ownership"), not a versioned npm package. The consumer owns the code from the
moment they copy it; there is no dependency upgrade that can break anything without them deciding
to take it. This decision is made and justified in `specs/education-components/requirements.md` §0.

## Why it exists

There is currently no commonly accepted vocabulary of e-learning components, at the level that
already exists for generic UI (Radix, MUI…). Every training platform reinvents flashcards,
matching exercises, quizzes, or spaced repetition. Didact aims to cover that gap with a foundation
of good accessibility and good developer ergonomics: headless behavior, copy-paste distribution,
and variant-based composition as the form, with pedagogical (not generic) components as the
content.

SkillNet (an SME training platform) is the **first real consumer** — where the need was born and
where it's tested first — but it is not the design criterion. Any coupling to SkillNet-specific
decisions is treated as an optional adapter (`adapters/skillnet/`), never as part of the core.

## Style: Tailwind v4

Didact is styled with **Tailwind v4** (CSS-first: `@theme`, OKLCH colors) on top of a neutral
default theme centralized in `@didact/theme` and restyleable via CSS custom properties — a product
decision by Jose (2026-08-11). `specs/education-components/research.md` P3 investigated and
documented that Didact's registry mechanism **does not require** Tailwind technically; that
conclusion still stands, but Jose chose to use it anyway for visual consistency (see
`docs/visual-language.md`) — a deliberate choice, not a technical limitation. Full detail in
`research/decisions.md` (D1) and in `packages/theme/README.md`.

## Scope: broad and ambitious

Didact aims to cover as much educational vocabulary as is reasonable, with good style — from
matching/drag exercises and quiz variants to code exercises and graphical/numeric interactions —
organized in **complexity waves**, not as a minimal "v1" cutdown. The graphical/image-based and
numeric interactions from IMS QTI 3.0 (`research.md` §9.2) and the code exercise (RF-11) are in
scope, not dropped — see `research/decisions.md` (D2).

## Project status

This repository corresponds to **Phase 1 completed** in `ROADMAP.md` (deep research) and the
scaffold for phases 2-3 (documented design decision + monorepo structure). It contains:

- The research that grounds every decision (`specs/education-components/research.md` and the raw
  reports in `research/reports/`).
- The **scientific validators**: machine-readable data derived from that research (WCAG criteria,
  QTI/xAPI mappings, per-requirement pedagogical evidence, declarative component schema,
  dependency drift control) in `packages/validators/`.
- The monorepo's package structure (`packages/core`, `packages/theme`,
  `packages/spaced-repetition`, `packages/registry`) with their API contracts documented.
- Documentation of the boundary with the SkillNet adapter (`adapters/skillnet/`), with no code —
  the adapter code lives in the SkillNet repo, not here.

**What it doesn't contain yet:** real implementation of the education components. That's
**Phase 4** of the roadmap, and it builds on this repo's scaffold, not before.

## Monorepo structure

```
.
├── ROADMAP.md                        Execution plan by phase
├── specs/education-components/       Requirements, design, and research (source of truth)
├── packages/
│   ├── core/                         @didact/core — layer 3, education components (Phase 4)
│   ├── ui/                           @didact/ui — layers 1-2 materialized: the primitive kit
│   │                                  (Button, Card, Toggle/ToggleGroup, Separator, Badge)
│   ├── theme/                        @didact/theme — neutral theme (Tailwind v4 + tokens)
│   ├── spaced-repetition/            @didact/spaced-repetition — SM-2 / FSRS behind an agnostic interface
│   ├── registry/                     @didact/registry — Didact's registry.json
│   └── validators/                   @didact/validators — scientific validators (a11y, pedagogy,
│                                      schema, dependency drift)
├── adapters/
│   └── skillnet/                     Documentation of the boundary with SkillNet (no code)
├── apps/
│   └── docs/                         Living documentation plan (Storybook, Phase 3)
└── research/
    ├── reports/                      Raw research reports (4 parallel batches)
    ├── sources/                      Full bibliography
    └── decisions.md                  Product decisions made after Phase 1
```

## Philosophy & design

- [`docs/PHILOSOPHY.md`](./docs/PHILOSOPHY.md) — the principles the whole project is held to.
- [`docs/design-principles.md`](./docs/design-principles.md) — how customization works (tokens,
  variants, `className`, `asChild`, copy-paste ownership).
- [`docs/visual-language.md`](./docs/visual-language.md) — Didact's default look (palette, shape,
  focus, typography, motion).
- [`docs/interface-norms.md`](./docs/interface-norms.md) — the norms that make components
  consistent by construction: action hierarchy, card composition, spacing/sizing, focus/state
  treatment, and the motion strategy, built on `@didact/ui`'s primitive kit.

## Where to start

- `ROADMAP.md` — what phase the project is in and what's expected next.
- `specs/education-components/requirements.md` — what's being built and why (RF-1..RF-19, RNF-1..5).
- `specs/education-components/design.md` — 3-layer architecture and distribution model.
- `specs/education-components/research.md` — evidence and recommendations behind each decision.
- `CONTRIBUTING.md` — conventions before proposing a change.

## License

MIT — see `LICENSE`.
