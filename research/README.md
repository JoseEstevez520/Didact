# research/ — research artifacts index

This directory contains the raw artifacts from **Phase 1 (deep research)** of `ROADMAP.md`, whose
synthesized result with explicit recommendations lives in
`../specs/education-components/research.md`.

## How the pieces relate

1. **`../ROADMAP.md`** — sets that Phase 1 had to answer, with cited evidence, the 8 open
   questions from `../specs/education-components/requirements.md` §6.
2. **`../specs/education-components/research.md`** — the consolidated report, with one section per
   question, cited evidence, and an explicit recommendation. It is the **source of truth** for any
   subsequent design decision (Phase 2 onward) — nothing in `packages/validators/` or the rest of
   the monorepo should contradict it without updating it first.
3. **`reports/`** — the 4 raw reports that fed that synthesis, produced by 4 parallel agents: A
   (questions 1-3, technical stack), B (questions 4-6, pedagogy/standards), C (questions 7-8,
   SkillNet adapter), D (supplementary batch of sources provided by the product owner, the basis
   for `research.md`'s §9). Kept as traceability material — to verify a claim in `research.md`
   against its original source without having to re-research it.
4. **`sources/bibliography.md`** — full bibliography of the URLs cited in `research.md`, grouped
   by topic, with one line per source explaining why it matters and its verification status.
5. **`decisions.md`** — a dated log of **product decisions made after** Phase 1 that knowingly
   override a specific `research.md` recommendation (not contradict it by oversight). It currently
   documents two: adopting Tailwind v4 despite P3 concluding it isn't technically mandatory (D1),
   and a broad scope organized in complexity waves instead of the "out of v1" framing for the
   graphical/numeric interactions in §9.2 (D2).

## Honesty standard

Inherited from `openui-adoption.md` §1 and applied in `research.md`: where the evidence is not
conclusive, this is stated explicitly ("not verified", "it's unclear, and here is what would need
to be measured"). A made-up answer is not a valid research outcome; a well-grounded "I don't know"
is. The reports in `reports/` and the bibliography in `sources/` maintain the same standard.
