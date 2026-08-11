# Roadmap — Education Components Library

> Execution plan. Requires `specs/education-components/requirements.md` and `design.md` as the
> contract. Each phase is designed to be handed to a different agent (or a new session), with
> enough context to not depend on this conversation. **See "Current status" below for where the
> project actually is.**
>
> Reminder from `requirements.md` §0: this is a general-purpose library, distributed through
> Didact's own registry-based copy-paste model, usable in any project. SkillNet (`repo/`) is the
> first real consumer, via an **adapter** — the phases marked "(adapter)" live in `repo/`, not in
> this project, and are optional with respect to the core.

## Current status (2026-08-11)

| Phase | Status |
|---|---|
| 0 — Spec and plan | ✅ done |
| 1 — Deep research | ✅ done — `specs/education-components/research.md` |
| 2 — Design decision | ✅ done — `design.md` closed, no `[PENDING]` left |
| 3 — Project scaffold | ✅ done — pnpm monorepo, Storybook, registry, `MasteryBadge` end-to-end proof |
| 3.5 — Design foundations | ✅ done — `@didact/ui` primitive kit + real neutral design tokens + interface norms |
| 4 — First component wave | 🚧 in progress — `Flashcard` done; `SpacedRepetitionDeck` + quiz variants building |
| 5 (adapter) / 6 / 7 | ⏳ not started |

Post-Phase-1 product decisions (recorded in `research/decisions.md` and `requirements.md` §0.3):
the library ships **its own primitive kit** (`@didact/ui`); **Tailwind v4** is the styling layer;
the **visual language mirrors a proven neutral component system** (real design tokens + primitives),
verified in Storybook. A required setup detail — `@source` directives in
`packages/theme/src/tokens.css` — makes Tailwind generate every utility the primitives use; without
it the primitives render unstyled (this was the root cause of an early "why does it look broken"
episode, now fixed).

## How to use this roadmap

