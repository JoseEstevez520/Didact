# @didact/validators/pedagogy

Machine-readable data on the pedagogical grounding and reporting interoperability of the core
components, derived from `specs/education-components/research.md` §6 (Question 6) and §9.1-9.2.

## `evidence.json` — evidence strength per requirement

`research.md` §9.1 introduces a dimension the original spec didn't have: **not every component in
the inventory has the same backing from educational research**. Sources:

- **Dunlosky et al. 2013**: of 10 study techniques evaluated, only *practice testing* and
  *distributed practice* have **high** utility; *highlighting*/*rereading*, **low**. This gives
  **RF-2** (spaced repetition = distributed practice) and **RF-4** (quiz used as practice testing)
  the strongest backing in the inventory. **RF-5** (Glossary as passive lookup) doesn't have it by
  analogy with the low-utility techniques — hence why `research.md` recommends it force active
  recall instead of being just a lookup.
- **RF-9/RF-10/RF-11 are explicitly "not evaluated"** by these sources — not that they lack value,
  but that this research provides no evidence one way or the other about them.
- Candidates **outside the current inventory** (Fiorella & Mayer: `SelfExplanation`, `ConceptMap`;
  Sitzmann: branching scenario/simulation) are logged as a v2 proposal, not as an existing RF —
  see the JSON's `outOfInventoryCandidates` block.

## The "informative feedback slot" requirement (Hattie)

**Wisniewski, Zierer & Hattie 2019** (435 studies, https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full,
read in full): **informative** feedback (explains why and what strategy to use) has an effect
size of d=0.99, versus d=0.24 for reinforcement/praise/points feedback — a difference of category,
not of degree.

**Design consequence (not yet reflected in `requirements.md`/`design.md` — a finding Phase 2 must
decide whether to incorporate):** `RF-4` (quiz variants) and `RF-6` (Hint/Reveal) should support
an **informative feedback slot** — an explicit place in the component's API to explain why an
answer is correct/incorrect and what strategy would have led to getting it right — not just a
visual correct/incorrect state. `evidence.json` marks this with
`informativeFeedbackRequired: true` on the RF-4 and RF-6 entries.

## `qti-mapping.json` — interaction vocabulary

Documents which **IMS QTI 3.0** interaction each RF-3/RF-4 variant corresponds to, following
`research.md` P6's recommendation to adopt QTI's vocabulary as a naming reference (not for
implementation — QTI's XML binding is not adopted in the core). Includes `plannedGaps`: the
family of **graphical/image-based** interactions (`hotspot`, `hot-text`, `graphic-order`,
`graphic-associate`, `graphic-gap-match`, `position-object`, `select-point`, `drawing`) and
**numeric/slider response**, which QTI does define and which `requirements.md` §4.1 does not
cover today — a scope finding (§9.2), not a naming one. Each entry carries `"gap": true` (still
true: they have no assigned RF today) **and also `"scope": "planned"` with
`"phase": "advanced-wave"`**, reflecting Jose's 2026-08-11 product decision
(`research/decisions.md` D2: broad scope, these interactions are planned, not dropped). By the
same decision, the `codeExercise` block registers **RF-11** (code exercise, backed by Sandpack for
execution) also as `scope: "planned"`.

## `xapi-mapping.json` — reporting event vocabulary

Documents which **xAPI** `interactionType` (10 closed types) each RF would correspond to, useful
only as naming inspiration for callbacks (`onAttempted`, `onMastered`) — the core does not
implement xAPI/LRS. `performance`, `likert`, and `numeric` are marked `"unmapped": true`: there is
no equivalent RF in the current inventory, matching the same numeric/slider interaction gap QTI's
mapping detects.

## Status

Data complete per what `research.md` documents. No executable validator yet — the intent is for a
Phase 4 lint to check that every registry entry (RF-3/RF-4) declares its QTI/xAPI mapping, rather
than this staying reference documentation only.
