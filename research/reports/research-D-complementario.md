# Supplementary research (batch D) — Sources provided by the product owner

> Context read: `specs/education-components/requirements.md` (§4.1 RF-1..RF-11, §4.2 a11y, §6
> open questions) and `specs/education-components/design.md`. Verification date: 2026-08-11.
> Method: direct WebFetch when the source was accessible; when the direct fetch failed (403/402/
> paywall/redirect to login), this is stated explicitly and WebSearch was used over
> citable fragments of the source itself or of verifiable secondary summaries (PubMed, ERIC, APS,
> publisher abstract) — no unverified content has ever been invented.

---

## Block 1 — Taxonomy and schemas

### QTI 3.0 (1EdTech) — Impl. Guide
**URL**: https://www.imsglobal.org/spec/qti/v3p0/impl — **Accessible** (direct WebFetch, content
read).

**Concrete fact**: QTI 3.0 defines **21 standardized interaction types** (not ~19 as the brief
framed it — discrepancy to flag), each with a formal `qti-*-interaction` element:

| # | QTI 3.0 interaction | What it models | Mapping to our inventory |
|---|---|---|---|
| 1 | `qti-choice-interaction` | Selecting one or several options | RF-4 (single choice / multiple response) |
| 2 | `qti-text-entry-interaction` | Short inline text response | RF-4 (fill-in-the-blank) |
| 3 | `qti-extended-text-interaction` | Extended text response | RF-4 (short open answer) |
| 4 | `qti-gap-match-interaction` | Filling gaps from a bank of options | RF-3 (matching) / RF-4 (gap) |
| 5 | `qti-hotspot-interaction` | Selecting areas on an image | **No RF** — gap |
| 6 | `qti-hot-text-interaction` | Selecting words/phrases within a text | **No RF** — gap (equivalent to H5P's "Mark the Words") |
| 7 | `qti-inline-choice-interaction` | Inline dropdown (single option) | RF-4 (dropdown-type gap) |
| 8 | `qti-match-interaction` | Associating two sets of options | RF-3 (matching) |
| 9 | `qti-order-interaction` | Reordering a sequence | RF-3 (sequence ordering) |
| 10 | `qti-graphic-order-interaction` | Ordering hotspots on an image | **No RF** — gap (graphical variant) |
| 11 | `qti-associate-interaction` | Associating elements with each other (not two separate sets) | RF-3 (matching) |
| 12 | `qti-graphic-associate-interaction` | Associating hotspots within an image | **No RF** — gap |
| 13 | `qti-graphic-gap-match-interaction` | Gaps defined as hotspots + external options | **No RF** — gap |
| 14 | `qti-media-interaction` | Control of temporal media playback | RF-9 (video checkpoint, partially) |
| 15 | `qti-position-object-interaction` | Positioning an object/image over another image (stage) | **No RF** — gap |
| 16 | `qti-select-point-interaction` | Selecting one or several points on a graphic | **No RF** — gap |
| 17 | `qti-slider-interaction` | Sliding control for a numeric value | **No RF** — gap (numeric response) |
| 18 | `qti-upload-interaction` | File upload as response | **No RF** — gap (partially related to RF-11) |
| 19 | `qti-drawing-interaction` | Drawing/modifying a graphic | **No RF** — gap |
| 20 | `qti-custom-interaction` | Proprietary extension of the delivery engine | Extensibility mechanism, not a content type |
| 21 | `qti-portable-custom-interaction` | Portable extension via author JS | Extensibility mechanism, not a content type |

**Implication for the inventory**: the owner's framing ("it's the ontology we're
reinventing by hand") is partially confirmed — RF-3/RF-4 cover the **textual/list**
interactions well (choice, match, order, gap-match, text-entry) but leave **an entire
family uncovered: interactions on graphics/images** (hotspot, graphic-order,
graphic-associate, graphic-gap-match, position-object, select-point, drawing) and **slider-based
numeric response**. This was not in `requirements.md` §4.1 at all — it is a scope
finding, not just a naming one.

### H5P semantics.json
**URL**: https://h5p.org/semantics — **Accessible**.

**Concrete fact**: H5P describes each content type with a declarative `semantics.json` file
(not code) with basic types (`text`, `number`, `boolean`), containers (`group`, `list`) and
complex types (`select`, `library` —nested dependency on another content type—, `image`,
`video`, `audio`, `file`). Required attributes: `type`, `name`, `label`; optional:
`description`, `default`, `optional`, `min`/`max`/`regexp`/`maxLength` depending on type. The same
schema serves both **to generate the editor form** and **to validate content at
runtime** — it is doubly useful (authoring + validation), not just documentation.

**Implication for design**: our registry entries (RF-15/RF-17, `design.md` §3) could
adopt this same duality: a declarative schema per component (typed props, default
values, constraints) that serves both to (a) generate the registry/Storybook entry and
(b) validate props at runtime — consistent with RNF-4 (streaming, incomplete props) if the
schema declares which fields are required vs. progressive.

### H5P content type repos
**URL**: https://github.com/h5p — **Partially accessible** (the organization listing only
rendered 10 of 158 repos; specific repos had to be looked up by name).

