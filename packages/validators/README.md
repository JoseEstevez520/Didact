# @didact/validators

Didact's **scientific validators**: machine-readable data derived from
`specs/education-components/research.md`, organized into four families. They aren't a validation
runtime yet (Phase 4) — they are the structured data source that runtime will be built against,
and they already document, with traceability to the research, what each component must satisfy
before being considered done.

## The four families and their scientific basis

### `a11y/` — normative accessibility

`wcag-criteria.json`: the **WCAG 2.2** criteria (normative, the strongest evidence per
`research.md` §5's hierarchy) that form the core's non-negotiable minimum contract, including
**2.5.7 Dragging Movements** with the nuance that keyboard support does not equal "a single
pointer without dragging." Includes the legal angle (EN 301 549 / European Accessibility Act)
that turns accessibility into a sales requirement, not just an ethical one.

### `pedagogy/` — educational effectiveness evidence and reporting interoperability

`evidence.json` (evidence strength per RF, per Dunlosky et al. 2013 and Wisniewski/Hattie 2019),
`qti-mapping.json` (IMS QTI 3.0 interaction vocabulary for RF-3/RF-4, with the graphical/numeric
family marked as planned) and `xapi-mapping.json` (xAPI interactionType as naming inspiration for
callbacks). Also documents the **informative feedback slot** requirement (Hattie: d=0.99 vs
d=0.24 for reinforcement) that `research.md` proposes for RF-4/RF-6.

### `schema/` — declarative component contract

`component.schema.json`: a JSON Schema skeleton following H5P `semantics.json`'s dual pattern (one
document that documents and validates at once), with three-level `requiredness`
(`required`/`progressive`/`optional`) to model RNF-4 (props that may arrive incomplete in
streaming contexts).

### `drift/` — non-copied dependency drift control

`pinned-deps.json`: a structure for pinning the exact version + reason of any external dependency
not copied alongside the component (RNF-5), with the documented Radix UI/React 19 caveat from
`research.md` P2 as a reference case.

## Why "scientific validators" and not just "documentation"

Each family traces directly to a source cited in `research.md` (WCAG, Dunlosky, Wisniewski/
Hattie, IMS QTI, xAPI, H5P) instead of design intuition — addressing the risk `design.md` §9
explicitly flags: *"well-intentioned accessibility without evidence."* Phase 4's intent is for
this data to stop being just documentation and become automated checks (a11y lint, schema
validation, drift test) a component must pass before being published in `@didact/registry`.

## Status

Data complete per what `research.md` documents as of 2026-08-11. No executable validation runtime
yet — that's Phase 4 work in `ROADMAP.md`, built on this scaffold.
