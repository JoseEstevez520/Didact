# Research — Education Components Library (Phase 1)

> Deliverable of the **Phase 1 (deep research)** of `ROADMAP.md`. Answers, with cited evidence,
> the 8 open questions from `requirements.md` §6 and feeds the `[PENDING]` sections of
> `design.md`. It does NOT decide architecture (that is Phase 2) — it gathers evidence and issues
> an explicit recommendation per question.
>
> **Honesty standard (inherited from `openui-adoption.md` §1):** where the evidence is not
> conclusive, this is stated explicitly ("not verified" / "it's unclear, and here is what would
> need to be measured"). A made-up answer is not valid; a well-grounded "I don't know" is.
>
> Research date: 2026-08-11. npm package versions were checked live against
> `registry.npmjs.org` on that date, not from memory.
>
> **Method:** research delegated to 4 agents in parallel (A: questions 1-3, technical stack;
> B: questions 4-6, pedagogy/standards; C: questions 7-8, SkillNet adapter, by reading `repo/`;
> D: supplementary batch of sources provided by the product owner). This document consolidates
> them.

---

## Executive summary — recommendations per question

| # | Question | Recommendation (summary) | Confidence |
|---|---|---|---|
| 1 | shadcn third-party registry | **Adopt shadcn's official CLI/schema as the primary mechanism**; do not build a custom CLI (only a theoretical plan B) | High (official docs) |
| 2 | Primitives base + React 19 | **Radix UI by default** (alignment with shadcn), documenting the React 19 peer-dep friction; **watch Base UI** as an alternative | Medium (changelog + peer-deps, no own smoke test) |
| 3 | Is Tailwind mandatory? | **Do not require Tailwind in the core**; base = CSS custom properties/plain classes (`cssVars`), Tailwind as an optional variant | High |
| 4 | Spaced repetition | **SM-2 by default** (~50 lines, zero deps) behind an agnostic interface; FSRS as an advanced mode — **with a third option**: `ts-fsrs` as a pinned dependency (RNF-5) | High (algorithm), Medium (choice) |
| 5 | A11y and neurodiversity | **Full WCAG 2.2 AA** as the minimum contract, tracing each pattern to a source (WCAG/COGA/BDA); evidence gap for specific conditions flagged | High (WCAG), Medium (neuro-specific) |
| 6 | E-learning standards | **QTI 3.0 vocabulary as a naming reference** + H5P as a validation checklist; do not implement QTI/LTI/SCORM/xAPI in the core | High |
| 7 | Non-reactive components (adapter) | **8 of 11 FIT**, 1 fit-but-blocked (video), 2 not fit (SpacedRepetition, code) | High (code evidence) |
| 8 | Video player (adapter) | **Does not exist today in `skillnet-web`**; evaluate from scratch, start with native `<video>` + `<track>` | High (exhaustive search) |

**Findings beyond the 8 questions (see §9):** the spec today does not cover (a) a **pedagogical
evidence** dimension that reorders the inventory's priority, (b) an entire **family of graphical/
image-based interactions** that QTI does have and §4.1 does not, (c) an **informative feedback**
requirement, and (d) the **legal** angle of accessibility (EN 301 549 / European Accessibility
Act) that turns RF-12–17 into a sales requirement, not an aspirational one.

---

## Question 1 — Is shadcn/ui's third-party registry mechanism real and mature?

### Evidence

The mechanism exists, is documented as a first-class product, and is recent (CLI 3.0 Aug-2025,
CLI v4 Mar-2026), not a community hack:

- The registry "works with any kind of project and framework, not limited to React" —
  https://ui.shadcn.com/docs/registry
- Dedicated guide to building your **own** registry (not the official one) —
  https://ui.shadcn.com/docs/registry/getting-started
- `registry.json` root schema (`$schema`, `name`, `homepage`, `items`/`include`) —
  https://ui.shadcn.com/docs/registry/registry-json
- `registry-item.json` item schema (`name`, `type`, `files`, `dependencies`,
  `registryDependencies`, `cssVars`, `css`, `envVars`, …; `tailwind` marked **deprecated** in
  favor of `cssVars.theme`) — https://ui.shadcn.com/docs/registry/registry-item-json
- **Hosting:** static JSON (`shadcn build` → `public/r/*.json`) servable from any HTTP server, or
  a GitHub repo with `registry.json` at the root.
- **Installation:** via direct URL (`shadcn add https://.../flashcard.json`) or via a **namespace**
  configured in `components.json` (`@anfaia/flashcard`). Decentralized namespace model, no central
  authority — https://ui.shadcn.com/docs/registry/namespace
- Native **authentication** via HTTP headers + env vars (Bearer token, API key). No OAuth/OIDC or
  automatic discovery — https://ui.shadcn.com/docs/registry/authentication

**Real gaps verified:**
- **There is no `version` field** in `registry-item.json` — there is no native versioning for the
  same component; versioning is the responsibility of how the registry organizes its routes.
- **`shadcn diff` against third-party registries: NOT verified.** The docs (CLI v4 changelog)
  document it for the official registry, they do not explicitly confirm it works with third-party
  namespaced registries — https://ui.shadcn.com/docs/changelog/2026-03-cli-v4

### Recommendation

**Adopt shadcn's official CLI and schema as the primary distribution mechanism.** The risk flagged
in `design.md` §9 ("the third-party mechanism doesn't support what we need") **is not confirmed**
— it is explicitly designed for this use case. Building a custom CLI stays as a theoretical plan
B, not as work to be done. Keep as an active risk (not a blocker): design a custom versioning
convention from the start, and empirically test `shadcn diff` against a test registry before
documenting it as the update mechanism.

---

## Question 2 — Which base of accessible primitives suits React 19?

### Evidence

Methodology: `peerDependencies.react` **published today on npm** for the `latest` version of each
library (what actually determines whether `npm install` works without flags), plus changelogs.

| Library | Package | `latest` today | `peerDependencies.react` |
|---|---|---|---|
| Radix UI | `@radix-ui/react-dialog` | 1.1.23 | `…^18.0.0 \|\| ^19.0.0-rc.1` (restricted to RC) |
| React Aria | `react-aria-components` | 1.20.0 | identical (restricted to RC) |
| Ariakit | `@ariakit/react` | 0.4.37 | `^17 \|\| ^18 \|\| ^19` (clean) |
| Base UI | `@base-ui/react` (MUI) | 1.7.0 | `^17 \|\| ^18 \|\| ^19` (clean) |

- Radix and React Aria stable **today** declare their React 19 peer pinned to `19.0.0-rc.1`, not
  `^19.0.0` — with `npm` (not pnpm/yarn) this requires `--legacy-peer-deps`/`--force`. Confirmed by
  **shadcn's own docs** — https://ui.shadcn.com/docs/react-19 — and community issues
  (`radix-ui/primitives#2909`). Radix already has the fix in a v1.2.0 **in RC** (not promoted to
  `latest` yet as of 2026-08-11), so the problem is still present today.
- Radix confirmed "Full React 19 compatibility" (PR #2952) and keeps fixing React-19-specific bugs
  as recently as Jul-2026 — https://www.radix-ui.com/primitives/docs/overview/releases
- React Aria resolved its React 19 compat (2025-05-19 release). The claim that "they will never
  raise the minimum to React 19" comes from third-party aggregation, **without a direct textual
  citation — marked not 100% confirmed**.
- Base UI (`@base-ui/react`, MUI): stable (not RC), clean peer-deps; same team that already
  migrated MUI to React 19 — https://mui.com/blog/react-19-update/

**Not verified:** no real React 19 project was run with each candidate (changelog + peer-dep
evidence, not an own smoke test). **Before fixing layer 1 in `design.md`, run a smoke test**
(focus/portal/dialog) on stable React 19 with each finalist.

### Recommendation

**Radix UI as the default layer 1**, for alignment with shadcn/ui (maximum reuse of patterns/
examples) — the peer-dep problem is an installation issue, not a functional one, and is solved
with `--legacy-peer-deps` (which shadcn already documents) or pnpm/yarn. **Explicitly document
that friction** in `design.md` as part of the contract with the consumer. **Watch Base UI** as a
cleaner alternative in 3-6 months (once it has more adoption). Avoid React Aria except for a
specific primitive Radix doesn't cover, since it shares the friction without the alignment
advantage. RNF-5 requires pinning an exact version + drift test regardless.

---

## Question 3 — Is Tailwind a mandatory peer dependency?

### Evidence

- **shadcn/ui itself does require Tailwind**, with no official alternative path; it's a recurring
  unresolved request (`shadcn-ui/ui#2832`). It supports Tailwind v4 (`@theme`, OKLCH) —
  https://ui.shadcn.com/docs/tailwind-v4 — which shows that **even within shadcn, Tailwind is not
  a frozen version** (it already migrated v3→v4).
- **But the distribution mechanism does NOT force Tailwind.** The `registry-item.json` schema
  offers `cssVars` (plain, agnostic CSS variables) and `css` (arbitrary rules); `tailwind` is
  **deprecated** in favor of `cssVars.theme` —
  https://ui.shadcn.com/docs/registry/registry-item-json. Tailwind's mandatory status in shadcn/ui
  comes from how they wrote their components, not from the registry format.
- **Proven precedent without Tailwind:** `shadcn-css` (community repo) rewrites the pattern with
  **CSS Modules**; there is also a UnoCSS preset. The layer pattern (headless + style + copy-paste)
  does not intrinsically depend on Tailwind.

### Recommendation

**Do not require Tailwind as a core peer dependency.** It would be incompatible with the §0.1 goal
("any React project") to force a CSS framework that also changes major versions with non-trivial
migrations. Suggested design for `design.md`'s layer 2 ("Styled layer"): **CSS custom
properties + plain classes (or CSS Modules) as the mandatory base** (which is exactly what RF-16
already asks for via tokens), and **an optional Tailwind variant** (namespaced registry or flag)
for those who already use it — SkillNet included. Open point for Phase 3 (non-blocking): verify
whether `cva` works the same generating CSS Modules classes as Tailwind.

---

## Question 4 — Spaced repetition: algorithm and agnostic API

### Evidence

| Algorithm | State/card | TS lines (scheduler) | External dep. | Quality |
|---|---|---|---|---|
| Leitner | 1 integer (box) | <20 | None | Low, robust, transparent |
| **SM-2** | `n`, `EF`, `I` | 40-60 | None | Medium, 35+ years in production |
| FSRS (scheduler, default weights) | `S`, `D`, reps, lapses, dates | 100-250 | None* | High (beats SM-2 in the project's own benchmarks) |

- **SM-2**: exact formulas verified (initial EF 2.5, floor 1.3; `q≥3` success, `q<3` resets) —
  https://www.supermemo.com/en/archives1990-2015/english/ol/sm2 ,
  https://en.wikipedia.org/wiki/SM-2_(algorithm) . Pure arithmetic, ~50 lines, zero deps.
- **FSRS**: DSR model (Difficulty/Stability/Retrievability), 19 weights (v4.5/v6), Anki's default
  since 2023. The *scheduler* with default weights is tractable (~100-200 lines); the *optimizer*
  (retraining weights with ML) is expensive and **avoidable** for an MVP —
  https://github.com/open-spaced-repetition/fsrs4anki ,
  https://borretti.me/article/implementing-fsrs-in-100-lines
- `*ts-fsrs` (MIT, native TS, no heavy runtime deps) implements the full scheduler; **it doesn't
  persist anything** (persistence is the consumer's job — exactly RF-2's contract) —
  https://github.com/open-spaced-repetition/ts-fsrs
- **Nuance from batch D:** `ts-fsrs` is a **multi-module package published on npm**, not a trivial
  file to copy. This opens up a **third option** between "homemade SM-2" and "copying FSRS by
  hand": adopting it as an **external dependency pinned to an exact version + drift test** (RNF-5
  pattern, same as Radix). Bundle size not measured (bundlephobia not checked).

**Proposed agnostic API** (derived from how `ts-fsrs` already solves this):

```ts
type ReviewState = Record<string, unknown>; // opaque: SM2State | FSRSState | LeitnerState
type ReviewGrade = "again" | "hard" | "good" | "easy";
interface ReviewResult { state: ReviewState; dueAt: Date; }
interface SpacedRepetitionScheduler {
  createInitialState(): ReviewState;
  schedule(state: ReviewState, grade: ReviewGrade, now?: Date): ReviewResult; // pure, no side effects
  preview?(state: ReviewState, now?: Date): Record<ReviewGrade, ReviewResult>;
}
```

The `SpacedRepetitionDeck` (RF-2) is a layer on top that decides which card to show based on
`dueAt` and delegates to the scheduler; it doesn't persist either (it returns the new array, the
consumer decides where it lives). The algorithm is swappable behind the interface.

### Recommendation

**SM-2 as the default algorithm** (minimum cost, zero deps, 35+ years of evidence) behind the
agnostic interface above. **FSRS as an "advanced mode"** — and here, rather than closing it off,
keep two paths open: (a) reimplement only the FSRS scheduler with default weights, or (b) adopt
`ts-fsrs` as a pinned dependency (RNF-5) accepting its maintenance cost in exchange for better
evidence. **Do not use Leitner as the main option** (too crude); reserve it as an optional "simple
mode." What's non-negotiable: always expose the agnostic interface so switching algorithms doesn't
break consumers.

---

## Question 5 — Accessibility and neurodiversity: patterns with real evidence

> Each pattern marks its evidence category: **normative** (WCAG, with A/AA/AAA level),
> **research-informed/consensus** (COGA, CAST/UDL), or **practical style guide** (BDA). All three
> are real evidence but of different evidentiary weight.

### 5.1 WCAG 2.2 (normative — the strongest evidence) — https://www.w3.org/TR/WCAG22/

| Criterion | Level | Translation into a requirement |
|---|---|---|
| 2.3.1 Three Flashes | A | No feedback animation may flash more than 3×/s |
| 2.3.3 Animation from Interactions | AAA (treat as baseline) | Every micro-animation (flip, transition, confetti) respects `prefers-reduced-motion` (RF-13) + an explicit toggle |
| 2.2.1 Timing Adjustable | A | Every exercise timer must be disableable/extendable → direct grounding for RF-14 |
| 2.2.2 Pause, Stop, Hide | A | Content moving for >5s needs a pause control |
| 2.4.7 Focus Visible | AA | `:focus-visible` with contrast on every control; never `outline:none` without a substitute |
| 2.4.11 Focus Not Obscured | AA (new in 2.2) | `Glossary` popovers cannot cover the focused element |
| 1.4.3 Contrast (Minimum) | AA | Neutral theme (RF-16) fixes tokens at ≥4.5:1 by default |
| 1.4.11 Non-text Contrast | AA | Borders, status icons, progress bars ≥3:1 |
| **2.5.7 Dragging Movements** | **AA** | See §9.4 — affects RF-3; keyboard ≠ "single pointer without dragging" |

### 5.2 CAST/UDL 3.0 (research framework, not a checklist) — https://udlguidelines.cast.org/

A neuroscience framework built on 3 networks (affective/recognition/strategic).
**Representation** → concepts in more than one format (`Glossary`, `Hint`, open answer).
**Action & Expression** → RF-3 must offer an alternative to mouse dragging. **Engagement** →
RF-6/RF-7 give the learner control over pace and difficulty.

### 5.3 British Dyslexia Association (practical style guide, institutional backing, no
point-by-point cited trials) — BDA Style Guide 2023

