# @didact/registry

Didact's `registry.json` in **shadcn/ui's official schema** — the distribution mechanism chosen
for RF-15 in `requirements.md` (registry + CLI that copies source code into the consuming
project, not a versioned npm dependency).

Grouped downloads are specified in
[`docs/distribution-collections.md`](../../docs/distribution-collections.md). The build generates six
kits from catalog collections. They reference existing items through `registryDependencies` and do
not duplicate component files: `learning-essentials`, `math-foundations`, `language-learning`,
`visual-spatial`, `corporate-training`, and `technical-training`. Namespaced commands remain
unpublished until Didact has a stable public host and namespace.

## Why shadcn's official schema and not a custom CLI

`specs/education-components/research.md` Question 1 confirms that shadcn/ui's third-party
registry mechanism is real, documented as a first-class product (not a community hack), and works
with any framework, not just React:

- Root schema `registry.json` (`$schema`, `name`, `homepage`, `items`/`include`).
- Item schema `registry-item.json` (`name`, `type`, `files`, `dependencies`,
  `registryDependencies`, `cssVars`, `css`, `envVars`…).
- Hosting as static JSON servable from any HTTP server, or a GitHub repo with `registry.json` at
  the root — this repo.
- Installation via direct URL (`shadcn add https://.../<item>.json`) or via a namespace configured
  in the consumer's `components.json` (decentralized model, no central authority).

**research.md P1 recommendation:** adopt the official CLI and schema as the primary mechanism.
Building a custom CLI stays as a theoretical plan B, not as work to be done — the risk
`design.md` §9 anticipated ("the third-party mechanism doesn't support what we need") was not
confirmed by the research.

## Verified caveats (do not ignore when operating this registry)

- **There is no native `version` field in `registry-item.json`.** There is no schema-level
  versioning for the same component; versioning "same component, different revisions" is the
  responsibility of how this registry organizes its routes (e.g. namespacing by date or tag), not
  something shadcn's CLI solves for us.
- **`shadcn diff` against third-party registries: not verified.** The docs (CLI v4 changelog)
  document it for the official registry; they do not explicitly confirm it works the same way
  with third-party namespaced registries like this one. Before documenting `shadcn diff` as
  Didact consumers' update mechanism, test it empirically.
- **Authentication** is native via HTTP headers + environment variables (Bearer token, API key).
  No OAuth/OIDC or automatic discovery — relevant only if this registry stops being public.
