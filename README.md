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

Phases 0–6.6 of `ROADMAP.md` are done and **Phase 10** is in progress. Its first foundation,
`InteractiveMedia`, is available experimentally; data and coordinate exploration is next, followed
by decisions, simulations and artifact creation. `AnimationLab` is no longer the default next
component: it is a possible simulation case that must prove reuse beyond animation. See the status
table in `ROADMAP.md` for the authoritative state. In short, the repo now has:

- The research that grounds every decision (`specs/education-components/research.md` and the raw
  reports in `research/reports/`).
- Framework-neutral schema and event contracts in `@didact/schema` and `@didact/events`, plus the
  declarative inventory in `@didact/catalog`.
- Typed subject/action/representation facets, six curated collections and six registry kits for
  grouped discovery and download without duplicating component source.
- The **scientific validators**: machine-readable WCAG, QTI/xAPI, evidence and dependency-drift
  reference data in `packages/validators/`.
- A working **design foundation**: the `@didact/ui` primitive kit and the `@didact/theme` neutral
  tokens, rendering faithfully in Storybook, with the design norms codified in `docs/`.
- A public catalog of 34 differentiated educational types, with behavior/a11y tests and Storybook states.
- An archived note describing why SkillNet remains an ordinary external consumer; Didact does not
  develop or publish a SkillNet adapter.

## Development

```bash
pnpm install
pnpm --filter @didact/docs storybook   # browsable component catalog at http://localhost:6006
pnpm -r build                          # build all packages
pnpm -r test                           # behavior + a11y tests (Vitest + jest-axe)
```

Storybook resolves the `@didact/*` packages to their source, so editing a component is reflected
instantly via HMR while iterating on design.

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
│   ├── schema/                       @didact/schema — authoring, response/result and manifest contracts
│   ├── events/                       @didact/events — framework-neutral learning event envelopes
│   ├── catalog/                      @didact/catalog — available and planned component manifests
│   ├── registry/                     @didact/registry — Didact's registry.json
│   └── validators/                   @didact/validators — evidence, a11y, mappings and drift data
├── adapters/
│   └── skillnet/                     Archived consumer-boundary note (no adapter code)
├── apps/
│   └── docs/                         Living documentation plan (Storybook, Phase 3)
└── research/
    ├── reports/                      Raw research reports (4 parallel batches)
    ├── sources/                      Full bibliography
    └── decisions.md                  Product decisions made after Phase 1
```

## Philosophy & design

The catalog's product architecture, canonical Storybook navigation and anti-duplication rules live
in [`docs/catalog-architecture.md`](docs/catalog-architecture.md). It explains how Didact serves both
basic course building and specialized fields without turning every subject example into a new export.
Discovery across subjects and grouped installation are specified separately in
[`docs/distribution-collections.md`](docs/distribution-collections.md): structured facets, editorial
collections and registry kits that reuse the same canonical components.

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