Sans-serif by default, relative adjustable size (never fixed `px`); ≤60-70 chars/line, not
justified; bold for emphasis (not italics/underline — reinforces RF-12 "not color alone"); avoid
pure green/red for success/error (always + icon/text); bullet/step structure (fits RF-8/RF-10).

### 5.4 W3C WAI-COGA (guidance supplementary to WCAG, working-group consensus with user research)
— https://www.w3.org/TR/coga-usable/

Covers ADHD/autism/dyslexia/dyscalculia. Patterns with an explicit target: "Avoid Data Loss and
Timeouts" (§4.5.9, reinforces RF-14); "Let Users Control When Content Moves" (§4.9.1, ADHD →
video/carousel autoplay only via user action); "Use White Spacing"/"Avoid Too Much Content"
(§4.4.10/§4.6.3 → max ~5-7 visible options without grouping); "Use a Consistent Visual Design"
(§4.2.3 → same layout across `QuizItem` variants).

### 5.5 What does NOT have solid, condition-specific evidence (stated explicitly)

No guide with the BDA's level of specificity dedicated separately to **ADHD** or **autism** was
found: COGA treats them under the cognitive umbrella with shared patterns, not with condition-
specific typographic rules. **It is not clear** that font/size rules specific to ADHD/autism exist
with the same backing as dyslexia's; what would be needed are controlled studies that isolate each
condition — none found in this search. The effectiveness of commercial "dyslexia" fonts
(OpenDyslexic) is contested; the BDA does not require them, so nothing is claimed about them.

