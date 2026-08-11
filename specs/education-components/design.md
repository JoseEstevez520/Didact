# Design — Education Components Library

> Answers the **how**, starting from `requirements.md`. **Phase 2 status: closed.** Every section
> that was previously marked as awaiting the research phase is now resolved below, using the
> cited evidence from `specs/education-components/research.md` (Phase 1) and, where the product
> owner overrode a research recommendation, `research/decisions.md` (D1, D2). The decisions from
> `requirements.md` §0 (product owner) were already closed before Phase 1 and are not reopened
> here — this document only verified their technical viability and now records the result.
> Anything still genuinely open is written as an explicit **Phase 3 open item**, not left marked as
> undecided — `research.md` is honest about what it could not verify at the time (no executed
> React 19 smoke test, no live `shadcn diff` test against a third-party registry), and this
> document does not upgrade those into false certainties just to appear fully closed. **Update
> (2026-08-11): the React 19 smoke test has since been executed — see §2 for the result** (PASS);
> the `shadcn diff` gap in §3 is still open.

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
| Distribution model: registry + CLI that copies source code (Didact's copy-paste model), not a versioned npm dependency as the primary channel | `requirements.md` §0.2, RF-15 |
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
│    package: @didact/core                     │  Timeline, Rubric, MasteryBadge…
│    composes from @didact/ui (layers 1-2)     │
├─────────────────────────────────────────────┤
│ 2. Styled layer                               │  Tailwind + variants (cva or similar) over
│    (neutral theme, restyleable)              │  the primitives. A single place for theming.
├─────────────────────────────────────────────┤  Layers 1-2 both live in package: @didact/ui
│ 1. Accessible primitives                     │  (Button, Card family, ToggleGroup/Toggle,
│    (headless)                                │  Separator, Badge). Accessible behavior with
│                                               │  no styling of its own. Decided: Radix UI
└─────────────────────────────────────────────┘
```

This is Didact's own layered architecture (headless primitives + Tailwind + variant composition),
applied to educational vocabulary instead of generic UI. Layer 3 is where this project's real
value lives — layers 1 and 2 exist so we don't reinvent accessibility from scratch (see the cost
of doing it by hand in `openui-adoption.md` §1: 1500+ lines of tests to shield a custom parser).

**Updated (2026-08-11, Phase 3.5 "design foundations"): layers 1-2 are no longer only an abstract
diagram tier — they materialize as `@didact/ui`, a real, general-purpose primitive kit (Button,
Card family, ToggleGroup/Toggle, Separator, Badge), and layer 3 is concretely `@didact/core`,
which composes its education molecules from `@didact/ui` instead of each molecule styling its own
button/card ad hoc.** This is the same product-owner decision recorded in `requirements.md` §0.3,
which also revises that document's §2 line that previously put generic primitives out of scope.
Two packages, not one, because they have different audiences and change at different rates:
`@didact/ui` is general-purpose (any React project could use just the primitive kit, with no
pedagogical content at all) and stable once a primitive's variant/size set is set; `@didact/core`
is where the pedagogical vocabulary — and the actual churn — lives. Each primitive in `@didact/ui`
is a faithful port of a proven headless-primitives + Tailwind + `cva` reference kit (same
variant/size sets, same `data-slot`/`data-variant`/`data-size` contract, same `asChild`/Slot escape
hatch), with only the token source changed to `@didact/theme`'s `--didact-*` custom properties —
see `packages/ui/src/components/*.tsx` for the per-primitive porting notes and
`docs/interface-norms.md` for the composition norms this now makes possible by construction
(action hierarchy, card slot usage, spacing/sizing scale, focus/state treatment, motion strategy).

**Resolved (`requirements.md` §6.2, `research.md` Question 2): Radix UI is layer 1's default.**
Rationale: Radix is the most widely adopted headless primitives library, which maximizes reuse of
existing patterns and examples — the whole point of building layer 1 on a proven headless
foundation instead of a custom one (`requirements.md` §0.2).

- Base UI (`@base-ui/react`, MUI) already declares a clean `^17 || ^18 || ^19` peer range and comes
  from the team that migrated MUI to React 19. It is **not** chosen as the default now because it
  has less adoption/precedent than Radix, which underlies a large share of today's popular React
  component libraries — but it is the designated **watch item**: re-evaluate it in 3-6 months once
  it has more production usage. React Aria/Ariakit are not adopted as the default layer: React
  Aria shares Radix's peer-dep friction without Radix's wider ecosystem precedent, and Ariakit
  lacks that same precedent.
- **Smoke test executed (2026-08-11, throwaway Vite app outside this workspace, not committed):
  PASS.** A minimal Vite + React 19 app installed `@radix-ui/react-dialog` and rendered a
  controlled `Dialog.Root`/`Trigger`/`Portal`/`Content`/`Close`, exercising exactly what was
  flagged as unverified — focus management, the Portal, and open/close state. Both a `vite build`
  and a jsdom/vitest + Testing Library test (mount, open via trigger click asserting the portaled
  content appears with zero `console.error` calls, and close via the close button) passed cleanly.
  Versions actually installed: **React 19.2.0**, **`@radix-ui/react-dialog` 1.1.23** (npm's
  `latest` at test time), Vite 6.4.3, Vitest 2.1.9.
  - **The previously-documented `--legacy-peer-deps` friction did NOT reproduce**: a plain
    `npm install` (no flags) resolved and installed cleanly, with zero `ERESOLVE`/peer warnings
    (`npm ls` confirms `react@19.2.0` deduped throughout the Radix dependency tree). Inspecting the
    installed package directly shows why: `@radix-ui/react-dialog@1.1.23`'s own
    `peerDependencies.react` is now `"^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"` — Radix has
    since added a clean, non-RC `^19.0` range to its `1.1.x` line (not only via the `1.2.0` RC that
    `research.md` Q2 pointed to), so the friction that motivated documenting
    `--legacy-peer-deps`/`--force` as a consumer-facing caveat is resolved upstream as of this
    version. **Caveat kept, not deleted, because it can still apply**: consumers pinned to an older
    Radix version, or installing a different Radix package that hasn't yet picked up the same
    peer-range fix, may still hit the original RC-only peer range — so the mitigation
    (`--legacy-peer-deps`/`--force` on npm, or pnpm/yarn's laxer peer enforcement) stays documented
    as a fallback, just no longer presented as something every consumer will necessarily hit.
  - Full method, package.json, and test file live (temporarily, gitignored/throwaway) at
    `C:\Users\sonde\AppData\Local\Temp\didact-radix-smoke` for anyone who wants to reproduce it;
    it is intentionally not committed to this repo.
- RNF-5 applies regardless of the outcome: Radix is pinned to an exact version with a drift test,
  since the copy-paste distribution model protects the copied components, not this kind of
  external behavioral dependency (`design.md` §9).

## 3. Distribution model: Didact's registry

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

**Resolved (`requirements.md` §6.1, `research.md` Question 1): adopt shadcn/ui's official CLI and
schema as the primary distribution mechanism.** The mechanism is documented as a first-class,
recent product (CLI 3.0 Aug-2025, CLI v4 Mar-2026), explicitly designed for third-party registries
(`registry.json`/`registry-item.json`, static-JSON or GitHub hosting, namespace-based installation,
header/env-var auth) — not a community hack. The risk previously flagged in §9 ("the third-party
mechanism doesn't support what we need") **is not confirmed**; building a custom CLI stays a
theoretical plan B, not committed work. Two real gaps stay open and are tracked, not hidden:

- **No native `version` field** in `registry-item.json` — there is no built-in way to version the
  same component across releases. **Decision: define our own versioning convention** (e.g. an
  explicit `version` key inside each entry's own metadata, or versioned route paths such as
  `/r/flashcard/1.0.0.json`) rather than waiting for shadcn to add one.
- **`shadcn diff` against third-party namespaced registries is NOT verified** in the official docs
  (only confirmed for the official registry). **Decision: treat this as unverified, not as
  working.** Phase 3 must empirically test `shadcn diff`/`shadcn add --overwrite` against a real
  test registry before documenting it as the update mechanism consumers can rely on.

**Resolved (`requirements.md` §6.3, product decision D1 in `research/decisions.md`): Tailwind IS
the styling layer.** `research.md` Question 3 recommends, with cited evidence, **not** requiring
Tailwind as a core peer dependency — the registry format itself doesn't need it (`cssVars`/`css`
in `registry-item.json`, `tailwind` deprecated in favor of `cssVars.theme`; precedents like
`shadcn-css` prove the layer pattern works without Tailwind). That research finding is not being
reworded or walked back here. **What changes it is a product decision made after Phase 1**: per
`research/decisions.md` D1, Jose chose to adopt Tailwind v4 anyway, for visual consistency and
alignment with Didact's own visual-language reference (`requirements.md` §0.2, see
`docs/visual-language.md`), independently of what the distribution mechanism strictly requires.
Concretely for this design:

- Layer 2 ("Styled layer" in §2's diagram) is **Tailwind v4 + `class-variance-authority`** applied
  over the neutral tokens exposed by `@didact/theme` (a new package; see D1's scaffold changes).
- The tokens themselves still live as **plain CSS custom properties** at the base of
  `@didact/theme` (RF-16) — a consumer with no Tailwind in their project can still restyle a
  copied component by overriding those variables. Tailwind is an additional utility layer written
  on top of the same variables, not a replacement for the token-based restyling mechanism RF-16
  requires. This keeps the "any project" goal from §0.1 alive even though Tailwind is now the
  default authoring layer.
- Pinned per RNF-5 (scaffold, not yet installed): `tailwindcss` 4.1.11, `@tailwindcss/postcss`
  4.1.11, `postcss` 8.4.49, `class-variance-authority` 0.7.1 — these versions are a reasonable
  reference as of D1's date, **not verified live against `registry.npmjs.org`** the way
  `research.md` verified the primitives layer; confirm the actual stable versions before installing
  in Phase 4.

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

## 5. Inventory of candidate components (core — final priority, no longer draft)

**Sort key: pedagogical evidence strength first** (`packages/validators/pedagogy/evidence.json`,
derived from `research.md` §9.1 — Dunlosky et al. 2013, Wisniewski/Zierer/Hattie 2019), **then
utility + SkillNet-adapter precedent** (`research.md` Question 7) as a tiebreaker among components
the pedagogy sources don't independently rate. This ordering is the ROADMAP Phase 2 exit
criterion: it must be defensible from cited evidence, not intuition — every row below traces to a
source. Scope stays broad per product decision D2 (`research/decisions.md`): nothing is dropped,
the advanced/graphical/code families enter as later waves instead.

| Wave | Component | Requirement | Pedagogical evidence (`evidence.json`) | Expressible without reactivity for the SkillNet adapter? (`research.md` Q7 — final verdict) |
|---|---|---|---|---|
| **1** | `Flashcard` | RF-1 | Not independently rated; it is the substrate `SpacedRepetitionDeck` operates on, so it ships alongside RF-2's high-evidence technique | **FIT** — flip/mark-as-known is ephemeral React state, no `answer_key` to protect (`QuizItemBlock` precedent) |
| **1** | `SpacedRepetitionDeck` | RF-2 | **High** — distributed practice is one of only 2 of Dunlosky et al.'s 10 techniques rated high-utility | **NOT FIT** — cross-session persistence needs `Query`/`Mutation`, forbidden while `RENDER_ALLOW_REACTIVE=False`. Core priority is unaffected by this: adapter fitness is not a core-priority criterion (see note below the table) |
| **1** | Quiz variants (multi-answer, T/F, blank, short open) | RF-4 | **High** — practice testing is the other Dunlosky high-utility technique; see the informative-feedback note below | **FIT** — `QuizItem` already covers 6 `item_type`s without leaking `correct`/`explanation` (rule 5, `spec.py`) |
| **2** | `Timeline` / `Steps` | RF-8 | Not rated by the pedagogy sources | **FIT** — 1:1 precedent, already exists in production as `StepSequence` (`schemas.ts:103-106`) |
| **2** | `MatchingExercise` / `SortExercise` / `CategorizeExercise` | RF-3 | Not rated by the pedagogy sources | **FIT (confirmed)** — `DragOrder` precedent; also the component WCAG 2.2 §2.5.7 (dragging movements, AA) binds most directly, so it carries accessibility/legal weight beyond pure utility (`research.md` §9.4) |
| **2** | `Glossary` / `Term` | RF-5 | **Low** as passive lookup — Dunlosky et al., by analogy with rereading/highlighting (both low-utility). Must be redesigned to force active recall, not stay a pure lookup, to earn a higher place later | **FIT** — pure presentation, no answer to protect |
| **2** | Progress/mastery indicators | RF-7 | Not rated by the pedagogy sources | **FIT** — static snapshot prop, same pattern as `Chart` (`schemas.ts:118-123`) |
| **2** | `Rubric` / self-assessment | RF-10 | Not rated by the pedagogy sources | **FIT** — no automatic grading means no `answer_key` (rule 5 doesn't apply), ephemeral selection state |
| **2** | `Hint` / `Reveal` | RF-6 | Not rated by the pedagogy sources; carries the informative-feedback recommendation (see note below) | **FIT WITH STRUCTURAL TENSION** — the toggle is ordinary React state, but the canonical re-serialization ships the whole `ui_spec` at once, so it must delegate to `QuizItem`'s self-contained POST rather than ever carry a real exam answer as a prop. Registered last within wave 2, per `research.md` Q7's explicit recommendation, until that boundary is documented |
| **3** | Video checkpoint | RF-9 | Not rated by the pedagogy sources | **FIT IN PRINCIPLE / BLOCKED BY INFRASTRUCTURE** — reactivity is not the obstacle, the absence of any video player in `skillnet-web` is (`research.md` Q8); source type (self-hosted vs. YouTube/Vimeo) must be decided before the component itself can be designed |
| **4 (advanced wave)** | Code exercise | RF-11 | Not rated by the pedagogy sources | **NOT FIT** — checking requires execution/network (≈`Mutation`), outside the `assertStaticOnly` model; Sandpack (Apache-2.0) solves execution, not checking, and does not change this verdict (`research.md` §9.3) |
| **4 (advanced wave)** | Graphical/image-based interactions (hotspot, hot-text, graphic-order, graphic-associate, graphic-gap-match, position-object, select-point, drawing) | none yet — `packages/validators/pedagogy/qti-mapping.json` `plannedGaps` | Not rated by the pedagogy sources | Not assessed — no RF exists yet to classify; per product decision D2 these are **planned**, not dropped (`research.md` §9.2) |
| **4 (advanced wave)** | Numeric/slider response | none yet — `qti-mapping.json` `plannedGaps` | Not rated by the pedagogy sources | Not assessed, same status as the graphical family above |

Totals from `research.md` Question 7 (11 originally-scoped RF components): **8 FIT** (Flashcard,
Matching/Sort/Categorize, Quiz, Glossary, Progress/mastery, Rubric, Hint/Reveal, Timeline), **1
fit-but-blocked** (Video checkpoint), **2 not fit** (SpacedRepetitionDeck, Code exercise).

The "expressible without reactivity" column is specific to the SkillNet adapter; for the core,
priority (the **Wave** column) is based on pedagogical evidence first and general usefulness
second (`requirements.md` §4.1), never on adapter fitness — that is precisely why
`SpacedRepetitionDeck` sits in Wave 1 despite being "not fit" for the adapter today.

**Informative-feedback slot (optional but recommended) — applies to RF-4 and RF-6.** Wisniewski,
Zierer & Hattie 2019 (435 studies, `research.md` §9.1) found informative feedback (why an answer
is right/wrong, what strategy to use next) at d=0.99, versus d=0.24 for plain
reinforcement/praise/points. Quiz variants (RF-4) and `Hint`/`Reveal` (RF-6) should each expose an
**optional slot** for this kind of feedback beyond a bare correct/incorrect state — recommended,
not a hard requirement, so components that only need a visual correct/incorrect state remain
valid.

Beyond this inventory, `evidence.json` also lists `SelfExplanation`, `ConceptMap` (Fiorella &
Mayer 2016) and a branching-scenario component backed by Ink/inkjs (`research.md` §9.3, moderate
evidence per Sitzmann 2011) as **v2 candidates with no assigned RF today** — not part of any wave
above, explicitly not to be implemented until `requirements.md` is revisited.

## 6. Theming (core)

No palette or spacing scale of its own imposed on consumers. The core defines **its own neutral
default theme** (so it can be shown in the registry/Storybook without depending on any consumer)
exposed via CSS custom properties, and any project — SkillNet included — overrides it with its
own. SkillNet, as an adapter, maps `design-system.md` onto those variables (RF-18); this is no
different from how any project adopts a component library's theme.

**Resolved (`requirements.md` §6): the components follow Didact's own neutral visual language.**
This is a distinct decision from the styling *mechanism* (§3: Tailwind + `cva`) — it's about
spacing scale, radii, typography, focus-ring treatment, subtle/no shadows, and a neutral OKLCH
palette (see `docs/visual-language.md` for the full specification). `@didact/theme`'s neutral
default (D1, `research/decisions.md`) implements that visual language as its out-of-the-box look,
while remaining fully restyleable via the CSS custom properties RF-16 requires — a consumer is
free to discard the default look entirely by overriding the tokens. **The token values were
calibrated during Phase 3/4** (spacing values, exact radii, focus-ring color/width, shadow tokens)
against a well-established neutral design reference, verified rather than approximated from
memory — the same "verify, don't assume" standard `research.md` applied to the technical
questions.

## 7. Project location — **decided**

Independent repo (where it lives today, `Anfaia/library`), published as its own registry,
consumed via CLI from any project — not as a package inside `repo/packages/`.

This is no longer an open decision: it follows directly from `requirements.md` §0.1 ("must be
usable in any project") and §0.2 (a registry-based distribution model, which is intrinsically
multi-project: a registry makes no sense if only one repo consumes it). SkillNet consumes this
library just like it would consume any third-party component registry: by copying components,
without publishing or depending on an npm version.

The **exact mechanism** (`requirements.md` §6.1) is resolved in §3 above: shadcn's official CLI
and schema, with a custom versioning convention and `shadcn diff` still to be empirically verified
in Phase 3 — that residual verification does not reopen the general shape decided here.

## 8. Quality and tooling (core)

- **Storybook** (or equivalent): one story per component and per relevant state (empty, error,
  correct/incorrect, loading). A11y addon in CI.
- **Tests**: behavior (Testing Library or equivalent), not just snapshots.
- **Registry as living documentation**: each registry entry must be enough to understand what the
  CLI copies without reading the source code first.
- **Drift test** (only in the SkillNet adapter, for components entering the v2 catalog): same
  pattern as `catalog-drift.test.ts` in `repo/`.

## 9. Risks

- **The chosen CLI's third-party registry mechanism doesn't support what we need** (§6.1) — `research.md`
  Q1 found this **not confirmed**: the mechanism is explicitly built for third-party registries.
  Residual risk downgraded to two narrower, tracked items: no native `version` field (mitigated
  with our own versioning convention, §3) and `shadcn diff` against third-party registries being
  unverified (mitigate by empirically testing it in Phase 3 before relying on it; keep a minimal
  own CLI/registry as a theoretical plan B only if that test fails).
- **Choosing a base dependency (layer 1) that breaks like `@openuidev` 0.2.x** — Radix UI is now
  the decided default (§2); mitigate with an exact version + drift test (RNF-5). The copy-paste
  model protects the *components*, not their internal behavioral dependencies (e.g. Radix is still
  a real dependency if it isn't also copied). Watch Base UI as a cleaner alternative in 3-6 months.
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
