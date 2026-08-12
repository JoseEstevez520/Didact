# Product decisions made after Phase 1

Dated log of decisions the product owner (Jose) made **after**
`specs/education-components/research.md` (Phase 1, 2026-08-11) delivered its synthesis. These
decisions do not rewrite the research — its findings and recommendations remain valid as
documented — but they **override a specific recommendation** with an explicit product choice.
They are documented here so it's clear what "the evidence says" versus what "the owner decided
knowing that evidence," without mixing the two inside `research.md` itself.

---

## D1 — Tailwind v4 adopted as the styling layer (overrides P3's default choice)

**Date:** 2026-08-11.

**What `research.md` says (still true, not rewritten):** Question 3 concludes, with cited
evidence, that shadcn/ui's registry mechanism **does not require** Tailwind (the `tailwind` field
in `registry-item.json` is deprecated in favor of `cssVars.theme`), and recommends not requiring
it as a core peer dependency so as not to compromise the "any React project" goal.

**Product decision:** Jose chooses to **use Tailwind v4 anyway**, for visual consistency and as a
style reference aligned with shadcn/ui — not because the distribution mechanism forced it. This
does not contradict the research (which speaks to what the mechanism *requires*, not what the
owner *prefers*); it's a different decision layer that Phase 1 explicitly left out of its scope
("does not decide architecture", ROADMAP.md Phase 1).

**What changes in the scaffold:**
- New package `packages/theme` (`@didact/theme`): neutral theme (RF-16) in CSS custom properties +
  a Tailwind v4 `@theme` block (CSS-first, OKLCH) — layer 2 of `design.md` §2.
- `packages/core` now documents its styling layer as **Tailwind + `cva`** over `@didact/theme`'s
  tokens, instead of "CSS custom properties / plain classes without Tailwind."
- `postcss.config.mjs` at the monorepo root, with `@tailwindcss/postcss`.
- Pinned dependencies (RNF-5, not installed yet — scaffold): `tailwindcss` 4.1.11,
  `@tailwindcss/postcss` 4.1.11, `postcss` 8.4.49, `class-variance-authority` 0.7.1.

**Honest caveat (same standard as `research.md`):** the versions above are a reasonable reference
as of this update's date, **not verified live against `registry.npmjs.org`** the way
`research.md` P1/P2 did for Radix/React Aria/Ariakit/Base UI. Confirm the actual stable version of
each package before installing in Phase 4.

**What does NOT change:** the neutral theme remains restyleable via plain CSS custom properties
(level 1 of `@didact/theme`) — a consumer without Tailwind in their project can still override
those variables; what Tailwind adds is an additional utility layer on top of those same variables,
not a replacement for the restyling mechanism.

---

## D2 — Broad and ambitious scope (reverses the "out of v1" framing)

**Date:** 2026-08-11.

**What `research.md` says (still true):** §9.2 identifies that the family of graphical/image-based
and numeric/Likert interactions from IMS QTI 3.0 has no assigned RF in `requirements.md` §4.1 — a
real scope finding, not a naming error. The synthesis's original recommendation was to declare
that family "out of v1, a v2 candidate" instead of leaving it dropped without saying so.

**Product decision:** Jose wants to cover **"as much educational ground as possible, with good
style"** — from matching/drag exercises to code exercises and complex components — organized in
**complexity waves**, not as a "minimal v1" cutdown that drops the hard parts. This does not
contradict `research.md`'s scope finding (it's still true that no RF is assigned to those
interactions today); it changes what's done with that finding: instead of "drop until v2," it's
declared **planned**.

**What changes in the scaffold:**
- `packages/validators/pedagogy/qti-mapping.json`: the block previously named `gapsFueraDeV1`
  (Spanish for "gaps out of v1") becomes `plannedGaps`; each interaction keeps `"gap": true` (it
  still has no assigned RF today) and adds `"scope": "planned"` + `"phase": "advanced-wave"`.
