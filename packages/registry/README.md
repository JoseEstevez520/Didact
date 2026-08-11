# @didact/registry

Didact's `registry.json` in **shadcn/ui's official schema** — the distribution mechanism chosen
for RF-15 in `requirements.md` (registry + CLI that copies source code into the consuming
project, not a versioned npm dependency).

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
  `flashcard` (depends on `card`, `button`, `toggle-group`), `spaced-repetition-deck` (depends on
  `card`, `button`, `flashcard`, and the `spaced-repetition` lib item), `quiz-item` (the
  `SingleChoiceQuiz`/`MultiSelectQuiz`/`TrueFalseQuiz`/`FillInTheBlankQuiz`/`ShortAnswerQuiz`
  family, one file, one item -- depends on `card`, `button`, `radio-group`, `checkbox`, `input`,
  `label`, `textarea`, `toggle-group`).
- **`@didact/spaced-repetition`**: `spaced-repetition` (`registry:lib`), the SM-2 scheduler --
  `types.ts` plus `sm2.ts`, zero runtime dependencies. The FSRS module (`fsrs.ts`) is not a
  registry item: it is a documented implementation stub (ROADMAP Phase 4), not a real component
  yet.

Each item's own `cssVars.theme` only lists the tokens its own file references directly, not the
ones its `registryDependencies` already bring along (e.g. `flashcard` composes `Card`/`Button`/
`ToggleGroup` but references no token directly itself, so it has no `cssVars`; `mastery-badge`
composes `Badge` but adds one direct reference of its own, `muted-foreground`) -- mirroring
`toggle-group`/`toggle`'s existing pattern. `dependencies` lists only the npm packages a file
actually imports, checked against each package's real `package.json` rather than assumed --
notably every Radix-backed primitive imports from the single unified `radix-ui` package (`"radix-
ui": "1.6.7"` in `packages/ui/package.json`), not the older scoped `@radix-ui/react-*` subpackages.

One residual gap worth flagging: `flashcard.tsx`, `mastery-badge.tsx`, `spaced-repetition-deck.tsx`
and `quiz-item.tsx` import `@didact/ui` (and, for the deck, `@didact/spaced-repetition`) as real
package specifiers (needed for the actual pnpm workspace build), whereas `registryDependencies`
only copies the *source files* of the items they compose from into a copy-paste consumer's
project -- unlike `toggle-group`'s relative `"./toggle.js"` import, those package imports will not
resolve for a consumer who copies one of these items without also installing `@didact/ui` (and
`@didact/spaced-repetition`, for the deck) as a real npm dependency. Not solved here; a future pass
should either publish those packages as installable for that path or rewrite these items' registry
copies to relative imports at build time. The built, servable JSON lives in `public/r/` and IS
committed (same reasoning as `pnpm-lock.yaml`: it's generated, but it's the actual artifact a
static host would serve, not throwaway build junk) -- regenerate it after any change to
`registry.json` or the files it points at with:

```
pnpm dlx shadcn@latest build packages/registry/registry.json -o packages/registry/public/r --cwd <repo root>
```

The registry copy mechanism itself is verified end to end (ROADMAP.md Phase 3 block F): `shadcn
add` against the built item JSON, from a throwaway consumer project outside this workspace,
produces a byte-identical copy of the real source file and a working Vite build. This registry
gets published for real hosting in Phase 6.
