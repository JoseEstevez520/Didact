# SkillNet consumer boundary — archived design note

**Didact will not implement or publish a SkillNet adapter. This directory contains no code and is
kept only as an historical boundary note.** SkillNet consumes the public registry from its own
repository like any other product; its integration code never lives in this monorepo.

See `specs/education-components/design.md` §0 and §4, and `requirements.md` §0.1/§2.4: SkillNet is
Didact's **first real consumer**, not the core's design criterion. Any SkillNet-specific decision
(tokens from `design-system.md`, language, the v2 generative catalog) is treated as an optional
adapter, never as part of `packages/*`.

## What the adapter would do (in `repo/`, not here)

1. **Direct use (v1 courses, static):** normal import of `@didact/core` components in
   `skillnet-web`, with the `design-system.md` theme applied on top of the core's neutral theme
   (RF-18). No additional restrictions.
2. **Generative catalog block (v2 courses):** a Didact component enters the catalog
   (`apps/skillnet-web/src/components/courses/kit/`) only if it complies with the 7 contract rules
   in `openui-adoption.md` §5.2, is described with `zod` + `defineComponent`, passes
   `assertStaticOnly`, has a mirror in `src/render/kit.py`, and doesn't push the block DAG past
   `MAX_RENDERED_NODES = 64`.

## Fitness table (research.md, Question 7)

Classification of the 11 components in `requirements.md` §4.1 against SkillNet's v2 generative
catalog rules (`RENDER_ALLOW_REACTIVE = False`, rule 5: `QuizItem` never carries `answer_key` in
the `ui_spec`). Primary source: the executable docstring in
`repo/apps/skillnet-api/src/render/spec.py:1-26`, not the 7-rule summary in
`docs/design/v2-dynamic-courses.md` §5.2 (which cites them without enumerating them).

**Result: 8 of 11 FIT, 1 fit-but-blocked, 2 not fit.**

| Component (RF) | Verdict | Reason |
|---|---|---|
| `Flashcard` (RF-1) | **FIT** | Flip/mark-as-known = ephemeral React state; no `answer_key` to protect. Precedent: `QuizItemBlock`. |
| Headless spaced-repetition scheduling (RF-2) | **NOT FIT** | Persisting review state across sessions requires `Query`/`Mutation`, forbidden while `RENDER_ALLOW_REACTIVE=False`; the public UI uses `RetrievalPracticeSession` with consumer-owned scheduling. |
| Matching/Sort/Categorize (RF-3) | **FIT** | Production precedent: `DragOrder` uses literal props + internal React, no `Mutation`. |
| Quiz variants (RF-4) | **FIT** | `QuizItem` already covers 6 `item_type`s without `correct`/`explanation` in props (rule 5); open-answer verification runs server-side via a self-contained POST. |
| `Glossary`/`Term` (RF-5) | **FIT** | Pure presentation; no answer to protect, no dynamic data. |
| `Hint`/`Reveal` (RF-6) | **FIT with structural tension** | Toggle = React state, but the canonical re-serialization arrives all at once: safe for a pedagogical hint, conflicts with rule 5 if it wraps an exam answer — in that case it must delegate to `QuizItem`'s self-contained POST. |
| Progress/mastery (RF-7) | **FIT** | A static snapshot (`mastery: 0.72`) as a literal prop, just like `Chart`. A live bar would require `Query`. |
| `Timeline`/`Steps` (RF-8) | **FIT** | Already exists literally as `StepSequence` — a 1:1 match with RF-8, not an analogy. |
| Video checkpoint (RF-9) | **FIT IN PRINCIPLE / BLOCKED BY INFRASTRUCTURE** | The rules don't prevent it (same self-contained pattern as `QuizItem`); the real blocker is that there's no video player in `skillnet-web` (research.md Question 8), not reactivity. |
| `Rubric` (RF-10) | **FIT** | Self-assessment without automatic grading → no `answer_key`; ephemeral selection state. |
| Code exercise (RF-11) | **NOT FIT** | Checking requires execution/network (≈`Mutation`, forbidden). Display without checking (`CodeBlock`) is fit, but doesn't cover full RF-11. |

**Precedent note:** the key pattern that makes the FITs possible is that a block can have **plain
React state** (`useState`/`useEffect`) without violating "no reactivity" — the prohibition is on
the OpenUI dialect layer (`Mutation`/`Query`/`$state`/`useTriggerAction()`), not on ordinary
React. SkillNet's real catalog today has **14 blocks**, not 10 as `design.md` §5's draft assumed.

## Video player (research.md, Question 8)

There is no video player integration in `skillnet-web` today (exhaustive search with no matches
for `video`/`player`/`react-player`/`video.js`/`hls`/timestamp events). It's a capability to
evaluate from scratch, not an already-made choice — recommended starting point: native `<video>` +
`<track kind="chapters">`/`timeupdate` before moving up to a library with an additional npm
dependency.

## Conceptual links (documents that live in `repo/`, not here)

- `repo/docs/design/openui-adoption.md` — the v2 generative catalog's rules and its honesty
  standard about inconclusive evidence.
- `repo/docs/design/design-system.md` — theme tokens the adapter would map onto the core's neutral
  theme.
- `repo/apps/skillnet-api/src/render/spec.py` — the primary, executable source for the contract
  rules (not the narrative summary in `v2-dynamic-courses.md` §5.2).

## Status

Boundary documentation only (Phase 1-3). Implementing the adapter is **Phase 5** of `ROADMAP.md`,
optional, and lives entirely in `repo/` — it does not block any core phase.