- A `codeExercise` block is added for **RF-11** (code exercise, backed by Sandpack for execution —
  research.md §9.3) with the same `scope: "planned"`.
- The root `README.md` and `packages/core/README.md` describe the scope as broad and organized in
  complexity waves, not as a "cut-down v1."

**What does NOT change:** the real implementation order is still based on the pedagogical evidence
in `research.md` §9.1 (RF-2/RF-4 with the strongest backing) and the SkillNet adapter fitness
table (Question 7) — "broad scope" doesn't mean "no priority"; it means the more complex items
enter in a later wave, not that they're dropped forever.

---

## D3 — Foundation portfolio before sector-specific labs

**Date:** 2026-08-12.

**Previous roadmap assumption:** `AnimationLab` was selected as the first experience-platform pilot
after animation was discussed as an attractive example for a dynamically generated course. That
conversation demonstrated product ambition, not relative market demand or architectural priority.

**Product decision:** advanced growth is planned as a portfolio of reusable foundations: interactive
media, data/coordinates, decisions/procedures, system simulation and artifact execution. A public
experience sits on a specialized foundation; subject and sector cases are
normally declarative recipes.

No foundation is considered general after one vertical. It must support two materially different
cases with the same meaningful authoring/state contract. If the second case fits only through
domain-specific flags or inaccessible behavior, the abstraction is split instead of frozen.

**Evidence boundary:** H5P's published 2022 H5P.com distribution is used as one usage proxy, not as
current global market share. QTI, Moodle and Open edX are coverage checks, not rankings. Simulation
evidence is conditional and does not justify prioritizing a simulation solely because it is
interactive.

**Immediate consequence:** Phase 10 begins by designing an interactive-media foundation with a
procedure-video fixture and a language-comprehension audio fixture. `AnimationLab` becomes a
possible simulation recipe or specialization and is not implemented until the system-simulation
foundation is evaluated with a contrasting non-keyframe case.

**Source of truth:** `docs/experience-foundations.md` contains the scoring method, initial matrix,
portfolio boundaries and admission gate.

---

## D4 — Retire the deck UI, preserve spaced repetition as a capability

**Date:** 2026-08-12.

**Observed problem:** `SpacedRepetitionDeck` repeated the same visible study interaction as
`Flashcard` while adding scheduling controls to the component surface. In Storybook and for library
consumers, that looked like a second card component rather than a materially different learning
experience.

**Product decision:** remove `SpacedRepetitionDeck` from `@didact/core`, the public catalog and the
download registry. Keep three responsibilities separate:

- `Flashcard` is the compact revealable study surface;
- `RetrievalPracticeSession` requires an authored response before comparison and supports
  self-assessment without pretending to own persistence;
- `@didact/spaced-repetition` remains a headless scheduling contract and SM-2 implementation that a
  consumer can connect to stored review history.

This reduces the public catalog from 25 to 24 differentiated types without removing spaced
practice support. Historical research and design reports retain the former component name because
they record the evidence and architecture considered at that time; this decision supersedes their
public-component recommendation.

---

## D5 — Individual-course scope; collaboration outside the horizon

**Date:** 2026-08-12.

**Product decision:** SkillNet courses are generated and completed individually. Didact therefore
does not plan `PeerReview`, `CollaborativeArtifact`, reviewer assignment or real-time coauthoring in
the current product horizon.

Those experiences require identity, permissions, multiuser persistence, moderation and workflow
semantics that are not reusable UI concerns for the target product. `Rubric`, authored feedback and
artifact submission remain valid for individual learning; only learner-to-learner collaboration is
excluded. If validated demand appears later, it will be assessed as a separate product boundary
rather than prebuilt speculatively into the core.

---

## How this relates to the rest of the repo

See `research/README.md` for how `research.md`, `reports/`, `sources/`, and this document fit
together. No decision in this file requires reopening or correcting `research.md` — both things
are true at once: the research describes what the mechanism/data allows or recommends by default,
and this document describes what the product owner decided to do with that information.
