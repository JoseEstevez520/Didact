# Requirements — Education Components Library

> Spec-Driven Development (SDD). This document fixes the **what** and the **why** before
> designing (`design.md`) or planning tasks (`../../ROADMAP.md`). It does not prescribe
> implementation.

## 0. Product owner decisions (2026-08-11)

Recorded here because they bound everything that follows — they are not research conclusions,
they are product direction:

1. **This is a general-purpose library, not a SkillNet module.** It must be usable "in any
   project," not just in `repo/` (SkillNet). SkillNet is the **first real consumer** (where the
   need was born and where it will be tested first), but it is not the design criterion. Any
   coupling to SkillNet-specific decisions (tokens from `design-system.md`, the generative v2
   catalog) is treated as an **optional adapter**, never as part of the core.
2. **Style and distribution model reference: shadcn/ui.** Not as a versioned npm package, but as a
   **registry + CLI that copies the component's source code into the consuming project**
   ("copy-paste ownership"). Explicit motivation: this avoids exactly the risk SkillNet already
   lived through with `@openuidev/react-lang` 0.2.x (`repo/docs/design/openui-adoption.md` §1,
   §3) — an external dependency that broke on every minor version. With the shadcn model, the
   consumer owns the code from the moment they copy it; there is no upgrade that can break
   anything without the consumer deciding to take it.

These two decisions are verified with evidence in the research phase (does shadcn's "registry"
mechanism actually allow building a real, non-official registry? does the primitives layer that
shadcn relies on — Radix UI — work well on React 19?) but **the direction is not open for debate**
except if research finds a real technical impediment.

3. **Revisited (2026-08-11, Phase 3.5 "design foundations"): Didact ships its own minimal
   primitive kit (`@didact/ui`), reversing the original §2 "generic primitives are out of scope"
   line.** The original reasoning — "for generic UI, the consumer uses shadcn/ui directly" — held
   while the library had no components at all to be inconsistent with. Once real components
   (`MasteryBadge`, `Flashcard`) started shipping in `@didact/core`, each one was independently
   inventing its own button/card/badge treatment, which is exactly the "every training platform
   reinvents X" problem this library exists to fix, just moved one layer down. The revised
   decision: `@didact/ui` provides a small, general-purpose set of primitives (Button, Card family,
   ToggleGroup/Toggle, Separator, Badge) that `@didact/core`'s education molecules compose from, so
   every component is consistent by construction (see `docs/interface-norms.md`) instead of by
   convention every author has to remember. This does not walk back §0.2's distribution model or
   §0.1's "general-purpose, not SkillNet-specific" framing — `@didact/ui` is still copy-paste
   distributed like everything else, still theme-driven via `@didact/theme`'s tokens, and still
   usable standalone by a consumer who only wants the primitives. It is a scope correction, not a
   reversal of the product's identity: Didact remains about pedagogical components first: the
   primitive kit exists **in service of** making those components self-contained and consistent,
   not as a competing generic-UI-library ambition.

## 1. Context and problem

While building content in SkillNet (`../../repo`, a training platform for SMEs that converts
internal documents into courses), we ran into a general industry gap, not just one specific to
that project:

1. **There is no commonly accepted vocabulary of e-learning components**, at the level that
   already exists for generic UI (shadcn/ui, Radix, MUI…). Every training platform reinvents
   flashcards, matching exercises, quizzes, spaced repetition, etc.
