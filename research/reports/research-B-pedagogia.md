# Phase 1 Research — Block B (Pedagogy): Questions 4, 5, and 6

> Scope: `requirements.md` §6, questions 4, 5, 6. Does NOT cover questions 1-3, 7, 8 (outside this
> assignment). Research date: 2026-08-11.

---

## Question 4 — Spaced repetition: SM-2 vs FSRS (vs Leitner), implementation cost, agnostic API

### Evidence

**SM-2 (SuperMemo 2)**
- Origin: Piotr Wozniak, used since SuperMemo 1.0 (1987), published openly in his master's
  thesis "Optimization of Learning" (1990). Remains the basis of Anki (pre-FSRS), Quizlet,
  Mnemosyne, and many other apps.
  - https://www.supermemo.com/en/archives1990-2015/english/ol/sm2 (original paper)
  - https://www.supermemo.guru/wiki/Algorithm_SM-2
  - https://en.wikipedia.org/wiki/SM-2_(algorithm)
- **Per-card state**: `n` (number of consecutive correct repetitions), `EF` (easiness factor,
  initial 2.5), `I` (interval in days).
- **Exact formulas** (confirmed on Wikipedia + supermemo.guru, consistent with each other):
  - Review input: `q` (response quality, 0–5: 5=perfect, 4=correct with hesitation,
    3=correct with serious difficulty, 2/1/0=incorrect to varying degrees).
  - `EF ← EF + (0.1 − (5−q) × (0.08 + (5−q) × 0.02))`, with floor `EF = max(EF, 1.3)`.
  - If `q ≥ 3` (success): `n=0→I=1`; `n=1→I=6`; `n>1→I=round(I×EF)`; then `n←n+1`.
  - If `q < 3` (failure): `n←0`, `I←1` (learning of that card is reset).
- **Implementation cost**: pure arithmetic, with no hidden state or matrices. A complete
  implementation (constants, clamps, types) fits in **~40-60 lines of TypeScript**,
  zero dependencies. It is the algorithm most commonly cited as "trivial to reimplement" in tutorials
  (e.g. https://dev.to/umangsinha12/how-spaced-repetition-actually-works-the-sm-2-algorithm-1ge3,
  https://github.com/thyagoluciano/sm2 — reference implementation in <100 lines).
- **Known limitation**: per-card EF is a very simple model (a single global "easiness");
  it does not distinguish "intrinsic difficulty" from "memory stability," and the interval grows
  deterministically as `EF^n`, which in practice overestimates forgetting for easy cards and
  underestimates it for hard cards (the reason Anki migrated to FSRS).

**FSRS (Free Spaced Repetition Scheduler)**
- Origin: open-source project (open-spaced-repetition), with papers at ACM KDD / IEEE TKDE.
  It is Anki's default algorithm since 2023 (v3 scheduler), replacing SM-2.
  - https://github.com/open-spaced-repetition/fsrs4anki
  - https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm (and its successor
    https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)
  - https://expertium.github.io/Algorithm.html (detailed technical explanation, maintained by the
    team itself)
  - https://borretti.me/article/implementing-fsrs-in-100-lines (independent implementation,
    confirms that the algorithm's core is compact)
  - https://domenic.me/fsrs/ (independent analysis of why it is better than SM-2)
- **DSR model** (Difficulty, Stability, Retrievability): instead of a single EF, each card
  has:
  - `S` (stability): days until the probability of recall drops to 90%.
  - `D` (difficulty): 1–10, the card's intrinsic difficulty.
  - `R(t,s)` (retrievability): probability of recall at instant `t`, a function of `s`.
    Formula (v4.5–v6): `R(t,s) = (1 + factor · t/s)^decay`.
