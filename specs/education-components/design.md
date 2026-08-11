# Design — Education Components Library

> Answers the **how**, starting from `requirements.md`. Several sections are marked
> **[PENDING — research phase]**: they are not closed here because `requirements.md` §6 requires
> evidence before deciding. The decisions from `requirements.md` §0 (product owner) ARE closed and
> this document does not reopen them — it only verifies their technical viability.

## 0. Framework: core vs. adapter

Everything in this document distinguishes two things that **do not live in the same place nor
share the same lifecycle**:

- **Core**: the library itself. Consumer-agnostic. Lives in its own repo (§7).
- **SkillNet adapter**: code that lives in `repo/` (SkillNet) and consumes the core, themes it
  with `design-system.md` and, optionally, registers components in the v2 generative catalog. It
  is a consumer, not a part of the library.

Any section below labeled "(adapter)" describes something implemented in `repo/`, not in this
project.

## 1. Inherited constraints

### 1.1 From the core (always, any project)

| Constraint | Source |
|---|---|
| Distribution model: registry + CLI that copies source code (shadcn/ui style), not a versioned npm dependency as the primary channel | `requirements.md` §0.2, RF-15 |
| React as the target framework (to confirm if anything else stays out of scope, §6) | `requirements.md` §2 |
| Neutral default visual theme, restyleable via tokens/CSS custom properties | `requirements.md` RF-16 |
| Accessible by default (keyboard, ARIA, `prefers-reduced-motion`) | `requirements.md` §4.2 |
| Any external, non-copied dependency (e.g. the primitives layer) pinned to an exact version + drift test | `requirements.md` RNF-5 |

### 1.2 From the SkillNet adapter (only if integrated there)

| Constraint | Source |
|---|---|
| CSS tokens from `design-system.md` (colors, radii, shadows, typography, motion) | `repo/docs/design/design-system.md` |
| No `rounded-2xl/3xl`, no gradients, no `shadow-lg/xl`, no generic spinners | `design-system.md` |
| v2 generative catalog = no reactivity (`Mutation`/`Query`/`$state`) except under `openui-adoption.md` §6 conditions | `repo/docs/design/openui-adoption.md` |
| The browser in v2 never receives raw text from the model, only validated canonical re-serialization | `openui-adoption.md` §4 |
| The answer key (`answer_key`) is never served to the client | `openui-adoption.md`, `snml-spec.md` |
| Code and comments in English (SkillNet repo convention) | `repo/CLAUDE.md` |

None of §1.2 applies to the core. A core component does not "know" SkillNet exists.

## 2. Proposed architecture (core, 3 layers)

```
┌─────────────────────────────────────────────┐
│ 3. Education molecules                       │  Flashcard, MatchingExercise, QuizItem*,
│    (components with pedagogical meaning)     │  SpacedRepetitionDeck, Glossary, Hint,
│                                               │  Timeline, Rubric, MasteryBadge…
├─────────────────────────────────────────────┤
│ 2. Styled layer                               │  Tailwind + variants (cva or similar) over
│    (neutral theme, restyleable)              │  the primitives. A single place for theming.
├─────────────────────────────────────────────┤
│ 1. Accessible primitives                     │  Accessible behavior with no styling of its
│    (headless)                                │  own (focus, keyboard, ARIA). Candidate: Radix UI
│                                               │  (the same base shadcn/ui uses) [to verify]
└─────────────────────────────────────────────┘
```

This is deliberately the same layer pattern shadcn/ui uses (headless primitives + Tailwind +
variant composition), applied to educational vocabulary instead of generic. Layer 3 is where this
project's real value lives — layers 1 and 2 exist so we don't reinvent accessibility from scratch
(see the cost of doing it by hand in `openui-adoption.md` §1: 1500+ lines of tests to shield a
custom parser).

**[PENDING — research phase, requirements.md §6.2]**: confirm that Radix UI (or whichever
alternative wins the comparison) works well on React 19 with executed evidence.

## 3. Distribution model: shadcn/ui-style registry

**Decided in `requirements.md` §0.2**; this section details the shape, subject to the technical
verification in §6.1.

- Each component is described in a registry entry (name, files, dependencies on other components
  from the library itself, external dependencies if any).
- A CLI (shadcn's own, if its third-party registry mechanism allows it — question §6.1 — or a
  custom one if not) copies the source code into the consuming project.
- The consumer ends up with the component as their own code: they can modify it, they don't
  depend on a published version to keep working.
- Direct consequence: there is no "single version deployed to production" for each component,
  there are as many copies as projects that adopted it. The central library is the source of truth
  for *new* copies and for anyone who wants to update theirs, not a shared runtime.

**[PENDING — research phase, requirements.md §6.1, §6.3]**: the exact third-party registry
mechanism, and whether requiring Tailwind as a peer dependency is acceptable given the "any
project" goal.

## 4. SkillNet adapter (outside the core)

### 4.1 Direct use (v1 courses, static)

Normal React import in `skillnet-web`, with the `design-system.md` theme applied on top of the
core's neutral theme (RF-18). No additional core restrictions.

