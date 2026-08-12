# `@didact/schema`

Framework-agnostic contracts for Didact's component catalog. The package contains no React code
and has no runtime dependencies. It defines component manifests, recursive authoring schemas,
learner responses, evaluation results, feedback, version metadata and optional interoperability
mappings.

```ts
import { validateComponentManifest, type ComponentManifest } from "@didact/schema";

const result = validateComponentManifest(manifest);
if (!result.success) {
  console.error(result.issues);
}
```

Validators never throw for untrusted input. They return issues with a stable `path`, `code`,
`message` and `severity`, so an authoring tool can render several errors in one pass. QTI and xAPI
entries are descriptive mappings; importing or exporting either format belongs in adapters.

## Partial authoring

`validateAuthoringData` traverses objects and lists and evaluates field types, conditions and
limits. Use `mode: "streaming"` for autosave and `mode: "complete"` before publication. A
`progressive` field produces a warning while streaming and becomes an error on completion;
`required` fields remain errors in both modes. Existing `required: true` and bare conditional
requiredness remain supported.

```ts
const draft = validateAuthoringData(schema, data, { mode: "streaming" });
const publishable = validateAuthoringData(schema, data, { mode: "complete" });
```
