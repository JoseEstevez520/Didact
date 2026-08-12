# apps/docs — Didact's living documentation

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

## Implementation

- **Tool:** Storybook with its a11y addon, on top of
  `packages/core`'s neutral default theme — never SkillNet's theme or any specific consumer's.
- **One story per component and per relevant state**: empty, error, loading,
  correct/incorrect — not just the happy path.
- **Each story documents, per component, which specific WCAG criterion it meets** (referencing
  `packages/validators/a11y/wcag-criteria.json`), not a generic accessibility claim.
- **Relationship to the registry:** stories must stay consistent with what
  `packages/registry/registry.json` describes — the registry is the source of truth for what's
  distributed, the docs site is how to explore it before copying it.
- **Canonical navigation:** `docs/catalog-architecture.md` defines the sidebar hierarchy and the
  one-location-per-component rule. Domain examples are recipes or stories, never duplicate entries.
- **Cross-domain discovery:** `docs/distribution-collections.md` defines structured facets,
  collections and downloadable kits. Subject views are generated from metadata instead of
  duplicating sidebar entries.
- **One public component per Storybook entry:** source modules may share implementation, but each
  public component owns a separate `Meta` and discoverable sidebar node.

## Status

Implemented. Component stories live beside their source in `packages/core` and `packages/ui`.
`src/catalog.stories.tsx` adds a searchable inventory driven directly by the available manifests
and collections from `@didact/catalog`. It combines filters for subject, representation, learner
action, purpose, context, educational family, technical role, keyboard access and QTI mapping.
Each collection shows its curated contents and generated kit name; planned drafts cannot appear as
shipped components accidentally.