### 4.2 Generative catalog block (v2 courses)

A core component enters SkillNet's catalog
(`apps/skillnet-web/src/components/courses/kit/`) only if:

1. It can be described with a `zod` schema + `defineComponent`, just like the current 10 blocks
   (`kit/schemas.ts`, `kit/library.tsx`).
2. It complies with the 7 contract rules in `openui-adoption.md` §5.2 and does not require
   `Mutation`/`Query`.
3. It passes `assertStaticOnly` and does not trigger `useTriggerAction`.
4. It has a mirror in `src/render/kit.py` (Python) for the drift test
   (`test_render_prompt_artifact.py`).
5. It does not push the block DAG past `MAX_RENDERED_NODES = 64` with reasonable nesting.

This is adapter work, it lives in `repo/`, and it does not condition the core components' design
except that they must be describable statically when reasonable (RNF-4).

## 5. Inventory of candidate components (core — final priority after research)

| Component | Requirement | Expressible without reactivity for the SkillNet adapter? (draft) | Priority (draft) |
|---|---|---|---|
| `Flashcard` | RF-1 | Likely yes | High |
| `SpacedRepetitionDeck` | RF-2 | Likely no (state across sessions) | Medium |
| `MatchingExercise` / `SortExercise` / `CategorizeExercise` | RF-3 | To confirm | High |
| Quiz variants (multi-answer, T/F, blank, short open) | RF-4 | Yes, same pattern as SkillNet's current `QuizItem` | High |
| `Glossary` / `Term` | RF-5 | Yes | Medium |
| `Hint` / `Reveal` | RF-6 | Yes, careful not to leak the answer in the DOM | High |
| Progress/mastery indicators | RF-7 | Yes | Medium |
| `Timeline` / `Steps` | RF-8 | Yes | Medium |
| Video checkpoint | RF-9 | To confirm (depends on the player) | Low |
| `Rubric` / self-assessment | RF-10 | Yes | Low |
| Code exercise | RF-11 | Likely no (needs execution) | Low |

The "expressible without reactivity" column is specific to the SkillNet adapter; for the core,
priority is based solely on general usefulness (`requirements.md` §4.1), not on that column.

## 6. Theming (core)

No palette or spacing scale of its own imposed on consumers. The core defines **its own neutral
default theme** (so it can be shown in the registry/Storybook without depending on any consumer)
exposed via CSS custom properties, and any project — SkillNet included — overrides it with its
own. SkillNet, as an adapter, maps `design-system.md` onto those variables (RF-18); this is no
different from how any project adopts a shadcn/ui theme.

## 7. Project location — **decided**

Independent repo (where it lives today, `Anfaia/library`), published as its own registry,
consumed via CLI from any project — not as a package inside `repo/packages/`.

This is no longer an open decision: it follows directly from `requirements.md` §0.1 ("must be
usable in any project") and §0.2 (shadcn model, which is intrinsically multi-project: a registry
makes no sense if only one repo consumes it). SkillNet consumes this library just like it would
consume any third-party shadcn registry: by copying components, without publishing or depending
on an npm version.

What remains pending research is only the **exact mechanism** (`requirements.md` §6.1), not the
general shape.

## 8. Quality and tooling (core)

- **Storybook** (or equivalent): one story per component and per relevant state (empty, error,
  correct/incorrect, loading). A11y addon in CI.
- **Tests**: behavior (Testing Library or equivalent), not just snapshots.
- **Registry as living documentation**: each registry entry must be enough to understand what the
  CLI copies without reading the source code first.
- **Drift test** (only in the SkillNet adapter, for components entering the v2 catalog): same
  pattern as `catalog-drift.test.ts` in `repo/`.

## 9. Risks

- **shadcn's third-party registry mechanism doesn't support what we need** (§6.1) — mitigate by
  having a minimal own CLI/registry as plan B, not just assuming shadcn's works as-is.
- **Choosing a base dependency (layer 1) that breaks like `@openuidev` 0.2.x** — mitigate with an
  exact version + drift test if something external is adopted (RNF-5). The copy-paste model
  protects the *components*, not their internal behavioral dependencies (e.g. Radix is still a
  real dependency if it isn't also copied).
- **Designing for SkillNet without realizing it** (coupling tokens, language, or SkillNet
  assumptions into the core) — mitigate by reviewing every core PR against the question "does this
  make sense to someone who has never heard of SkillNet?".
- **Well-intentioned but evidence-free accessibility** — mitigate by not designing RF-12–14
  without the concrete sources `requirements.md` §6.5 asks for.
- **(Adapter) Exceeding `MAX_RENDERED_NODES`** when nesting composite exercises inside SkillNet's
  v2 catalog — verify per component before registering it, does not affect the core.

## 10. Success metrics (draft)

- Number of components with a story + test + a11y review, out of the total prioritized in §5.
- Number of real consuming projects (not just SkillNet) that copy at least one component — a
  signal that "any project" isn't just aspirational.
- (Adapter) Number of components registered in SkillNet's v2 catalog without breaking
  `test_render_prompt_artifact.py`.