- **`cssVars.theme`'s auto-generated Tailwind alias only triggers for color-shaped values.**
  Verified empirically in the Phase 3 registry copy proof (`shadcn add` against `mastery-badge.json`
  in a throwaway consumer): when the CLI merges `cssVars.theme` into the consumer's `@theme` block,
  it inserts the literal `--<key>: <value>` declaration, and separately auto-generates a
  `--color-<key>: var(--<key>)` alias **only** when `<value>` looks like a color
  (oklch/hsl/rgb/hex). Now that this registry's `cssVars.theme` keys are the real token names
  (`primary`, `background`, `muted-foreground`, `ring`, …, matching `packages/theme/src/tokens.css`
  1:1), that alias lines up exactly with the `--color-primary`/`--color-muted-foreground`/etc.
  mapping `@didact/theme`'s own `@theme inline` block defines by hand -- so a consumer who copies a
  component through the registry and relies on `cssVars.theme` alone (no `@didact/theme`
  installed) still gets working `bg-primary`/`text-muted-foreground`/etc. utilities.
  **`radius` is the one token that still needs care:** it is not color-shaped, so the CLI adds no
  alias for it, and Tailwind v4's own default theme defines `--radius-sm`/`--radius-md`/
  `--radius-lg`/`--radius-xl` as fixed values that do **not** read a `--radius` custom property at
  all -- that derivation (`--radius-md: calc(var(--radius) - 2px)`, etc.) is `@didact/theme`'s own
  `@theme inline` override, not a Tailwind default. A consumer who copies a component using
  `rounded-md`/`rounded-xl` through the registry, injecting only `--radius` via `cssVars.theme`,
  gets Tailwind's stock fixed radius scale instead of one that follows Didact's `--radius` -- they
  need to also install `@didact/theme` (or copy its `@theme inline` block by hand) to get the real
  derived scale. Also verified: trying to work around this with the item's own `css` field
  (injecting a hand-written `@theme` block with the correct alias names) does not work either --
  the CLI's `css` merger treats every key nested under an at-rule like `"@theme"` as a CSS
  **selector**, not a flat custom-property declaration (confirmed by reading the relevant merge
  function in `shadcn@4.16.2`'s bundled source, `chunk-Q6Y23SOV.js`), so
  `"css": { "@theme": { "--foo": "var(--bar)" } }` throws a `CssSyntaxError` trying to parse
  `.temp{var(--bar)}` as a declaration body.

## Status

`registry.json` is synced with the full current component inventory and uses the real token names
(`background`, `primary`, `ring`, `radius`, …, matching `packages/theme/src/tokens.css` after the
`--didact-*` -> real-name theme migration) throughout every item's `cssVars.theme` -- no item
references the old `--didact-*` names anymore.

Items, by layer:

- **`@didact/ui` primitives** (layers 1-2): `button`, `card`, `badge`, `separator`, `toggle`,
  `toggle-group` (depends on `toggle` via `registryDependencies` rather than duplicating its file),
  `input`, `textarea`, `label`, `radio-group`, `checkbox`.
- **`@didact/core` education components** (layer 3): `mastery-badge` (depends on `badge`),
  `flashcard` (depends on `card`, `button`, `toggle-group`), `retrieval-practice-session` (active
  recall with a consumer-injected scheduler), `quiz-item` (the
  `SingleChoiceQuiz`/`MultiSelectQuiz`/`TrueFalseQuiz`/`FillInTheBlankQuiz`/`ShortAnswerQuiz`
  family, one file, one item -- depends on `card`, `button`, `radio-group`, `checkbox`, `input`,
  `label`, `textarea`, `toggle-group`), `timeline` (RF-8; ordered vertical/horizontal steps,
  status semantics and token-only styling; no primitive dependency), `matching-exercises`
  (`MatchingExercise`/`SortExercise`/`CategorizeExercise`, RF-3; depends on `button`, `card`, and
  exact-pinned `@dnd-kit/core`/`@dnd-kit/sortable`), `practice-set`,
  `retrieval-practice-session`, and `generative-learning` (`SelfExplanationPrompt`,
  `WorkedExample`, and `CompletionProblem`), plus the cross-domain `numeric-question`, `word-bank`,
  and `hotspot` interactions, and `interactive-media` with its framework-neutral
  `interactive-media-schema` dependency.
- **`@didact/spaced-repetition`**: `spaced-repetition` (`registry:lib`), the SM-2 scheduler --
  `types.ts` plus `sm2.ts`, zero runtime dependencies. The FSRS module (`fsrs.ts`) is not a
  registry item: it is a documented implementation stub (ROADMAP Phase 4), not a real component
  yet.

Source items record the tokens their files reference so the design audit remains local and
readable. The public build removes those partial `cssVars` blocks and installs the complete
`didact-theme` dependency instead; this prevents dependency ordering from producing an incomplete
or conflicting light/dark theme. `dependencies` lists only the npm packages a file actually
imports, checked against each package's real `package.json` rather than assumed --
notably every Radix-backed primitive imports from the single unified `radix-ui` package (`"radix-
ui": "1.6.7"` in `packages/ui/package.json`), not the older scoped `@radix-ui/react-*` subpackages.

The registry build is deliberately different from the workspace build. Workspace source keeps its
package imports (`@didact/ui`, `@didact/spaced-repetition`) for normal monorepo type checking; the
registry build rewrites those imports to stable shadcn consumer aliases such as
`@/components/ui/button`, `@/components/didact/flashcard`, and
`@/lib/didact/spaced-repetition/types`. The rewriter verifies that each local import is supplied by
the item's `registryDependencies`, so copied components do not require unpublished Didact npm
packages.

The build also expands the short dependency names used in source `registry.json` into full Didact
item URLs. This is required because shadcn interprets a bare dependency such as `card` as its own
built-in registry item. The default base is the repository's raw `main` artifact path; release
automation must set `DIDACT_REGISTRY_BASE_URL` to the immutable tag or deployment URL before
building published artifacts.

Every item also receives the reusable `didact-theme` registry dependency. It installs the complete
semantic token set plus `radius-sm`/`radius-md`/`radius-lg`/`radius-xl` derived from `--radius` via
shadcn's `cssVars.theme`; no `@didact/theme` npm dependency or manual CSS copy is required.

The built, servable JSON lives in `public/r/` and is committed because it is the artifact a static
host serves. Regenerate and validate it after any change to `registry.json` or a referenced source
file with:

```
pnpm --filter @didact/registry build
pnpm --filter @didact/registry lint
pnpm --filter @didact/registry test
```

## Versions and updates

shadcn registry items have no native version field. Didact therefore follows these rules:

- `public/r/<name>.json` is the current stable copy of an item and may be reinstalled to update it.
- Breaking prop or behavior changes require a new item name with a major suffix (for example,
  `flashcard-v2`); the previous major remains available during its documented migration window.
- Compatible fixes keep the item name. Consumers review their local diff before accepting a
  reinstall because copied source belongs to the consuming project after installation.
- Published artifacts must be generated from a clean commit/tag. The tag is the immutable version
  reference for audits and reproducible installs; mutable `main` URLs are for evaluation only.
- Do not promise `shadcn diff` for third-party namespaces until it is covered by an end-to-end test.

The automated tests inspect every educational artifact and generated kit, their recursive dependency closure, all
local alias imports, and the theme/radius setup. They fail if an unresolved `@didact/*` import
returns or a component references a local file not supplied by `registryDependencies`.

## Consumer fixture

`fixture/consumer` is a clean React/Vite application contract, not a workspace package. Its
handwritten `CourseActivity` exercises a basic component, a drag interaction, and a measurement
tool; `verify:consumer` also materializes Interactive Media and the Mathematics & Data kit. It
validates the complete copied dependency graph without monorepo imports. See
`fixture/consumer/README.md` for independent `pnpm check`, `vite build`, official CLI coverage,
theming, and pinned-release usage.