### Recommendation

Non-negotiable minimum contract for the core (concretizes RF-12/13/14 with source traceability):
1. Full WCAG 2.2 **AA** + treat 2.3.3 (AAA) as mandatory (already in RF-13).
2. No timer without the ability to disable/extend it (WCAG 2.2.1 + COGA §4.5.9).
3. No animation/autoplay without a user action; all respect `prefers-reduced-motion`
   (WCAG 2.3.3 + COGA §4.9.1).
4. Default density limit (~5-7 ungrouped options) (COGA §4.4.10/§4.6.3).
5. Neutral sans-serif theme, adjustable relative font size, no pure red/green for status, no
   italics/underline as the sole emphasis (BDA + WCAG 1.4.1).

Document in Storybook, per component, **which specific criterion it meets** (not a generic "it's
accessible"), because `design.md` §9 flags the risk of "well-intentioned accessibility without
evidence." See §9.4 for the legal angle (EN 301 549) that makes this a sales requirement.

---

## Question 6 — E-learning standards/libraries: vocabulary and interoperability

### Evidence per standard

- **IMS QTI 3.0** (1EdTech): a question/test data model with the **richest interaction
  vocabulary, directly comparable to §4.1** — `choice`, `order`, `match`/`associate`, `gapMatch`,
  `textEntry`/`extendedText`, `inlineChoice`, etc. (full enumeration of the 21 interactions in
  §9.2). 20+ years of use. Real interoperability via XML binding for exchanging question banks —
  https://www.imsglobal.org/spec/qti/v3p0/oview
- **H5P**: 50+ embeddable content types; a 1:1 equivalent of nearly all of RF-1..RF-9
  (Flashcards, Drag and Drop, Fill in the Blanks, Multiple Choice, Essay, Timeline, Interactive
  Video…). Its de facto interoperability depends on LTI —
  https://h5p.org/content-types-and-applications
- **Open edX XBlocks**: an architectural pattern (state + view + action) coupled to the platform;
  contributes no exercise vocabulary nor cross-platform interoperability —
  https://docs.openedx.org/projects/xblock/en/latest/index.html
- **LTI 1.3**: launches external tools inside an LMS; **no exercise vocabulary at all**. Relevant
  only if a consumer needed to embed itself in a third-party LMS —
  https://www.1edtech.org/standards/lti
- **xAPI**: `actor-verb-object` statements to an LRS; an **event** vocabulary (10 closed
  interaction types, see §9.2), not a question vocabulary. Useful as naming inspiration for
  callbacks (`onAttempted`, `onMastered`) — https://github.com/adlnet/xAPI-Spec
- **SCORM**: packaging + completion tracking, no exercise vocabulary. Legacy, out of the core's
  scope — https://scorm.com/scorm-explained/technical-scorm/run-time/

### Recommendation

1. **Adopt QTI 3.0's interaction naming vocabulary** as the reference for naming RF-3/RF-4 (the
   standard with the finest granularity and longest track record).
