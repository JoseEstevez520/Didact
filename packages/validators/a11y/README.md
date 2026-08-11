# @didact/validators/a11y

Machine-readable accessibility data, derived from `specs/education-components/research.md`
Question 5. `wcag-criteria.json` is the core's non-negotiable minimum contract: full WCAG 2.2 AA,
also treating the AAA criterion 2.3.3 as mandatory.

## Why WCAG 2.2 (and not just "good intentions")

`design.md` §9 explicitly flags the risk of "well-intentioned accessibility without evidence."
`research.md` responds with evidence ranked by evidentiary strength:

1. **WCAG 2.2** (normative) — the strongest evidence, with an explicit A/AA/AAA level.
2. **CAST/UDL 3.0** (neuroscience research framework, not a checklist).
3. **W3C WAI-COGA** (guidance supplementary to WCAG, working-group consensus with user research on
   ADHD/autism/dyslexia/dyscalculia).
4. **British Dyslexia Association** (practical style guide, institutional backing, no
   point-by-point cited trials).

All four are real evidence but of different weight — `wcag-criteria.json` documents only category
1 (normative) in structured detail; categories 2-4 inform requirements like visual density,
typography, and pacing control (RF-14) mentioned in `research.md` §5.2-5.4 but not yet converted
to JSON in this scaffold.

## The 2.5.7 Dragging Movements case

Included explicitly because `research.md` §9.4 flags it as a nuance that's easy to overlook: RF-3
asks for "keyboard support, not just drag-and-drop," but **keyboard is not the same as "a single
pointer without dragging."** `dnd-kit` gives keyboard navigation out of the box, but that doesn't
automatically guarantee the pattern 2.5.7 strictly requires: "select source → select target" with
a single click/tap each time, with no need to hold down or drag. That pattern must be implemented
explicitly in RF-3's matching/ordering exercises; 2.5.7 cannot be considered satisfied just
because the component responds to keyboard.

## The legal angle: EN 301 549 / European Accessibility Act

`research.md` §9.4 documents that accessibility stops being just an ethical commitment and becomes
a **sales requirement**: EN 301 549 is the harmonized European standard that references WCAG in
its Chapter 9, and since **June 28, 2025** it's enforceable under the European Accessibility Act
(EAA) also for private companies selling to consumers in the EU. This reinforces RF-12–17 as
first-class requirements, not aspirational ones.

**Not verified (stated explicitly, as `research.md`'s honesty standard requires):** according to
secondary sources, the currently-in-force version of EN 301 549 would reference WCAG **2.1**,
earlier than 2.2 — so criterion 2.5.7 (introduced in 2.2) might not yet be literally incorporated
into the harmonized legal text. Before using EN 301 549 as a precise legal argument with a client,
confirm against EN 301 549's official text exactly which WCAG version it references.

## Status

Complete data for the normative category (WCAG). No executable validator yet (Phase 4): the
intent is for this data to feed an automated per-component a11y lint/test (RF-17), not just serve
as documentation.
