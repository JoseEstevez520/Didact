# Contributing to Didact

This repository is today (Phase 1-3 of `ROADMAP.md`) a **documentation scaffold**: it contains the
research that grounds the design, the scientific validators (machine-readable data), and the
monorepo's package structure, but not yet the implementation of the education components (that's
Phase 4).

**Repository language: English.** All documentation, code, comments, specs, research, and commit
messages are in English. This applies to every future contribution — do not add Spanish (or any
other language) content to this repo going forward.

## Before proposing a change

1. Read `ROADMAP.md` to understand what phase the project is in and what's expected of each one.
2. Read `specs/education-components/requirements.md`, `design.md`, and `research.md` — they are
   the source of truth for what's being built and why. A component or design decision that
   contradicts `requirements.md` §0 (general purpose, shadcn model) is not accepted without first
   opening a discussion that updates the spec.
3. Any coupling to SkillNet (tokens from `design-system.md`, the v2 generative catalog, language,
   product assumptions) goes in `adapters/skillnet/`, never in `packages/*`. The guard question is
   always: "does this make sense to someone who has never heard of SkillNet?".

## Monorepo structure

- `packages/core` — layer 3 (education components) and its relationship to layer 2 (theming) and
  layer 1 (accessible primitives).
- `packages/theme` — layer 2 (theming): neutral default theme in CSS custom properties + a
  Tailwind v4 `@theme` block (RF-16).
- `packages/spaced-repetition` — spaced repetition algorithms behind an agnostic interface.
- `packages/registry` — the `registry.json` describing the component catalog distributable via the
  shadcn/ui-style mechanism.
- `packages/validators` — the scientific validators: accessibility data, pedagogical evidence,
  declarative component schema, and dependency drift control.
- `adapters/skillnet` — documentation of the boundary with SkillNet (no code; the adapter code
  lives in the SkillNet repo).
- `apps/docs` — living documentation plan (Storybook), pending Phase 3.
- `research/` — research artifacts (raw reports + bibliography + a log of product decisions made
  after Phase 1, see `research/decisions.md`).

## Conventions

- Every package is `"private": true`, version `0.0.0` until a real publication mechanism exists
  (see `packages/registry/README.md`).
- No external dependency is added without pinning an exact version and documenting the reason
  (RNF-5, see `packages/validators/drift/`).
- **Tailwind v4 is Didact's styling layer** (product decision by Jose, 2026-08-11 — see
  `research/decisions.md` D1), with the neutral theme centralized in `@didact/theme`, restyleable
  via CSS custom properties. `research.md` P3 documented that shadcn/ui's registry mechanism does
  not technically require Tailwind — that's still true, but it's a deliberate style choice, not a
  technical limit: it's adopted anyway for visual consistency.
- Broad and ambitious scope, not a "cut-down v1" (product decision by Jose, 2026-08-11 — see
  `research/decisions.md` D2): QTI's graphical/numeric interactions (`research.md` §9.2) and the
  code exercise (RF-11) are in scope as higher-complexity waves, not dropped.
- No AI-assistant configuration files are included in the repo (`.gitignore` excludes them
  explicitly).