2. **H5P as a cross-validation checklist** for §4.1 (a proven large-scale precedent); not as a
   dependency or exchange format.
3. **Do not implement LTI/SCORM/QTI's XML binding in the core** (these are LMS integrations, and
   the core does not manage a backend — `requirements.md` §2). If a consumer ever needed it: LTI
   1.3 + xAPI, outside the core.
4. **xAPI verb vocabulary only as naming inspiration for callbacks.**
5. **Discard XBlocks and SCORM as a vocabulary source** (XBlock's state/view/action pattern may
   inspire the internal structure of stateful components — a design note).

---

## Question 7 — Which §4.1 inventory components are expressible without reactivity? (SkillNet adapter)

> **Key methodological note:** `openui-adoption.md` cites "the 7 rules in §5.2" but **does not
> enumerate them**; §5.2 belongs to `docs/design/v2-dynamic-courses.md`, and the authoritative,
> executable enumeration lives in the docstring of
> `repo/apps/skillnet-api/src/render/spec.py:1-26` (which `test_render_kit.py` /
> `test_render_prompt_artifact.py` run against). That is used as the primary source. Rule 5
> (critical): `QuizItem` never carries the correct answer or explanation — that lives in
> `answer_key` and never travels in the `ui_spec` (`ANSWER_KEY_KEYS`, `spec.py:75-87`). Also
> binding: zero `Mutation`/`Query`/`$state`, no `useTriggerAction()`; today
> `RENDER_ALLOW_REACTIVE = False`.
>
> **Key pattern:** a block can have **plain React state** (`useState`/`useEffect`) without
> violating "no reactivity" — the prohibition is on the OpenUI dialect layer, not on ordinary
> React. Precedent: `QuizItemBlock` is self-contained with its own state and its own POST
> (`QuizItemRenderer.tsx:16-19`). **The real catalog has 14 blocks today, not 10** as
> `design.md` §5's draft assumes (`schemas.ts:167-182`).

