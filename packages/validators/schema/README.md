# @didact/validators/schema

An H5P `semantics.json`-style declarative pattern for describing a Didact component, and
`component.schema.json`: a JSON Schema skeleton that instantiates that pattern.

## The H5P `semantics.json` pattern (research.md §9.2)

H5P (https://h5p.org/semantics) solves two problems that are normally solved separately with a
single declarative document: **generating the editor** for a content type (which fields to show,
with what controls) and **validating at runtime** that the props reaching the component have the
right shape. It's a schema that serves as both structured documentation and an executable
contract.

`research.md` §9.2 explicitly recommends adopting this dual pattern for Didact's registry entries
(relevant to RF-15/RF-17): one schema per component that documents and validates props at once,
consistent with **RNF-4** ("components that may be used in streaming contexts... must not assume
all their props arrive complete at once").

*(Data note from `research.md`: H5P's drag-and-drop repo is `h5p-drag-question`, not
`h5p-drag-and-drop` — corrected here to avoid propagating the error.)*

## `component.schema.json`

A JSON Schema skeleton (2020-12 draft) for describing a Didact component:

- `name`, `requirementId` (traces to `requirements.md`, e.g. `RF-1`), `qtiInteraction` and
  `xapiInteractionType` (trace to `validators/pedagogy/`), `wcagCriteria` (traces to
  `validators/a11y/wcag-criteria.json`).
- `props`: an array of `propDescriptor`, each with `name`, `type`, an optional `default`, and
  above all **`requiredness`** with three values, not two:
  - `required` — must always be present.
  - `progressive` — may arrive absent in an incomplete render (RNF-4, streaming) and the
    component must degrade gracefully (e.g. showing a loading state instead of breaking).
  - `optional` — never mandatory, has reasonable default behavior if missing.

This three-level distinction (instead of JSON Schema's usual binary `required: true/false`) is
the direct translation of RNF-4 into the descriptor format: a prop can be "mandatory in the long
run" but "tolerable to miss in the short run" in a streaming context, which is exactly the case
that motivated RNF-4 (SkillNet's v2 generative catalog).

## Status

Skeleton not yet instantiated for any real component — that happens in Phase 4, once
`packages/core` has implementations to describe. No executable validator (e.g. Ajv) integrated
into the test pipeline yet.