- **Parameters**: a vector of weights `w` learned via optimization over real review
  history — 19 weights in FSRS-4.5/v6, expanded to 35 in v7 (dual forgetting-curve architecture).
  Anki ships reasonable default weights without the consumer having to train anything; the
  "optimizer" (fitting weights to a given user's history) is **optional and separate** from
  the scheduler.
- **Implementation cost**: the *scheduler* (applying the default weights to compute
  D/S/R and the next interval) is tractable in pure TypeScript — the reference library
  `ts-fsrs` (https://github.com/open-spaced-repetition/ts-fsrs,
  https://www.npmjs.com/package/ts-fsrs) implements the whole scheduler without heavy
  runtime dependencies (small package, supports ESM/CJS/UMD, Node ≥20). The article
  "Implementing FSRS in 100 Lines" confirms that the pure *scheduler* (without the parameter
  optimizer) is of similar complexity to an afternoon exercise, on the order of 100-200
  lines including the constants for the 19 default weights. The **optimizer** (retraining
  the 19-35 weights with ML over thousands of reviews) is substantially more expensive and is NOT
  necessary for an MVP — Anki's default weight vector can be used indefinitely.
- `ts-fsrs` API (confirmed in the README/docs): `createEmptyCard()` creates the initial state;
  `fsrs(params)` creates a scheduler; `next(card, now, rating)` returns `{ card, log }` with the
  new state and metadata; `repeat(card, now)` gives a preview of the 4 possible ratings without
  applying changes. **The library persists nothing**: persistence is the explicit responsibility
  of the caller — exactly the contract required by RF-2.

**Leitner (card box system)**
- Origin: Sebastian Leitner, 1972. https://en.wikipedia.org/wiki/Leitner_system,
  https://supermemo.guru/wiki/Leitner_system
- Model: N boxes with fixed, increasing intervals; success → moves up a box; failure → back to
  box 1 (or down one box in softer variants).
- **Implementation cost**: trivial, <20 lines — it is a finite state machine over an
  integer (box number) plus a fixed interval table.
- **Limitation**: much cruder than SM-2/FSRS (does not model per-card difficulty beyond the
  current box, intervals are fixed and not personalized). Useful as a "simple mode" option or for
  cases where fine-tuning is not a priority (e.g. a Storybook demo), not as the primary algorithm.

### Cost comparison (summary)

| Algorithm | Per-card state | Approx. TS lines (scheduler only) | External dependency required | Model quality |
|---|---|---|---|---|
| Leitner | 1 integer (box) | <20 | None | Low but robust and transparent |
| SM-2 | `n`, `EF`, `I` | 40-60 | None | Medium, proven in production for 35+ years |
| FSRS (scheduler only, default weights) | `S`, `D`, `reps`, `lapses`, `state`, dates | 100-250 | None (ts-fsrs is MIT, pure TS, but the needed subset can also be reimplemented) | High — outperforms SM-2 as measured by the Anki team itself in public benchmarks |

There is no "heavy" cost in any of the three if the goal is just the *scheduler* (applying
already-calibrated weights). The heavy — and avoidable — cost is FSRS's *optimizer* (training
per-user weights), which is not needed to satisfy RF-2.

### Persistence-agnostic API design (proposal, high level)

Single contract, independent of the algorithm chosen internally:

```ts
// The state is opaque to the consumer: it is stored and returned as-is, in their DB/localStorage/whatever.
type ReviewState = Record<string, unknown>; // concrete shape depends on the algorithm (SM2State | FSRSState | LeitnerState)

type ReviewGrade = "again" | "hard" | "good" | "easy"; // or 0-5 if exposing SM-2's native scale

interface ReviewResult {
  state: ReviewState;   // new state for THAT card — the consumer persists it wherever they want
  dueAt: Date;           // next review date
}

interface SpacedRepetitionScheduler {
  createInitialState(): ReviewState;
  schedule(state: ReviewState, grade: ReviewGrade, now?: Date): ReviewResult;
  // optional, useful for a "preview all 4 options before the user chooses" UI:
  preview?(state: ReviewState, now?: Date): Record<ReviewGrade, ReviewResult>;
}
```

Key design points (derived directly from how `ts-fsrs` already solves this, being the
only one of the three with a mature reference library):
- **Pure function**: `schedule()` has no side effects, does not call the network or storage. This
  is exactly the requirement of RF-2 ("receives/returns state, does not persist it").
- The **deck** (`SpacedRepetitionDeck`, RF-2) is a layer above: it maintains a list of
  `{ cardId, state }`, decides which card to show based on `dueAt`, and delegates to the scheduler
  to update the state after each review. The deck also does not persist — it exposes `getNextCard()`
  and `recordReview(cardId, grade)` which return the new array of states; the consumer decides
  where that array lives.
- The **concrete algorithm is swappable** behind this interface: `createSM2Scheduler()`,
  `createFSRSScheduler()`, and `createLeitnerScheduler()` can be published as 3
  interchangeable implementations of the same contract — consistent with the library's copy-paste
  model (the consumer copies only the algorithm file they want).

### Recommendation

**Implement SM-2 first** (minimal cost, zero dependencies, ~50 lines, 35+ years of evidence
of production use) as the default algorithm for the `SpacedRepetitionDeck` component, and
**leave FSRS as an installable "advanced mode" alternative** (same API contract),
recommending reimplementation of only the FSRS *scheduler* with Anki's default weights
(not the optimizer) if the project wants better precision — relying on `ts-fsrs`
(MIT, no heavy runtime dependencies) as an implementation reference to copy/adapt, not
as a versioned npm dependency (consistent with RF-15). **Do not use Leitner as the
primary algorithm**: reserve it as a possible optional "simple mode" variant, given that its model is
too crude to be the default for a library that presents itself as pedagogically serious.
In any case, the component must be exposed behind the agnostic interface described above so that
switching algorithms does not break consumers.

---

## Question 5 — Accessibility and neurodiversity: patterns with real evidence

> Methodology: for each pattern, the source is indicated, and an explicit distinction is drawn
> between **"normative (WCAG, success criterion with level A/AA/AAA)"**, **"informed expert
> consensus/research but not an isolated controlled study" (COGA, CAST/UDL)**, or **"practical
> style guide without citation of a primary study" (BDA)**. None of the three categories is
> "made up," but they carry different evidentiary weight — this is flagged explicitly wherever
> the source itself acknowledges it.

### 5.1 WCAG 2.2 (normative, the strongest evidence available)

Source: https://www.w3.org/TR/WCAG22/

| Criterion | Level | What it requires | Translation to a component requirement |
|---|---|---|---|
| **2.3.1 Three Flashes or Below Threshold** | A | Nothing should flash more than 3 times/second above safety thresholds (risk of photosensitive seizures) | No "celebration"/feedback animation may flash; manual/automated frequency testing if flash effects are used |
| **2.3.3 Animation from Interactions** | AAA (but recommended to treat as baseline, not just AAA) | Animation triggered by user interaction must be able to be disabled unless it is essential to the information | Every UI micro-animation (`Flashcard` flip, `Timeline` transition, success confetti) must respect `prefers-reduced-motion` (RF-13 already requires this) and, where possible, offer an explicit toggle in addition to the OS media query |
| **2.2.1 Timing Adjustable** | A | Every time limit must be able to be disabled, extended (≥10x), or warned of with ≥20s to extend it — with exceptions (real-time event, essential, or >20h) | If any quiz exercise or `SpacedRepetitionDeck` imposes a timer, it MUST be optional/configurable — this directly grounds RF-14 ("non-configurable time limits" as an anti-pattern) |
| **2.2.2 Pause, Stop, Hide** | A | Moving/blinking/auto-updating content (>5s) needs a pause/stop/hide control | Any progress carousel, animated counter, or autoplay video needs visible pause controls |
| **2.4.7 Focus Visible** | AA | The keyboard focus indicator must be visible at all times | All interactive components (quiz options, matching cards, `Hint` buttons) must maintain a `:focus-visible` state with sufficient contrast, never `outline: none` without a replacement |
| **2.4.11 Focus Not Obscured (Minimum)** | AA (new in 2.2) | The focused element must not be entirely hidden by author-created overlays/sticky headers | Relevant for `Glossary`/tooltips: when navigating by keyboard to a term with a popover, the popover must not cover the focused element |
| **1.4.3 Contrast (Minimum)** | AA | Text: contrast ≥4.5:1 (≥3:1 for large text) | The default neutral theme (RF-16) must set color tokens that meet this by default, and document it as a contract for whoever re-themes it |
| **1.4.11 Non-text Contrast** | AA | UI components and informative graphics: contrast ≥3:1 against the adjacent background | Card borders, status icons (correct/incorrect), progress bars — not just text |

**Specific recommendation**: treat 2.3.3 (AAA) as a product requirement even though it is
formally AAA, because RF-13 already requires it via `prefers-reduced-motion`; and use 2.2.1/2.2.2 as
the direct normative basis for RF-14.

### 5.2 CAST / UDL (Universal Design for Learning) — pedagogical framework, not a technical checklist

Source: https://udlguidelines.cast.org/, version 3.0 (2024).
https://avidopenaccess.org/resource/cast-releases-universal-design-for-learning-guidelines-3-0/

- Explicit framing from CAST: it is a **framework grounded in neuroscience ("brain science")
  research** covering 3 brain networks (affective, recognition, strategic), not
  a list of verifiable criteria like WCAG. **Evidence category: informed research /
  academic consensus**, not a checklist with measurable thresholds.
- 3 principles → 9 guidelines → 35 "considerations": Engagement (the *why* of learning),
  Representation (the *what*), Action & Expression (the *how*).
- Translation to component requirement (our interpretation, not a literal CAST statement):
  - **Representation** → every concept should be presentable in more than one format: this
    justifies `Glossary`/`Term`, `Hint`, and short-open-answer quizzes offering both
    text and (when applicable) visual/audio alternatives, not a single mandatory channel.
  - **Action & Expression** → matching/drag exercises (RF-3) must offer an
    interaction path alternative to mouse dragging (keyboard, click-to-select) — this is
    also a motor-accessibility requirement that UDL frames as the general principle of "multiple
    means of action."
  - **Engagement** → progress/mastery indicators (RF-7) and `Hint`/`Reveal` (RF-6) must
    give the learner control over pace and perceived difficulty, not just display a metric.

### 5.3 British Dyslexia Association (BDA) — practical style guide

Source: BDA Dyslexia Style Guide (2023 version,
https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf,
and mirror copies consistent with each other:
https://princessescanwearkickers.com/wp-content/uploads/2021/06/Dyslexia-style-guide.pdf,
summary at https://medium.com/@evelyn.brokering/dyslexia-friendly-style-guide-revised-and-updated-84c7f5ca6354).

**Evidence category note**: the BDA presents this as a **practical style guide /
accumulated professional consensus** (produced by a specialized organization, widely used
in the British education sector), **not as results from a randomized controlled trial cited
line by line**. It is included here as "common practice with strong institutional backing but
not as hard experimental evidence" — the search itself did not find that the guide cites primary
studies point by point; it is the synthesis of an expert organization, which is a real level of
evidence but distinct from a peer-reviewed paper.

Concrete recommendations → component requirement:
- **Typography**: sans-serif (Arial, Verdana, Tahoma, Century Gothic, Trebuchet, Calibri, Open
  Sans), minimum 12-14pt size, with an option to increase. → The neutral theme (RF-16) must set a
  default sans-serif family and expose font size as an adjustable token, never in fixed
  `px` without a relative unit.
- **Line spacing and line length**: avoid long lines, 60-70 characters per line; no
  justification (left alignment). → Long-text components (`Rubric`, open-answer quiz
  prompts) must limit the text line's `max-width`, and not justify text.
- **Avoid italics and underline** except for links; use bold for emphasis; headings ≥20%
  larger than body text. → No component may use `<em>`/`italic` as the sole means of
  highlighting a correct/incorrect answer (this also connects to RF-12, "don't rely
  solely on color").
- **Color**: avoid glaring white backgrounds (prefer soft cream/pastel), avoid
  pure green/red combinations (this also overlaps with color blindness). → Neutral theme
  color tokens must not depend on pure red/green for success/error; it must always be
  accompanied by an icon or text (again reinforcing RF-12).
- **Structure**: short blocks, bullets and numbering instead of continuous prose, table of
  contents in long documents. → `Timeline`/`Steps` (RF-8) and `Rubric` (RF-10) fit
  directly with this recommendation by design; reinforce it as a general principle for
  any long text block within an exercise.

### 5.4 W3C WAI-COGA (Cognitive and Learning Disabilities Accessibility Task Force)

Sources:
- Normative-adjacent document (not WCAG, but W3C): "Making Content Usable for People with
  Cognitive and Learning Disabilities" — https://www.w3.org/TR/coga-usable/
- Techniques: https://w3c.github.io/coga/techniques/index.html
- Overview/goals: https://www.w3.org/WAI/news/2022-03-31/new-format-coga-patterns/

**Evidence category note — important, and the document itself states it explicitly**:
COGA defines itself as **"supplementary guidance" to WCAG 2.2, not mandatory for conformance**. It
explicitly covers ADHD, autism, dyslexia, dyscalculia, dyspraxia, mild cognitive impairment. It is
**consensus from a W3C working group with user research cited in its
introduction** (personas based on real user research), but not a controlled
trial per individual pattern — each specific pattern is "recommended practice informed by
research," not an "isolated experimental result."

Relevant patterns with direct translation to a requirement (all with an explicit target user
in the document itself):
- **"Avoid Data Loss and Timeouts" (§4.5.9)** — goal: memory/executive function. → Reinforces
  RF-14: if an exercise has a timer, it must persist progress and warn before it expires.
- **"Let Users Control When Content Moves or Changes" (§4.9.1)** — explicit goal: ADHD,
  attention deficit. → Directly grounds the part of RF-14 about "unsolicited
  animation": autoplay video with checkpoints (RF-9), progress carousels, or celebration
  animations must be started only by user action or be pausable.
- **"Use White Spacing" (§4.4.10)** and **"Avoid Too Much Content" (§4.6.3)** — goal: dyslexia,
  memory, attention overload. → Grounds the part of RF-14 about "high visual
  density": a multiple-choice quiz should not show more than ~5-7 options simultaneously without
  grouping/paging; `Glossary` must not list all terms at once without filtering/search.
- **"Use a Consistent Visual Design" (§4.2.3)** — goal: cognitive impairment, learning
  disability. → The theming system (RF-16) must guarantee that the same type of component
  (e.g. all `QuizItem`) keeps the same control layout across variants.
- **"Design Forms to Prevent Mistakes" (§4.5.4)** and **"Make it Easy to Undo Form Errors"
  (§4.5.5)** — goal: executive function, attention. → Relevant for drag/match
  exercises (RF-3): an incorrect assignment must be undoable without penalty
  before "submitting" the answer.

### 5.5 What lacks solid specific evidence (state it explicitly, do not invent)

- No guide with the same level of specificity as the BDA (exact typography,
  characters per line) dedicated specifically to **ADHD** or **autism** separately was found — the
  most authoritative literature (COGA) treats them as part of the broader umbrella of
  cognitive disability, with shared patterns (time control, density, animation,
  consistency) rather than condition-specific typographic rules. **Honest conclusion**: it is
  not clear that font/size rules specific to ADHD or autism exist with the same
  backing as those for dyslexia; what exists is a strong overlap with COGA's general
  principles (less distraction, more predictability, user control over
  movement). What would be needed to close this gap: controlled studies that isolate ADHD/autism from
  dyslexia and measure comprehension/task time with specific typographic variations — none
  were found in this search.
- The effectiveness of commercially marketed "dyslexia" fonts (such as OpenDyslexic) is
  disputed in the literature — this was not investigated in depth for this assignment because it
  was not among the requested sources (the BDA does not mention them as a requirement, only
  recommends generic sans-serif), so nothing is claimed about them beyond the fact that the BDA
  does not require them.

### Recommendation (Question 5)

Adopt as a **non-negotiable minimum contract** for the core (already reflected in RF-12/13/14, but
now with concrete criteria traceable to a source):
1. Fully comply with WCAG 2.2 AA (includes 2.4.7, 2.4.11, 1.4.3, 1.4.11, 2.2.1, 2.2.2) and treat
   2.3.3 (AAA) as if it were mandatory AA given that it is already in RF-13.
2. No component with a timer without an option to disable/extend it (basis: WCAG 2.2.1 +
   COGA §4.5.9).
3. No animation/autoplay started without user action, and every animation respects
   `prefers-reduced-motion` (basis: WCAG 2.3.3 + COGA §4.9.1).
4. Default visual-density limit in option components (max. ~5-7 visible options
   without grouping) (basis: COGA §4.4.10/§4.6.3).
5. Neutral theme with sans-serif, relative and adjustable font size, not depending on pure
   red/green for state, no italics/underline as sole emphasis (basis: BDA style guide,
   reinforced by WCAG 1.4.1 no-color-alone which is already implicit in RF-12).
Document in Storybook itself, alongside each component, which specific WCAG/COGA/BDA criterion it
meets — not as a generic "accessible" claim, but traced to the source, given that design.md
§9 explicitly identifies the risk of "well-intentioned accessibility without evidence."

---

## Question 6 — E-learning standards/libraries: reference vocabulary and interoperability

### H5P

- What it is: an open-source framework for embeddable interactive content, with >50 content
  types, a modular "libraries" architecture with dependencies among them.
  https://h5p.org/content-types-and-applications,
  https://h5p.org/documentation/installation/content-type-accessibility
- Reference vocabulary relevant to our §4.1: `Flashcards`, `Dialog Cards`,
  `Drag and Drop`, `Drag the Words`, `Fill in the Blanks`, `Mark the Words`, `Find the Hotspot`,
  `Image Pairing`/`Image Sequencing`, `Multiple Choice`, `True/False Question`,
  `Single Choice Set`, `Essay` (open-ended answer with assisted verification), `Quiz (Question
  Set)`, `Timeline`, `Interactive Video` (directly relevant to RF-9, video checkpoint). This
  validates almost 1:1 the RF-1 to RF-9 inventory: H5P already has a type equivalent to
  each one except an explicit `Rubric` and a code exercise.
- Real interoperability: H5P integrates via LTI with Canvas, Brightspace, Blackboard, and "many
  VLEs that support LTI" — i.e., its de facto interoperability **depends on LTI**, it is not an
  independent exchange standard. Source:
  https://h5p.org/content-types-and-applications, https://docs.moodle.org/502/en/H5P_content_types_format
  (Moodle directly imports some H5P question types as a native format).
- Conclusion: **useful as a reference for exercise names/behaviors** (cross-validation
  of our §4.1 inventory), it does not provide an interoperability mechanism of its own beyond
  relying on LTI.

### Open edX XBlocks

- What it is: a component architecture for Open edX — each course block (video, problem,
  sequence) is an XBlock that maintains state, renders via "views," and processes actions via
  "handlers." https://openedx.org/faq/what-is-an-xblock-in-the-open-edx-platform/,
  https://docs.openedx.org/projects/xblock/en/latest/index.html,
  https://github.com/openedx/XBlock
- Reference vocabulary: it does not define a *question type* vocabulary per se (that is
  covered more by QTI/H5P); it defines an **architectural pattern for composing
  educational components with state + view + action** — relevant as design inspiration for the
  API of our own stateful components (though not for the exercise vocabulary).
- Interoperability: **coupled to the Open edX platform**, not an independent standard
  portable to any LMS (unlike LTI/QTI/SCORM/xAPI). It does not provide real cross-platform
  interoperability for our case.
- Conclusion: useful only as an **architectural pattern reference** (separating state/view/action
  per component), not as an exercise vocabulary or as interoperability to adopt.

### IMS QTI (Question & Test Interoperability), now under 1EdTech

- What it is: an XML data model for representing questions (`qti-assessment-item`) and tests
  (`qti-assessment-test`), with versions 1.2, 2.x, 3.0.
  https://www.imsglobal.org/spec/qti/v3p0/oview,
  https://www.imsglobal.org/spec/qti/v3p0/info/, https://en.wikipedia.org/wiki/QTI
- **Interaction/question type vocabulary** (QTI 3.0, confirmed list from the information
  model): `choiceInteraction` (single/multiple choice — covers RF-4 multi-answer and T/F
  as a special case), `orderInteraction` (ordering a sequence — covers part of RF-3),
  `associateInteraction` / `matchInteraction` (matching — covers RF-3 matching),
  `gapMatchInteraction` (fill gaps by dragging options — covers RF-4 gap),
  `inlineChoiceInteraction` (dropdown embedded in text), `textEntryInteraction` /
  `extendedTextInteraction` (short/long answer — covers RF-4 short open answer),
  `hotTextInteraction`, `hotspotInteraction` / `graphicOrderInteraction` /
  `graphicAssociateInteraction` / `graphicGapMatchInteraction` / `selectPointInteraction` /
  `positionObjectInteraction` (image-based interactions), `sliderInteraction`,
  `mediaInteraction`, `drawingInteraction`, `uploadInteraction`, `customInteraction` /
  `PCI` (Portable Custom Interaction / Technology-Enhanced Item, for non-standard types —
  relevant as a precedent for how to extend a closed vocabulary without breaking it).
- This is, by far, **the most complete vocabulary and the most directly comparable to
  our §4.1** among all the standards reviewed: practically every RF-3/RF-4 has a
  named equivalent in QTI, with 20+ years of use in real question banks.
- Real interoperability: QTI requires an XML binding for certification and interoperability among
  "authoring tools, item banks, test delivery systems." It is the most established real
  interoperability standard for *assessment specifically* (unlike LTI, which is for
  *launching tools*, or SCORM/xAPI, which are for *tracking completion/progress*).
- Conclusion: **adopt its interaction-name vocabulary as a naming reference for
  our quiz variants (RF-4) and matching/ordering exercises (RF-3)**, without implementing
  the XML binding (it adds no value to a copy-paste React component library, only to
  systems exchanging question banks between LMSs).

### IMS/1EdTech LTI (Learning Tools Interoperability)

- What it is: a standard for an LMS to securely launch an external tool with shared
  user/course context. Current version 1.3 (OAuth2 + OpenID Connect + JWT), with
  "LTI Advantage" adding grading/deep linking/names&roles.
  https://www.1edtech.org/standards/lti, https://en.wikipedia.org/wiki/Learning_Tools_Interoperability,
  https://standards.1edtech.org/lti/guides/implementation_guide/implementation-guide
- Exercise vocabulary: **none** — LTI does not define question types, it defines how a
  tool is authenticated and launched and how a grade is returned.
- Real interoperability: high, and it is the mechanism through which H5P (and many others) achieve
  interoperability with real LMSs (Canvas, Moodle, Blackboard, Brightspace). **Relevant only if
  the library — or the SkillNet adapter — ever needed to be launched embedded inside a third-party LMS**;
  it adds nothing to the component vocabulary itself.
- Conclusion: outside the useful scope of this research except as a note: if in the future
  SkillNet (or another consumer) needed to integrate as an LTI tool inside an external
  LMS, LTI 1.3 would be the standard to implement — but that is a future product decision,
  not something that should shape the core components' design.

### xAPI (Experience API / Tin Can)

- What it is: the conceptual successor to SCORM, a "statements" format (`actor-verb-object`, e.g.
  "Ana completed Lesson 3") sent to a Learning Record Store (LRS), able to track experiences
  both inside and outside the LMS (offline, mobile, simulations).
  https://www.teachfloor.com/elearning-glossary/xapi,
  https://elmlearning.com/blog/scorm-vs-tin-can-xapi-vs-aicc-whats-the-difference/
- Exercise vocabulary: it does not define question types; it defines a **vocabulary of
  learning events** (verbs like "completed," "answered," "attempted," "mastered"). This is
  **relevant as a naming reference for events** in designing callbacks/telemetry for
  our components (e.g. `onMastered`, `onAttempted` could align conceptually with
  xAPI verbs, making it easier for a future consumer to translate our events to xAPI if they
  want to send data to an LRS) — but it is not a dependency to integrate into the core, which
  explicitly does not manage persistence/backend (§2 "Out of scope").
- Conclusion: **event vocabulary as naming inspiration for callbacks**, not as
  interoperability to implement (the project's own spec excludes backend/persistence).

### SCORM

- What it is: a packaging + runtime API standard (`LMSInitialize`, `LMSGetValue`, `LMSSetValue`,
  `LMSCommit`, `LMSFinish`) for an LMS to track completion/score of a content package.
  Versions 1.2 and 2004 with somewhat different data models.
  https://scorm.com/scorm-explained/technical-scorm/run-time/,
  https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/
- Exercise vocabulary: none of its own — SCORM tracks *outcome* (completion/score),
  it does not define interaction types.
  "SCORM tracks courses, xAPI tracks experiences" (summary of the comparison in the source cited
  above) remains the most precise synthesis found.
- Real interoperability: it remains, according to the sources consulted, "the most
  widely used specification globally for e-learning," but it is limited to content packaged within
  an LMS (not offline, not natively multi-device like xAPI).
- Conclusion: **no relevance to the component vocabulary** of this library (we do not
  manage LMS packaging or tracking); it is mentioned only as a legacy standard that a
  consumer might need in their own integration layer, outside the core.

### Recommendation (Question 6)

1. **Adopt the IMS QTI 3.0 interaction-name vocabulary** as the main reference
   for naming/designing the RF-3 (matching/sort/categorize) and RF-4 (multi-answer/T-F/gap/short
   open answer quiz) variants — it is, by far, the standard with the greatest
   granularity and track record (20+ years) in exactly that vocabulary.
2. **Use the H5P content-type catalog as a cross-validation checklist** for
   the §4.1 inventory — if H5P has already solved an equivalent interaction pattern, it is a
   signal that the design of that component has precedent of real-world use at scale; do not
   adopt H5P as a dependency or exchange format.
3. **Do not implement LTI, SCORM, or the QTI XML binding in the core** — none of them add
   value to a copy-paste React component library with no backend; they are *LMS integration*
   standards, and the library explicitly does not manage backend/persistence (`requirements.md` §2).
   If the SkillNet adapter (or a future consumer) needed to embed itself in a third-party LMS or
   report progress to an LRS, LTI 1.3 and xAPI would be the candidate standards — but that lives
   outside the core, as that consumer's decision.
4. **Borrow the xAPI verb vocabulary only as naming inspiration for
   callbacks/events** of the components (e.g. `onAttempted`, `onMastered`), without implementing xAPI
   itself.
5. **Discard Open edX XBlocks and SCORM as a source of exercise vocabulary** — they add
   nothing to §4.1 (XBlocks is a platform architectural pattern, SCORM is completion
   tracking), although XBlock's "state + view + action" pattern may inspire how a stateful
   component is internally structured (a design note, not a vocabulary one).