| Component (RF) | Verdict | Reason |
|---|---|---|
| **Flashcard** (RF-1) | **FIT** | Flip/mark-as-known = ephemeral React state; no `answer_key` to protect. Precedent: `QuizItemBlock`. |
| **SpacedRepetitionDeck** (RF-2) | **NOT FIT** | Persisting state across sessions requires `Query`/`Mutation`, forbidden today (`RENDER_ALLOW_REACTIVE=False`). Matches §2 "out of scope." |
| **Matching/Sort/Categorize** (RF-3) | **FIT** | Production precedent: `DragOrder` (`schemas.ts:150-154`) uses literal props + internal React, no `Mutation`. The draft said "to confirm" → **confirmed FIT**. |
| **Quiz variants** (RF-4) | **FIT** | `QuizItem` already covers 6 `item_type`s without `correct`/`explanation` in props (rule 5). Open-answer verification runs server-side via a self-contained POST. |
| **Glossary/Term** (RF-5) | **FIT** | Pure presentation; no answer to protect, no dynamic data. |
| **Hint/Reveal** (RF-6) | **FIT with structural tension** | Toggle = React state. BUT the "canonical re-serialization served all at once" means the whole `ui_spec` (including hidden content) arrives at once: safe for a pedagogical hint, **it conflicts with rule 5 if it wraps an exam answer** — in that case it must delegate to `QuizItem`'s self-contained POST, not carry the secret as a prop. |
| **Progress/mastery** (RF-7) | **FIT** | A static snapshot (`mastery: 0.72`) as a literal prop, just like `Chart` (`schemas.ts:118-123`). A live bar would require `Query`. |
| **Timeline/Steps** (RF-8) | **FIT** | Already exists literally as `StepSequence` (`schemas.ts:103-106`) — a 1:1 match with RF-8, not an analogy. |
| **Video checkpoint** (RF-9) | **FIT IN PRINCIPLE / BLOCKED BY INFRASTRUCTURE** | The rules don't prevent it (same self-contained pattern as `QuizItem`); the real blocker is that **there is no video player** (Question 8), not reactivity. |
| **Rubric** (RF-10) | **FIT** | Self-assessment without automatic grading → no `answer_key` (rule 5 doesn't apply); ephemeral selection state. |
| **Code exercise** (RF-11) | **NOT FIT** | "Checking" requires execution/network (≈`Mutation`, forbidden) outside the `assertStaticOnly.ts` model. Display without checking (`CodeBlock`) is fit, but doesn't cover full RF-11. |

### Discrepancies with `design.md` §5's draft

1. **RF-3**: "to confirm" → **confirmed FIT** (`DragOrder` precedent).
2. **RF-8**: already exists as `StepSequence` — no need to build it, just map it.
3. **RF-6**: the caution ("don't leak the answer") is **structural**, not just implementation
   detail.
4. **RF-9**: reactivity is **not** the obstacle; the player is (Question 8).
5. Real catalog = **14 blocks**, not 10 (more precedents to justify FIT).

### Recommendation

**8 of 11 FIT** (Flashcard, Matching/Sort/Categorize, quiz, Glossary, Hint/Reveal,
progress/mastery, Timeline, Rubric), **1 fit-but-blocked** (video, RF-9), **2 not fit** while
`RENDER_ALLOW_REACTIVE=False` (SpacedRepetitionDeck, code). Suggested registration order: first
the 1:1 precedent ones (Timeline via `StepSequence`, Matching via `DragOrder`, quiz via
`QuizItem`), then the new frictionless ones (Flashcard, Glossary, progress, Rubric), and leave
Hint/Reveal until the boundary "never wraps an exam answer" is documented.

---

## Question 8 — Is there a video player with checkpoints in `skillnet-web`? (SkillNet adapter)

### Evidence

Exhaustive search (Grep/Glob) over `repo/apps/skillnet-web/` and `skillnet-api/src` for: `video`,
`player`, `react-player`, `video.js`, `hls`, `mux`, `vimeo`, `youtube`, `<video`, `Plyr`, and
`onTimeUpdate`/`currentTime`/`timeupdate`/`checkpoint`/`cue`/`seek` events.

**Result: no video player integration.** Zero matches in code, zero files with "video"/"player" in
their name, zero timestamp events. The only multimedia dependency is `wavesurfer.js`
(`^7.12.11`) — **audio**, the base of `AudioExplanationBlock`/`PronunciationExerciseBlock`. Useful
as a precedent: the project accepts a focused, version-pinned dependency when the kit needs it
(consistent with RNF-5).

### What to evaluate from scratch (no prior decision)

1. **Source type**: self-hosted (mp4/HLS) vs. third-party (YouTube/Vimeo) — **data not in the
   repo**, and it conditions everything else.
2. **Native `<video>` + `timeupdate`/`<track kind="chapters">`**: zero dependency cost, supports
   checkpoints via DOM events.
3. **`react-player`**: unifies mp4/YouTube/Vimeo, but is an additional npm dep → RNF-5.
4. **`video.js`/`hls.js`/Mux**: only if there's real adaptive streaming (no evidence in the repo).
5. **A11y**: WebVTT `<track>` (subtitles) from the start, not "to add later."
6. **Fit without reactivity**: the checkpoint is resolved with self-contained React state on the
   block, it doesn't reopen `openui-adoption.md`; it's an ordinary UI dependency subject to
   RNF-5.

### Recommendation

**Doesn't exist today; evaluate from scratch.** Missing the data on what source type SkillNet
uses/would use before choosing. Recommended starting point (not decided here): try native
`<video>` + `<track kind="chapters">`/`timeupdate` first (zero dependency cost), and move up to
`react-player` or another library only if a concrete requirement appears (e.g. videos already
hosted on YouTube/Vimeo).

---

## 9. Supplementary findings (beyond the 8 questions in §6)

> These findings come from batch D (sources provided by the product owner). They don't answer an
> existing §6 question — **they expand it**. They are collected here so Phase 2 can decide whether
> they modify `requirements.md`/`design.md`.

### 9.1 Pedagogical evidence — reorders the inventory's priority (currently absent from the spec)

- **Dunlosky et al. 2013** (SAGE, 403 — reconstructed via APS and PubMed
  https://pubmed.ncbi.nlm.nih.gov/26173288/): of 10 techniques, only **practice testing** and
  **distributed practice** have **high** utility; highlighting/rereading, **low** (confirmed in a
  secondary source). → **RF-2 (distributed practice) and RF-4 used as practice testing have the
  strongest backing in the inventory.** RF-5 (Glossary as passive lookup) does not have it → it
  should force active recall, not just lookup.
- **Wisniewski, Zierer & Hattie 2019** (Frontiers, open-access, read in full
  https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full): 435 studies; **informative**
  feedback d=0.99 vs. reinforcement/praise/points d=0.24. → **New proposed requirement:** RF-4 and
  RF-6 should support an **informative feedback slot** (why, what strategy), not just a visual
  correct/incorrect state. `design.md` doesn't capture this today.
- **Fiorella & Mayer 2016** (Springer, login — via ERIC https://eric.ed.gov/?id=EJ1120458): 8
  generative strategies. Candidates for **new components** that don't exist today:
  `SelfExplanation` and `ConceptMap` (mapping) — **outside the current inventory, v2 proposal**,
  not to implement yet.
- **Sitzmann 2011** (Wiley, 402 — via the abstract's summary): simulation games with a positive but
  **moderate** effect (d 0.22-0.52) and a **declared publication bias**. → Weighs against
  over-prioritizing a scenario/simulation component (see §9.3): it would enter with medium-low
  priority.

**Recommendation:** add an evidence-based prioritization note to `requirements.md`/`design.md`
(RF-2/RF-4 = strong evidence; RF-9/RF-10/RF-11 = not evaluated by these sources) and the
informative-feedback requirement to RF-4/RF-6.

### 9.2 QTI/xAPI: interoperability mapping and a missing interaction family in §4.1

**QTI 3.0 defines 21 interactions** (not ~19) —
https://www.imsglobal.org/spec/qti/v3p0/impl. RF-3/RF-4 cover the **textual/list-based**
interactions well (`choice`, `match`, `associate`, `order`, `gap-match`, `text-entry`,
`extended-text`, `inline-choice`), but leave **an entire family uncovered**: **graphical/
image-based** interactions (`hotspot`, `hot-text`, `graphic-order`, `graphic-associate`,
`graphic-gap-match`, `position-object`, `select-point`, `drawing`) and **numeric/slider
response**. **This was not in §4.1 — it's a scope finding, not a naming one.**

**xAPI: 10 closed interaction types** (`true-false`, `choice`, `fill-in`, `long-fill-in`,
`matching`, `performance`, `sequencing`, `likert`, `numeric`, `other`) —
https://github.com/adlnet/xAPI-Spec. Direct mapping from RF-3/RF-4; **unmapped**: `performance`,
`likert`, `numeric` (matches the slider/numeric gap from QTI).

**H5P `semantics.json`** — https://h5p.org/semantics: a declarative schema that serves **both**
to generate the editor and to validate at runtime. A pattern adoptable for our registry entries
(RF-15/RF-17): one schema per component that documents + validates props, consistent with RNF-4
(streaming/incomplete props). *(Data correction: H5P's drag-and-drop repo is
`h5p-drag-question`, not `h5p-drag-and-drop`.)*

**Recommendation:** (a) document in each registry entry which QTI interaction and which xAPI
`interactionType` each RF-3/RF-4 component corresponds to (reporting interoperability without
adopting QTI wholesale); (b) **add a scope note to §4.1** declaring the graphical and numeric/
Likert interactions as **out of v1, v2 candidates** (today they're dropped without saying so);
(c) adopt the `semantics.json` dual pattern for the registry entry format.

### 9.3 Candidate libraries not covered by the spec

- **dnd-kit** (MIT, https://github.com/clauderic/dnd-kit): keyboard + ARIA + live regions built
  in. Direct mitigation for the WCAG 2.5.7 non-compliance in RF-3. Nuance: `@dnd-kit/core` has had
  no release in ~2 years; the new API is `@dnd-kit/react` (0.5.0). React 19 compat **not
  confirmed** in official docs (secondary source only). → Adopt as a pinned behavioral dependency
  (RNF-5).
- **ts-fsrs** (see Question 4): third option for RF-2 as a pinned dependency.
- **Ink/inkjs** (MIT, https://github.com/inkle/ink , https://github.com/y-lohse/inkjs): branching
  scripts compilable to JSON, very generatable by an LLM. Justifies a new **"branching scenario"
  component** outside the inventory, **medium-low priority** (Sitzmann evidence, §9.1).
- **Sandpack** (**Apache-2.0**, not MIT, https://sandpack.codesandbox.io/): solves RF-11's
  **execution** (editor + in-browser runtime), **not the checking** (the checker is still our own
  work). It doesn't raise RF-11's priority; it lowers its future cost. Apache-2.0 requires
  attribution if copied code is redistributed — relevant to the copy-paste model (RNF-5).

### 9.4 Accessibility as a legal requirement (not just ethical)

- **WCAG 2.2 §2.5.7 Dragging Movements** (AA) —
  https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html: every drag function must
  have a **single-pointer, no-dragging** alternative. **Important nuance:** RF-3 today asks for
  "keyboard support, not just drag-and-drop" — but **keyboard ≠ single-pointer-without-dragging**.
  dnd-kit gives keyboard support, not necessarily the "select source → select target" (two-click)
  pattern that 2.5.7 strictly requires. That pattern must be implemented explicitly, not assume
  2.5.7 is satisfied just because there's keyboard support.
- **EN 301 549** (ETSI index 403 — via Deque/WCAG.com): the harmonized European standard that
  references WCAG in its Chapter 9. Since **June 28, 2025**, enforceable under the **European
  Accessibility Act** also for private companies selling to consumers in the EU → accessibility =
  a **legal sales requirement**, not aspirational. Reinforces RF-12–17 as first class.
  **Not verified:** according to secondary sources, the version of EN 301 549 currently in force
  would reference WCAG **2.1**, earlier than 2.2 — so **2.5.7 might not yet be literally
  incorporated**. Confirm against EN 301 549's actual text before using it as a precise legal
  argument with a client.

**Recommendation:** WCAG 2.2 (incl. 2.5.7) as a non-negotiable requirement for RF-3, with the
single-pointer pattern in addition to keyboard; add EN 301 549/EAA to `design.md` as business
motivation for RF-12–17, verifying the exact WCAG version it incorporates before asserting it as
legal compliance.

---

## 10. Status of `design.md`'s `[PENDING]` sections (for Phase 2)

| `design.md` section | Question | This research's result |
|---|---|---|
| §2 (primitives base, React 19) | P2 | Radix by default + document friction; watch Base UI. Missing an own smoke test before fixing it. |
| §3 (registry mechanism) | P1 | shadcn's official CLI as primary; own versioning convention; `shadcn diff` to be tested. |
| §3 (Tailwind?) | P3 | Not mandatory; base is CSS custom properties, Tailwind optional. |
| §5 (inventory + priority) | P4, P7, §9.1 | Priority should be evidence-based (RF-2/RF-4 strong); reactivity table = 8 fit/1 blocked/2 not; real catalog = 14 blocks. |

**Points Phase 2 should decide explicitly that go beyond what §6 asked** (all in §9): is the
informative-feedback requirement added to RF-4/RF-6? is the graphical/numeric interaction gap
declared out-of-v1 in §4.1? do `ts-fsrs`/dnd-kit become pinned dependencies? is a "branching
scenario" component (Ink) opened for v2?

---

## Exit criteria (Phase 1) — self-assessment

- [x] Every question in §6 (1-8) has an answer with **cited evidence** (URL or file:line) and an
  **explicit recommendation**.
- [x] Where evidence is not conclusive, it is stated as such (P2 without a smoke test; P5
  neuro-specific gap; §9.1 Dunlosky not verified line by line; §9.4 EN 301 549's WCAG version not
  verified; dnd-kit's React 19 compat not confirmed).
- [x] `design.md`'s `[PENDING]` sections have data to resolve in Phase 2 (§10).
- [x] Findings beyond §6 are kept separate (§9) so Phase 2 can decide whether they modify the
  spec, instead of mixing them with the answers to the existing questions.
