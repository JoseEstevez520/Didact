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

## How this relates to the rest of the repo

See `research/README.md` for how `research.md`, `reports/`, `sources/`, and this document fit
together. No decision in this file requires reopening or correcting `research.md` — both things
are true at once: the research describes what the mechanism/data allows or recommends by default,
and this document describes what the product owner decided to do with that information.
