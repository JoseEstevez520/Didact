# @didact/validators/drift

Drift control for non-copied external dependencies — RNF-5 in `requirements.md`.

## Why it exists

Didact's distribution model (RF-15, shadcn/ui-style) protects the consumer from breaking due to a
dependency update **for the code it copies**. But not every component is 100% copy-paste: layer 1
of the architecture (`design.md` §2, "accessible primitives," candidate Radix UI) is a real
dependency, not code copied alongside the component. `design.md` §9 states this explicitly: *"the
copy-paste model protects the components, not their internal behavioral dependencies."*

**RNF-5** requires that any dependency in that situation be pinned to an **exact version** (no
`^`/`~` range) and carry a **drift test** — the same standard `openui-adoption.md` already
required for `@openuidev/react-lang`, whose failure to meet it (an external dependency breaking on
every minor version) is precisely the problem that motivated adopting the shadcn model in the
first place (`requirements.md` §0.2).

## The Radix/React 19 caveat (research.md P2)

`research.md` Question 2 documents, with `peerDependencies.react` checked live against
`registry.npmjs.org`, that **today** Radix UI's `latest` version (`@radix-ui/react-dialog`
1.1.23) declares its React 19 peer pinned to `19.0.0-rc.1`, not `^19.0.0` — with `npm` (not
pnpm/yarn) this requires `--legacy-peer-deps`/`--force` to install in a stable-React-19 project.
shadcn/ui's own documentation confirms this
(https://ui.shadcn.com/docs/react-19), and Radix already has the fix in a v1.2.0 **in RC**, not
promoted to `latest` as of the research date (2026-08-11).

**Practical consequence for this validator:** if Radix UI (or another layer-1 dependency) is
adopted as a pinned dependency, `pinned-deps.json` must record not just the exact version but the
**reason** (here: known peer-dependency friction, not a functional blocker), so whoever updates it
does so knowingly rather than as a routine bump. The same would apply to `ts-fsrs` if chosen as a
pinned dependency for the advanced spaced-repetition mode (see
`@didact/spaced-repetition/src/fsrs.ts`), or to `dnd-kit` if adopted to mitigate the WCAG 2.5.7
non-compliance in RF-3 (`research.md` §9.3 — React 19 compatibility **not confirmed** in official
documentation, only in a secondary source).

## `pinned-deps.json`

A placeholder with the `{dependency, exactVersion, reason}` structure and a **commented** example,
not a real installed dependency — there are no external dependencies yet in this scaffold
(Phase 1-3). It gets populated in Phase 4 as `packages/core` adopts real primitives.

## Status

No executable drift test yet. The intent (Phase 4) is a CI test that compares each dependency's
installed version listed here against `exactVersion` and fails if they differ, forcing a
deliberate update (review the changelog, not just `npm update`).
