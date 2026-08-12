# `@didact/catalog`

Declarative inventory of Didact educational component families. It describes what a component is,
what an author configures, what learner response/result/feedback it supports, its evidence boundary,
its accessibility obligations, and how (or whether) it maps to QTI and xAPI vocabulary.

The catalog is metadata, not a renderer and not a QTI/xAPI implementation.

Structured facets and curated collections are part of the catalog contract. Their design,
including the distinction between free-form tags, collections and downloadable kits, lives in
[`docs/distribution-collections.md`](../../docs/distribution-collections.md). Existing `tags` remain
supported but are not treated as a stable subject taxonomy.

Every available manifest has typed facets for subject, representation, learner action, learning
purpose and distinctive context. `availableCollections` exposes six validated editorial views:
Learning Essentials, Mathematics & Data, Language Learning, Visual & Spatial, Corporate Training
and Technical Training. Collections reference stable manifest identities; they never duplicate implementations.

## Two deliberate exports

- `catalog` / `availableManifests`: production-ready families implemented by `@didact/core`.
- `designCatalog` / `plannedManifests`: the complete design inventory, including draft roadmap work
  whenever a future wave has a reviewed manifest.
- `availableTypes`: the 34 differentiated public educational types counted by the roadmap, with
  their owning manifest and `@didact/core` export.

Planned manifests can be exported individually for design tooling, but they never enter `catalog`. This
prevents a roadmap entry from being presented to consumers as an available component.

```ts
import {
  availableCollections,
  catalog,
  getAvailableCollection,
  getAvailableManifest,
} from "@didact/catalog";

const quiz = getAvailableManifest("didact.quiz");
const mathematics = getAvailableCollection("mathematics-data");
```

The production catalog currently has 28 manifests for 34 types. Related implementations share one
manifest when they have the same pedagogical purpose and contract: the five quiz types share the
Quiz manifest, while Matching, Sort and Categorize share Matching exercises. Supporting exports
such as `Term`, `Reveal` and `ProgressOverview` do not inflate the educational-type count.

## Manifest identity and versioning

- `id` is permanent and implementation-independent (`didact.quiz`, not a React export name).
- `version` versions the manifest contract for that family, independently of package releases.
- available manifests start at `1.x`; planned draft manifests remain at `0.x`.
- variants belong to one family when they share purpose and response semantics.

## Evidence and standards

Evidence entries describe only what the reviewed source supports. `not-evaluated` means the current
research set makes no claim; it does not mean the component has no value. Composite components do
not inherit an effect merely by containing a high-evidence technique.

QTI and xAPI mappings use `direct`, `approximate`, or `none`. A `none` mapping is intentional and
must include a note; Didact does not invent standard interaction types for containers or content.

## Schema contract

Every entry directly satisfies the framework-neutral `ComponentManifest` exported by
`@didact/schema`. The catalog deliberately owns data only; authoring, evidence, accessibility,
versioning and interoperability shapes have a single canonical definition.

## Development

```sh
pnpm --filter @didact/catalog lint
pnpm --filter @didact/catalog test
pnpm --filter @didact/catalog build
```
