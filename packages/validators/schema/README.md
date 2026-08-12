# Schema validation

The original `component.schema.json` was a Phase 3 skeleton. It has been replaced by the
executable, framework-neutral contracts in [`@didact/schema`](../../schema/README.md).

`@didact/schema` is now the single source of truth for:

- the component taxonomy and catalog lifecycle;
- recursive authoring fields, localization and conditional visibility;
- `ComponentManifest` metadata;
- learner `Response`, `Result` and informative `Feedback`;
- structured runtime validation issues;
- schema and component versioning/migration metadata.

The catalog instances live in [`@didact/catalog`](../../catalog/README.md). Accessibility and
pedagogical source data remain in this validators package and are referenced by those manifests.

Do not add a second hand-maintained JSON Schema here. If JSON Schema export is needed for an
authoring tool, it should be generated from `@didact/schema` and checked for drift.
