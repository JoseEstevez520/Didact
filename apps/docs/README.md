# apps/docs — Didact's living documentation (plan, Phase 3)

This directory will hold the library's browsable documentation (Storybook or equivalent),
required by **RF-17**: every component must have a story with its states (empty, error, loading,
correct/incorrect) and pass automated a11y checks.

## Role within the monorepo

`design.md` §8 (Quality and tooling) assigns it two functions that don't compete with each other:

1. **Browsable catalog** for anyone who wants to see what Didact offers before copying it.
2. **A11y validation surface in CI**: each story runs an automated accessibility addon, instead of
   just documenting "it's accessible" in generic terms — consistent with the risk `design.md` §9
   flags ("well-intentioned accessibility without evidence") and with `packages/validators/`'s
   approach of tracing each criterion to a concrete source.

## Plan (not implemented yet)

- **Tool:** Storybook (or an equivalent supporting a mature a11y addon), on top of
  `packages/core`'s neutral default theme — never SkillNet's theme or any specific consumer's.
- **One story per component and per relevant state**: empty, error, loading,
  correct/incorrect — not just the happy path.
- **Each story documents, per component, which specific WCAG criterion it meets** (referencing
  `packages/validators/a11y/wcag-criteria.json`), not a generic accessibility claim.
- **Relationship to the registry:** stories must stay consistent with what
  `packages/registry/registry.json` describes — the registry is the source of truth for what's
  distributed, the docs site is how to explore it before copying it.

## Status

Not implemented. Depends on the root's build/tsconfig scaffold (already present) and on
`packages/core` having at least one real component to document — that's why this plan is Phase 3
of `ROADMAP.md` but its real content arrives with Phase 4's first wave of components.