- Each phase has an **entry point** (what must exist before starting), a **deliverable** (what
  must exist when it's done), and an **exit criterion** (how to know it finished well).
- No phase starts without the previous one having produced its deliverable — in particular, phase
  2 (design decision) cannot fix architecture without phase 1's report.
- Phases 4+ are iterative per component, not a monolithic block: they run in waves following the
  priority phase 2 sets.

---

## Phase 0 — Spec and plan (this session)

**Status: done.**

- `specs/education-components/requirements.md` (core vs. SkillNet adapter made explicit in §0)
- `specs/education-components/design.md` (with explicit `[PENDING]` sections)
- This `ROADMAP.md`

---

## Phase 1 — Deep research

**Status: done.**

**Entry point:** `specs/education-components/requirements.md` §6 (open questions, 8 total).
**Deliverable:** a research report (`specs/education-components/research.md`, created in this
phase) that answers, with sources and verified evidence, the 8 questions in
`requirements.md` §6, and fills in the `[PENDING]` sections of `design.md` with data.
**Exit criterion:** every question in §6 has an answer with cited evidence (not "it seems that"
without a source) and an explicit recommendation. Where evidence is not conclusive, say so — an
"it's unclear, and here is what would need to be measured" is a valid research outcome; a made-up
answer is not (same standard `openui-adoption.md` §1 applied: "not verified, and I say so
explicitly").

### Brief for the research agent (use as the assignment prompt)

> Research in depth to ground the design of a general-purpose education components library (not
> specific to one project), distributed with Didact's own registry model (registry + CLI that
> copies source code, not a versioned npm dependency). First read
> `Anfaia/library/specs/education-components/requirements.md` in full — especially §0 (decisions
> already made by the product owner: general purpose, registry-based copy-paste distribution) and
> §6 (the exact 8 questions) — and `design.md` (sections marked `[PENDING]`). Do not propose new
> architecture or write code:
> the deliverable is a report, `Anfaia/library/specs/education-components/research.md`, with one
> section per question in `requirements.md` §6, cited evidence (URLs, verified behavior where
> feasible), and an explicit recommendation per question.
>
> For **question 1** (shadcn/ui's third-party registry mechanism): confirm with shadcn/ui's
> current official documentation whether its CLI supports unofficial/own registries
> (`registry.json`, item schema, hosting), and whether there are known limits (authentication,
> size, versioning of the same component). Do not assume that "shadcn is open source" implies
> the third-party registry mechanism is mature — verify it.
>
> For **question 2** (primitives base: Radix UI vs. React Aria/Ariakit vs. Base UI): confirm real
> React 19 compatibility with executed evidence or explicit changelog, not just a README read —
> the SkillNet repo already had a case (`@openuidev/react-lang`, see
> `repo/docs/design/openui-adoption.md`) where the only way to know the truth was to run it
> against our own data.
>
> For **question 3** (Tailwind as a mandatory peer dependency?): look at how shadcn/ui itself
> handles this and whether there are alternatives (plain CSS, CSS-in-JS) that don't compromise the
> "any project" goal too much.
>
> For **question 4** (spaced repetition): compare at least SM-2 with a modern alternative and
> state the cost of implementing it without a heavy dependency, with an API agnostic of where
> state is persisted.
>
> For **question 5** (accessibility and neurodiversity): use well-backed sources (WCAG 2.2,
> CAST/UDL, guides from recognized organizations — British Dyslexia Association, etc.), not design
> intuition.
>
> For **question 6** (e-learning standards: H5P, Open edX XBlocks, IMS QTI/LTI, xAPI/SCORM):
> identify what vocabulary or interoperability they contribute as a reference, without
> recommending adopting them as a dependency unless the evidence clearly justifies it.
>
> For **question 7** (SkillNet adapter: which components are expressible without reactivity):
> read `repo/docs/design/openui-adoption.md` §5.2 and §6 in full and classify each component from
> `requirements.md` §4.1 as fit or not fit for SkillNet's v2 generative catalog, with a reason.
>
> For **question 8** (SkillNet adapter: video player): check whether `skillnet-web` already
> integrates one before assuming a new one has to be chosen from scratch.

---

## Phase 2 — Design decision

**Status: done.**

**Entry point:** `research.md` from phase 1.
**Deliverable:** updated `design.md`: `[PENDING]` sections resolved (registry mechanism §3,
primitives base §2, Tailwind requirement), and the §5 inventory table with final core priority,
no longer "draft." The location (§7, independent repo) is already decided and is not reopened
here unless research finds a real impediment.
**Exit criterion:** no `[PENDING]` mark remains in `design.md`; the component priority order is
defensible with `research.md`'s evidence, not with intuition.

## Phase 3 — Project scaffold (core)

**Status: done.**

**Entry point:** `design.md` closed (phase 2).
**Deliverable:** the independent repo's structure (`Anfaia/library`): build/tsconfig
configuration, registry mechanism (own CLI or integration with shadcn's, per what phase 2 says),
Storybook with the neutral default theme, test pipeline.
**Exit criterion:** a trivial example component (e.g. a simple educational `Badge`) can be built,
tested, viewed in Storybook, and copied into a test project via the registry mechanism end to
end — proving the scaffolding works before building the real components.

## Phase 3.5 — Design foundations (core)

**Status: done.**

Added after Phase 3 once it became clear that building each component ad-hoc produced an
inconsistent look. Establishes the shared base every education component composes from, so
components are consistent by construction rather than reinvented each time.

**Entry point:** phase 3 scaffold + the product decision to ship an own primitive kit
(`requirements.md` §0.3).
**Deliverable:** `@didact/ui` — a kit of base primitives (Button, Card family, Badge, Separator,
Toggle/ToggleGroup, plus form primitives added as components need them) that all education
components compose from, styled through the real neutral design tokens in `@didact/theme`;
`docs/interface-norms.md` + `docs/visual-language.md` codifying the design norms (action hierarchy,
composition, spacing, focus, motion); and the Tailwind wiring (`@source`) that makes every
primitive utility actually generate.
**Exit criterion:** the primitives render faithfully in Storybook, and an education component
(`Flashcard`) composed from them looks right — no invented palette, no ad-hoc per-component
buttons.

## Phase 4 — First wave of components (core, high priority)

**Status: in progress.** `Flashcard` (RF-1) done, composed on `@didact/ui` with a reveal→rate
flow. `SpacedRepetitionDeck` (RF-2, SM-2) and quiz variants (RF-4) are being built next.

**Entry point:** phase 3.5 foundations + phase 2 priority.
**Deliverable:** the high-priority components from `design.md` §5, ordered by pedagogical evidence
(`Flashcard`, `SpacedRepetitionDeck`, quiz variants first; then matching/`Hint`/progress/etc.),
each with: implementation composing from `@didact/ui`, registry entry, Storybook story with its
states, behavior test, a11y check passing.
**Exit criterion:** every component in this wave meets RF-12–17 of `requirements.md` (core, not
adapter).

## Phase 5 (SkillNet adapter, optional) — Integration with the v2 generative catalog

**Lives in `repo/`, not in this project.** Does not block any core phase.

**Entry point:** phase 4 components classified as "fit for v2" in phase 2 (question 7).
**Deliverable:** `zod` schema + `defineComponent` in
`repo/apps/skillnet-web/src/components/courses/kit/`, mirror in
`repo/apps/skillnet-api/src/render/kit.py`, and verification that
`test_render_prompt_artifact.py` / `catalog-drift.test.ts` still pass with the expanded catalog.
**Exit criterion:** the expanded catalog does not introduce reactivity, does not reopen
`openui-adoption.md` §6, and the drift tests pass.

## Phase 6 — Second wave + registry publication

**Entry point:** phase 4 complete for the first wave (phase 5 is optional and does not block
this).
**Deliverable:** remaining medium/low priority components, a browsable documentation site for the
registry, first published version (hosting of `registry.json` / mechanism chosen in phase 2) so
that any project — not just SkillNet — can consume it.
**Exit criterion:** the `requirements.md` §4.1 inventory covered or explicitly dropped with a
reason (not simply forgotten); at least one consumer other than SkillNet (real or test) validates
that the copy mechanism works outside the original context.

## Phase 7 — Measurement and iteration

**Entry point:** components in real use in at least one consuming project (SkillNet or another).
**Deliverable:** reading usage signals — in SkillNet, via `node_render_views` or equivalent
telemetry if the component entered the v2 adapter; in general, feedback on which components get
copied/adopted more — to decide what to iterate on first.
**Exit criterion:** at least one iteration decision (prioritize, redesign, or retire a component)
made with usage data, not just intuition.

---

## Out of this roadmap

- Activating reactivity in SkillNet's generative catalog (`RENDER_ALLOW_REACTIVE`). Conditions
  already written in `openui-adoption.md` §6; this roadmap does not reopen them.
- Authoring real pedagogical content (question banks, curricula).
- Any SkillNet-specific visual design decision inside the core — that is exactly what the adapter
  exists to prevent (see `design.md` §0).