2. **There is no "famous" base that serves as a style and architecture reference** for building
   that vocabulary with good accessibility and good developer ergonomics — hence the §0.2 decision
   to use shadcn/ui as a reference for **form** (headless + Tailwind + copy-paste), not for
   **content** (shadcn's components are generic, not educational).

SkillNet, specifically, additionally has:
- v1 (static): lessons in Markdown + fixed exercises.
- v2 (dynamic): a closed catalog of blocks (`apps/skillnet-web/src/components/courses/kit/`) for
  agent-driven UI generation, without reactivity (`openui-adoption.md`).

This is origin context and a real test case, not the definition of the product.

## 2. Scope

### In scope (core)

- A **vocabulary of educational components** (flashcards, matching/drag-and-drop exercises, quiz
  variants, spaced repetition, glossary, hints, progress/mastery, timeline, rubric, etc.) reusable
  in any React project.
- A **shadcn-style distribution model**: a registry (descriptive catalog, JSON or equivalent) +
  a mechanism to copy the source code into the consuming project, without a versioned npm
  dependency as the primary way to consume it.
- A **neutral default visual theme**, not SkillNet's or any specific consumer's, with theming via
  tokens/CSS custom properties so each project can adapt it to its brand (just like a shadcn
  component adopts the theme of whoever copies it).
- A **minimal, general-purpose primitive kit** (`@didact/ui`: Button, Card family, ToggleGroup/
  Toggle, Separator, Badge) that the pedagogical components compose from, so every component is
  consistent by construction instead of each one inventing its own button/card/focus treatment.
  Product-owner decision, 2026-08-11 (§0.3): this revises the line that previously put generic
  primitives out of scope — see §0.3 for the full reasoning and `docs/interface-norms.md` for the
  norms this kit exists to make possible.
- First-class accessibility, including neurodiversity (see §4.2), independent of who consumes the
  library.
- Living documentation (Storybook or equivalent) that serves both as a browsable catalog and as
  the registry for the copy mechanism.

### SkillNet adapter (optional, outside the core)

- Mapping the core's neutral theme to the tokens in
  `../../repo/docs/design/design-system.md`.
- Registering the components that are statically safe as blocks in SkillNet's v2 generative
  catalog (`apps/skillnet-web/src/components/courses/kit/`), subject to the rules in
  `openui-adoption.md` — this lives documented as **a specific consumer's integration**, not as a
  requirement of the library.

### Out of scope (for now)

- `Mutation`/`Query`/`$state`-style reactivity in any generative variant (see
  `openui-adoption.md` §6 for the conditions if it is ever activated — that is not a decision of
  this library).
- ~~Generic UI primitives already covered by shadcn/ui itself (Button, Input, Dialog…). This
  library is about pedagogical components; for generic ones, the consumer uses shadcn/ui directly,
  and this library relies on the same primitives when it makes sense.~~ **Revised 2026-08-11, see
  §0.3**: this line is no longer accurate. Didact now ships `@didact/ui`, its own minimal
  primitive kit, as the base its pedagogical components compose from — not as a generic-UI-library
  ambition, but because self-contained quality and consistent interface norms across
  `@didact/core`'s components required it. Still out of scope: a *broad*, general-purpose UI
  library competing with shadcn/ui's own breadth (Dialog, Input, Select, Combobox, etc.) — `@didact/
  ui` stays deliberately minimal, adding a primitive only when an education component in
  `@didact/core` actually needs it.
- Authoring pedagogical content (question banks, curricula).
- Backend / progress persistence. The components are for presentation and interaction.

## 3. Stakeholders

- **Jose (product owner).** Decides scope, reference style (§0), and priority.
- **Implementing agents** (execution phase, a different session). Consume this spec and
  `../../ROADMAP.md` as their work contract.
- **Any consuming project**, starting with SkillNet but not limited to it — including potential
  open source users if the library is published as a public registry.
- **End learners** of the projects that consume it, including neurodivergent profiles.

## 4. Functional requirements

EARS format. Stable IDs for referencing from `design.md` and from the roadmap's tasks.

### 4.1 Component vocabulary (core, consumer-agnostic)

- **RF-1**: THE SYSTEM SHALL provide a `Flashcard` component (front/back, flip, mark as
  "known"/"review").
- **RF-2**: THE SYSTEM SHALL provide a **spaced repetition** component that orders a deck of
  `Flashcard`s according to a review algorithm (SM-2 or equivalent), decoupled from storage
  (receives/returns state, does not persist it — each consuming project decides where to store
  it).
- **RF-3**: THE SYSTEM SHALL provide **matching/drag exercise** components (matching, sequence
  ordering, categorizing) with keyboard support, not just mouse drag-and-drop.
- **RF-4**: THE SYSTEM SHALL provide quiz variants beyond single-choice: multi-answer, true/false,
  fill-in-the-blank, short open answer with assisted verification.
- **RF-5**: THE SYSTEM SHALL provide a `Glossary`/`Term` component with a tooltip or popover that
  does not require navigating away from the content.
- **RF-6**: THE SYSTEM SHALL provide a `Hint`/`Reveal` component (progressive hint, show/hide
  solution) that does not leak the correct answer into the DOM until the user explicitly requests
  it.
- **RF-7**: THE SYSTEM SHALL provide **progress/mastery** indicators (per lesson, per skill) with
  a neutral, restyleable visual theme.
- **RF-8**: THE SYSTEM SHALL provide a `Timeline`/`Steps` component for sequential processes
  (protocols, step-by-step procedures).
- **RF-9**: THE SYSTEM SHALL provide a **video checkpoint** component (pauses at a timestamp and
  poses a question), player-agnostic to the extent possible (to confirm in research, see §6).
- **RF-10**: THE SYSTEM SHALL provide a `Rubric`/self-assessment component (checklist of criteria
  with levels, without automatic grading if the criterion is subjective).
- **RF-11**: THE SYSTEM MAY provide a **code exercise** component (editor with syntax highlighting
  + verification) — low priority until real interest is validated.

*(Scope list, not the final prioritization — that is fixed by `design.md` after research.)*

### 4.2 Accessibility and neurodiversity (core)

- **RF-12**: WHEN a component has interactive state, THE SYSTEM SHALL expose it via ARIA in a way
  that is operable by keyboard and screen reader, without relying only on color.
- **RF-13**: THE SYSTEM SHALL respect `prefers-reduced-motion` in every animation.
- **RF-14**: THE SYSTEM SHALL avoid patterns that penalize neurodivergent users identified in
  research (non-configurable time limits, high visual density, unsolicited animation) — concrete
  criteria to be defined after §6.

### 4.3 Distribution and theming (core)

- **RF-15**: THE SYSTEM SHALL be distributed via a registry + CLI mechanism that copies the
  component's source code into the consuming project, following the shadcn/ui model (§0.2), not
  as a versioned npm dependency as the primary channel.
- **RF-16**: THE SYSTEM SHALL expose its theming via tokens/CSS custom properties, with a
  documented neutral default theme; no component should hardcode a specific consumer's palette
  (including SkillNet's).
- **RF-17**: EACH component SHALL have a Storybook story (or equivalent) with its states (empty,
  error, loading, correct/incorrect) and SHALL pass automated a11y checks.

### 4.4 SkillNet adapter (outside the core, optional)

- **RF-18**: THE SkillNet ADAPTER SHALL map the core's neutral theme to the tokens in
  `design-system.md` without modifying the core components.
- **RF-19**: EACH component that is a candidate for SkillNet's v2 generative catalog SHALL declare
  itself free of unauthorized mutation capability, so it can be registered in
  `apps/skillnet-web/src/components/courses/kit/` without reopening `openui-adoption.md`.

## 5. Non-functional requirements

- **RNF-1 (bundle):** components must be tree-shakeable / independently copyable; consuming one
  must not drag in the rest.
- **RNF-2 (i18n):** no fixed embedded text without an extension point for translation — the core
  does not assume any specific i18n framework (SkillNet uses `react-intl`; another consumer may
  use another one).
- **RNF-3 (security):** no component executes unsanitized HTML/markdown coming from untrusted
  content.
- **RNF-4 (performance):** components that may be used in streaming contexts (like SkillNet's
  generative catalog) must not assume all their props arrive complete at once — this is a core
  requirement even though it originates from an adapter case, because it makes the component more
  robust in general.
- **RNF-5 (maintenance and dependencies):** any external dependency that is not copied (e.g. the
  primitives layer if it relies on Radix UI) must be pinned to an exact version with a drift test
  — the same standard `openui-adoption.md` already requires for `@openuidev`. The distribution
  model itself (§0.2, RF-15) minimizes this risk for the components themselves, not for their
  internal behavioral dependencies.

## 6. Open questions for the research phase

1. Does shadcn/ui's "registry" mechanism (`shadcn add <url>` CLI, `registry.json`) allow building
   an **independent, private/own registry**, not the official shadcn one, with different
   components? What does that imply in practice (hosting the JSON, exact schema, known limits)?
2. Which base of accessible primitives is best (Radix UI — the one shadcn uses —, React Aria/
   Ariakit, Base UI)? Does it work well on React 19 with executed evidence, not just announced?
3. Must the library require Tailwind CSS as a peer dependency (like shadcn) or must it be usable
   without Tailwind in the target project? This determines how realistic "any project" actually
   is.
4. Which spaced-repetition algorithm is reasonable without a heavy dependency (SM-2 vs.
   alternatives), and how should its API be designed to be agnostic of where state is persisted?
5. Which accessibility patterns for neurodiversity have real evidence (not intuition): fonts,
   density, time control, animation — with which guides (WCAG 2.2, CAST/UDL, dyslexia/ADHD/autism
   guides with backing)?
6. Which existing e-learning libraries/standards contribute vocabulary or interoperability worth
   considering (H5P content types, Open edX XBlocks, IMS QTI/LTI, xAPI/SCORM), even if not adopted
   as a dependency?
7. Specific to the SkillNet adapter: which components in the §4.1 inventory are expressible
   without reactivity within the 7 rules of `openui-adoption.md` §5.2, and which are parked?
8. Specific to the SkillNet adapter: is there already a chosen video player in `skillnet-web` that
   supports checkpoints (RF-9), or is this a capability to evaluate from scratch?

## 7. Acceptance criteria for this document

- Every functional requirement has a stable ID referenceable from tasks.
- The core / SkillNet-adapter distinction is explicit in every requirement, not implicit.
- The research questions (§6) are concrete and are enough to brief a research agent without
  additional context.
- It contains no architecture decisions beyond those already fixed in §0 by the product owner
  (that lives in `design.md`).