Examples verified individually:
- **`h5p-flashcards`** (https://github.com/h5p/h5p-flashcards) — MIT, 749 commits. Models
  cards where the user must guess the answer from a prompt — a direct analog to
  RF-1 (`Flashcard`), but oriented toward "guessing" rather than "flipping."
- **`h5p-question-set`** (https://github.com/h5p/h5p-question-set) — MIT, 1101 commits. Models a
  quiz composed of multiple chained tasks (analogous to grouping several RF-4 instances
  under a session container) — a pattern our inventory doesn't have explicitly: an
  "exercise container" with aggregated progress.
- **`h5p-drag-question`** (the actual repo name for drag-and-drop; the owner's
  `h5p-drag-and-drop` URL returns 404 — **data correction**: the correct repo is
  https://github.com/h5p/h5p-drag-question). Its `semantics.json`
  (https://github.com/h5p/h5p-drag-question/blob/master/semantics.json) defines target
  zones ("drop zones") and draggable elements typed by library (`H5P.AdvancedText`, `H5P.Image`),
  with the correct answer marked in the editor itself — directly relevant to RF-3.

**Reliability note**: it was not possible to systematically enumerate "2-3 examples" from the
organization listing due to a fetch rendering limitation; the examples above were each verified
individually via a fetch to its own repo.

### xAPI interaction types (ADL)
**URL**: https://github.com/adlnet/xAPI-Spec (relevant document:
`xAPI-Data.md`) — **Accessible** after navigating to the correct file (the repo landing
page does not carry the content; `xAPI-Data.md` had to be requested directly).

**Concrete fact**: the enumeration is **closed, exactly 10 values** for
`interactionType`:

1. `true-false` — two possible answers (true/false)
2. `choice` — selection among several options (one or multiple)
3. `fill-in` — short answer (typically ≤250 characters)
4. `long-fill-in` — long answer (>250 characters)
5. `matching` — pairing a source set with a target set
6. `performance` — multi-step task
7. `sequencing` — ordering elements of a set
8. `likert` — selection on a discrete scale
9. `numeric` — numeric response
10. `other` — any other interaction not covered above

**Implication**: for SkillNet (or another consumer) to be able to emit real xAPI *statements* from
our components, each RF-3/RF-4 component needs to declare which xAPI `interactionType`
it corresponds to. Direct mapping: RF-3 matching→`matching`, RF-3 ordering→`sequencing`, RF-4 T/F→
`true-false`, RF-4 multi-response/single→`choice`, RF-4 gap→`fill-in`, RF-4 short open answer→
`long-fill-in` or `fill-in` depending on length. **No direct mapping in RF-1..RF-11**: `performance`,
`likert` and `numeric` — none of our RFs explicitly covers a Likert-type scale or a
pure numeric response (matching the `qti-slider-interaction` gap detected above in QTI).

### Block 1 recommendation

Adopt QTI and xAPI as a **reference vocabulary for naming/typing**, not as a dependency:
(a) for each RF-3/RF-4 component, document in its registry entry which QTI interaction
and which xAPI `interactionType` it corresponds to (enables reporting interoperability without
adopting all of QTI); (b) **explicitly add a scope note to `requirements.md` §4.1**
about graphical/image-based interactions (hotspot, graphic-order/associate/gap-match, drawing,
select-point) and numeric/Likert response as **out of scope for v1, candidates for v2** —
today they are implicitly dropped without the spec saying so; (c) for the registry
entry format, adopt H5P's dual `semantics.json` pattern (a schema that serves as documentation +
validation), applied to RF-15/RF-17.

---

## Block 2 — Pedagogical evidence

> Access note: the four sources in this block are behind a paywall/login at their primary URL
> (SAGE, Springer, Wiley) except Frontiers, which is open-access. For the three closed ones, the
> direct fetch returned 403 (SAGE), 402 (Wiley) or a redirect to Springer login — this is stated
> explicitly. The content was reconstructed via WebSearch over verbatim quotes and summaries
> from reliable secondary sources (PubMed abstract, the journal's official outreach page —
> Association for Psychological Science —, ERIC). No data has been invented; where the
> confirmation is indirect, this is stated as such.

### Dunlosky et al. 2013
**URL**: https://journals.sagepub.com/doi/10.1177/1529100612453266 — **Not directly
accessible** (403 Forbidden). Reconstructed via the official summary from the
Association for Psychological Science (https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html)
and the PubMed abstract (https://pubmed.ncbi.nlm.nih.gov/26173288/).

**Concrete fact**: of the 10 techniques evaluated (elaborative interrogation, self-explanation,
summarization, highlighting/underlining, keyword mnemonic, imagery for text, rereading, practice
testing, distributed practice, interleaved practice), only **practice testing** and **distributed
practice** receive **high** utility; **highlighting/underlining** and **rereading** receive
**low** utility, confirmed directly in the secondary source (in addition, based on widely
documented knowledge of this paper, keyword mnemonic and imagery for text are also classified
as low utility, and elaborative interrogation/self-explanation/interleaved practice as
moderate utility — **this part was not verified word-for-word against an accessible source in
this session**, it is flagged as consistent with the widely cited summary but not confirmed
line-by-line against the original PDF).

**Translation into the inventory**: RF-2 (spaced repetition, = distributed practice) and the
quiz variants of RF-4 used as *practice testing* have the STRONGEST evidence backing of
the entire inventory. By contrast, RF-5 (Glossary/Term with tooltip, analogous to highlighting/looking
up terms) and any "passive rereading" variant do not have that backing — the `Glossary` should
be designed to **force active recall** (e.g., a term quiz) rather than only passive
lookup, if the goal is to maximize real learning rather than just convenience.

### Wisniewski, Zierer & Hattie 2019
**URL**: https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full — **Accessible**
(open access, direct WebFetch).

**Concrete fact**: meta-analysis of **435 studies / 994 effect sizes / ~61,000
participants**. Overall effect d=0.48. Feedback **with information about the task, strategy, and
self-regulation** is the most powerful (d=0.99). **Reinforcement/punishment, low-information**
feedback is the least effective (d=0.24); 86% of feedback interventions with a
negative effect on motivation were "non-informative (rewards or punishments)." Feedback focused on
the **self/personal praise** is generally counterproductive for motivation.

**Translation into a design requirement**: for RF-4 (quizzes) and RF-6 (Hint/Reveal), plain
"correct/incorrect" feedback or gamified elements such as points/badges without explanation
is the form of feedback LEAST supported by evidence. Concrete proposed design requirement:
every quiz/exercise component with feedback must support (not necessarily require) an
**informative feedback** slot (why the answer is correct/incorrect, what strategy to use) —
not just a visual correct/incorrect state. This is a revision to **RF-4** that `design.md` does
not currently capture explicitly.

### Fiorella & Mayer 2016
**URL**: https://link.springer.com/article/10.1007/s10648-015-9348-9 — **Not directly
accessible** (303 redirect to Springer/IDP login). Confirmed via ERIC
(https://eric.ed.gov/?id=EJ1120458) and summary aggregators (Semantic Scholar, ResearchGate)
that cite the list of the 8 strategies; a third-party PDF was also attempted
(bootcampmilitaryfitnessinstitute.com) but no legible text could be extracted from the binary.

**Concrete fact**: the 8 generative strategies are **summarizing, mapping, drawing, imagining,
self-testing, self-explaining, teaching, enacting**.

**Translation into the inventory**: of the 8, two are directly expressible as a new component
that does NOT exist today in RF-1..RF-11:
- **self-testing** → already covered de facto by RF-4/RF-2 (practice testing).
- **self-explaining** → **no component today**: a prompt asking the learner to explain why an
  answer is correct before or after seeing it would fit as an extension of RF-6 (`Hint/Reveal`)
  or as a new `SelfExplanation` component.
- **mapping** (concept maps) → **no component today** — a candidate for a new component, but
  with a higher implementation cost (node/relationship editor) than the rest of the inventory.
- **teaching** (explaining to someone / to an agent) → partially related to assisted
  verification of RF-4 (short open answer), if framed as "explain this and the system evaluates."
- **drawing / imagining / enacting** → not very expressible as a generic library component
  (they require a free-drawing canvas or physical simulation) — remain out of reasonable scope.
- **summarizing** → partially covered if RF-4 (short open answer) is used to request
  summaries, but there is no dedicated component.

### Sitzmann 2011
**URL**: https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2011.01190.x — **Not directly
accessible** (402 Payment Required). Confirmed via search results citing specific
figures from the widely replicated abstract/summary of the paper (Personnel Psychology, 64,
489–528).

**Concrete fact**: meta-analysis of **65 studies, 6,476 participants**. Compared to
comparison groups, simulation games showed: self-efficacy +20% (d=0.52), declarative
knowledge +11% (d=0.28), procedural knowledge +14% (d=0.37), retention +9% (d=0.22). The
study itself **declares strong evidence of publication bias** in simulation games
research — that is, the effect sizes reported in the published literature
likely overestimate the real effect.

**Translation into the inventory**: there is no RF dedicated to "simulation game" or "branching
scenario" in RF-1..RF-11 today. The evidence is positive but moderate (d between 0.22 and 0.52) and
the author itself warns of publication bias — this weighs in favor of **not
overprioritizing** a complex simulation/scenario component over techniques with more solid
evidence and without that declared bias (practice testing, distributed practice, informative
feedback). This connects directly to Block 3 (Ink/inkjs): if a branching scenario component is
added, it should enter with **medium-low** priority, not high, however narratively
appealing it may be.

### Block 2 recommendation

Add a new section to `requirements.md` (or to `design.md`) that explicitly states which
RF-1..RF-11 prioritization is backed by strong evidence (RF-2/RF-4 via Dunlosky) and which
is weak/unevaluated (RF-9 video checkpoint, RF-10 rubric, RF-11 code — none of the 4
sources evaluate these). Add to RF-4 and RF-6 a requirement for an **informative feedback
slot** (Wisniewski et al.), and evaluate two new low-priority candidate components:
`SelfExplanation` and `ConceptMap` (Fiorella & Mayer), documenting them as **outside the current
inventory, a v2 proposal** — not implementing them now, since neither has the priority of
RF-1..RF-8.

---

## Block 3 — Candidate libraries

### dnd-kit
**URL**: https://github.com/clauderic/dnd-kit — **Accessible**.

**Concrete fact**: MIT, "keyboard support, sensible default ARIA attributes, customizable screen
reader instructions and live regions built-in"; supports pointer, mouse, touch, and
keyboard sensors. 17.5k stars, active maintenance (1481 commits). **Important maintenance
nuance** (via additional WebSearch): the project is in transition — `@dnd-kit/core` (the widely
adopted "v1" API) has had no release in ~2 years, while `@dnd-kit/react` (new
API, 0.5.0) had a release ~2 months ago. React 19 compatibility was not explicitly confirmed
in the fetched documentation; a third-party guide (pkgpulse.com, 2026) describes it as "the
default choice for React in 2026," but this is a low-editorial-weight secondary source,
not the official documentation.

**Translation to RF**: this directly addresses the owner's complaint ("the current drag exercises
violate WCAG 2.5.7") for RF-3 (matching/sort/categorize), by providing a keyboard
alternative out of the box instead of having to build it by hand.

### ts-fsrs
**URL**: https://github.com/open-spaced-repetition/ts-fsrs — **Accessible**.

**Concrete fact**: MIT, implements FSRS v6, native TypeScript (ESM/CJS/UMD), requires Node ≥20,
282 commits, recent releases (latest version 5.4.1 ~3 months ago per npm). It is a **structured
multi-module package**, not a single trivial file to copy — published on npm, meant
to be installed as a dependency, not for direct copy-paste shadcn-style.

**Contrast with the SM-2 conclusion from another batch**: the existence of ts-fsrs DOES change
the cost/benefit calculus of question 4 (`requirements.md` §6.4), but not directly toward
"adopt it by copying it" — its modular nature makes it more reasonable to treat as an
**external dependency pinned to an exact version + drift test** (exactly the pattern RNF-5 already
requires for non-copied dependencies, such as Radix). This is a third, intermediate option between
"homegrown SM-2" and "copying FSRS by hand": adopt ts-fsrs as a real, non-copied dependency of
the `SpacedRepetitionDeck` component (RF-2), accepting the RNF-5 maintenance cost in exchange for an
algorithm with better evidence (FSRS outperforms SM-2 in the project's own public benchmarks,
though this was not independently verified in this session). Bundle size was not determined
(bundlephobia was not consulted directly).

### Ink / inkjs
**URLs**: https://github.com/inkle/ink and https://github.com/y-lohse/inkjs — **Accessible**.

**Concrete fact**: Ink (MIT, 1559 commits, C# engine) is a branching scripting language that
compiles to JSON; inkjs is the JS/TS port, "zero dependency," compatible with the Ink 1.2.0
compiler / JSON format v21. Both are MIT-licensed with visible maintenance activity, although the
exact date of inkjs's last commit could not be confirmed with certainty (date
information was not available in the fetch).

**Translation into the inventory**: this WOULD justify a new component — **"branching
scenario"** — outside the current RF-1..RF-11 inventory. It fits well with the owner's explicit
use case (LLM-generatable procedures/compliance content: an LLM can generate Ink scripts
reasonably well because it is a compact, structured text format). Connected to Block 2: since
the Sitzmann 2011 evidence on simulation games is positive but moderate and with declared
publication bias, this component should be proposed with **medium-low priority**, as a
post-v1 extension, not as part of the already-fixed RF-1..RF-11.

### Sandpack
**URL**: https://sandpack.codesandbox.io/ — **Accessible**.

**Concrete fact**: a CodeSandbox toolkit for "live-running code editing experiences"; includes
CodeMirror for editing and Nodebox (a browser Node.js runtime) for real execution, not just
highlighting. Supports React (`@codesandbox/sandpack-react`). **License** (verified via additional
WebSearch on npm/Socket.dev, not on the official page): **Apache-2.0**, not MIT — relevant
data for RNF-5, since Apache-2.0 requires explicit attribution if copied code is
ever redistributed, though for use as a normal dependency this poses no blocker. The
fetched documentation does not mention automated exercise verification (answer checking) —
that would remain to be built on top of Sandpack; the library does not solve it.

**Translation to RF-11**: Sandpack DOES solve the **execution** part that RF-11 needed (editor
+ in-browser execution without a dedicated backend), but does NOT solve the "checking" part —
building the checker on top of the execution Sandpack enables would still be our work. This is
consistent with the low priority already assigned to RF-11 in `design.md` §5: Sandpack reduces the
cost of implementing it whenever it's decided, but does not change the priority.

### Block 3 recommendation

Adopt **dnd-kit** as a behavior dependency (layer 1/headless, RNF-5, pinned version)
for all RF-3 components — it is the most direct and concrete mitigation found for the
current WCAG 2.5.7 non-compliance. For RF-2, reopen question 4 of `requirements.md` §6 with
an explicit third option (ts-fsrs as a pinned external dependency, neither a homegrown SM-2 nor a
hand-copied FSRS) instead of treating it as settled in favor of SM-2. Propose **Ink/inkjs** as the
basis for a new "branching scenario" component outside the current inventory, medium-low priority.
Leave Sandpack as the already-validated technical solution for when RF-11 is activated, without
raising its priority.

---

## Block 4 — Legal accessibility

### WCAG 2.2 §2.5.7 Dragging Movements
**URL**: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html — **Accessible**.

**Concrete fact**: a **Level AA** criterion. Text: "All functionality that uses a dragging
movement for operation can be achieved by a single pointer without dragging, unless dragging is
essential or the functionality is determined by the user agent and not modified by the author."
Exceptions: when dragging is essential to the function, or when it is determined by the user agent
(not the author). The required alternative is a **single-pointer, no-dragging method**
(buttons, clickable areas, text fields, menus) that achieves the same result.

**Components in our inventory that trigger this**: any RF-3 (matching/sort/categorize)
implementation that relies on drag-and-drop as the **sole** interaction mechanism directly
violates 2.5.7 — this exactly matches the owner's note about the current drag
exercises. The typical single-pointer alternative for these exercises is a
"select source → select target" pattern (two clicks/taps instead of dragging), which
dnd-kit does not provide for free (dnd-kit provides **keyboard** support, which is a distinct and
also valid alternative under 2.5.7 if it is operable with a single pointer-substitute
mechanism, but it is worth verifying whether "keyboard" alone literally satisfies "single
pointer" or whether it is also worth implementing the two-click pattern as reinforcement).
This is a nuance that was not in the brief: **keyboard support and "single pointer without
dragging" are not necessarily the same requirement** — RF-3 as currently worded ("keyboard
support, not just mouse drag-and-drop") covers keyboard operability but does not explicitly
verify the pointer-without-dragging pattern that 2.5.7 requires in the strict sense.

### EN 301 549
**URL**: https://www.etsi.org/deliver/etsi_en/301500_301599/301549/ — **Not directly accessible**
(403 Forbidden on the ETSI index). Confirmed via secondary sources specializing in
compliance (Deque, Acquia, WCAG.com, a11y-collective) that cite the current version V3.2.1
(2021-03) and its content.

**Concrete fact**: EN 301 549 is the European harmonized accessibility standard for
public ICT procurement; its Chapter 9 (web content) **directly references the
WCAG 2.1 Level A and AA success criteria** (it does not reinvent its own web criteria). Since
28 June 2025 it has been enforceable under the **European Accessibility Act (EAA)** also for
private companies selling to European consumers, not just the public sector — complying with
EN 301 549 gives a "presumption of conformity" with the EAA.

**Translation into a requirement**: for SkillNet (or another consumer selling to businesses/
administrations in the EU), accessibility is not "good practice" but a **legal sales
requirement since 2025**. This reinforces RF-12..RF-14 and RF-17 (automated a11y in CI) as
**first-class** requirements, not aspirational ones — with a real legal deadline
behind them, not just a product preference.
**Reliability note**: the exact version of WCAG referenced by EN 301 549 (2.1 according to
the secondary sources consulted) is **earlier** than WCAG 2.2, which is the version 2.5.7
(Dragging Movements) comes from. This means 2.5.7 **may not yet be literally
incorporated** into the current version of EN 301 549 cited by these sources — this was not
verified directly against the text of EN 301 549 (blocked by 403), so this is flagged as **not
verified / unclear** and should be confirmed before using it as a precise legal argument in
a sale.

### Block 4 recommendation

Treat WCAG 2.2 compliance (including 2.5.7) as a non-negotiable design requirement for
RF-3, and explicitly implement the "select source → select target" pattern as a
single-pointer alternative in addition to the keyboard support already provided by dnd-kit —
do not consider 2.5.7 satisfied just because keyboard support exists. Add to `design.md` an
explicit reference to EN 301 549 / EAA as a business motivation (not just an ethical one) for
RF-12–RF-17, but verify in a follow-up investigation exactly which WCAG version is incorporated
by the current revision of EN 301 549 before using it as a precise legal compliance argument
in front of a client.
