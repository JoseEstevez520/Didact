# Bibliography — Didact (Phase 1, research)

Sources cited in `specs/education-components/research.md`, grouped by topic, plus the original
sources provided by the product owner (batch D) when `research.md` references them through an
accessible mirror. Each line indicates **why the source matters** and its **verification status**
as stated in `research.md` (accessible / not verified / not accessible with a reason). Research
date: 2026-08-11.

---

## 1. Taxonomy and schemas (QTI 3.0, H5P semantics + repos, xAPI)

- **IMS QTI 3.0 — overview**: https://www.imsglobal.org/spec/qti/v3p0/oview — Standard with the
  finest-grained question/test interaction vocabulary (research.md P6); basis for
  `qti-mapping.json`. Accessible.
- **IMS QTI 3.0 — implementation guide (21 interactions)**: https://www.imsglobal.org/spec/qti/v3p0/impl —
  Full enumeration of the 21 interactions (not ~19 as initially assumed), including the graphical/
  image-based family outside the current inventory (research.md §9.2). Accessible.
- **H5P — content types and applications**: https://h5p.org/content-types-and-applications —
  50+ embeddable content types, a 1:1 equivalent of nearly all of RF-1..RF-9; used as a
  cross-validation checklist for the inventory, not as a dependency. Accessible.
- **H5P — semantics.json**: https://h5p.org/semantics — Dual declarative schema (documents +
  validates at runtime) adopted as the pattern for `packages/validators/schema/`. Accessible.
- **xAPI Spec (ADL)**: https://github.com/adlnet/xAPI-Spec — Closed vocabulary of 10
  `interactionType`s; used only as naming inspiration for callbacks, basis for
  `xapi-mapping.json`. Accessible.
- **Open edX XBlock — documentation**: https://docs.openedx.org/projects/xblock/en/latest/index.html —
  Architectural pattern (state + view + action) coupled to the platform; contributes no exercise
  vocabulary nor cross-platform interoperability. Discarded as a vocabulary source. Accessible.
- **1EdTech — LTI standard**: https://www.1edtech.org/standards/lti — Launches external tools
  inside an LMS; no exercise vocabulary of its own. Relevant only if a consumer needed to embed
  itself in a third-party LMS; outside the core. Accessible.
- **SCORM — technical run-time**: https://scorm.com/scorm-explained/technical-scorm/run-time/ —
  Packaging + completion tracking, no exercise vocabulary. Legacy, out of the core's scope.
  Accessible.

## 2. Pedagogical evidence (Dunlosky, Wisniewski/Hattie, Fiorella & Mayer, Sitzmann)

- **Dunlosky et al. 2013** (original source, SAGE/*Psychological Science in the Public Interest*):
  reported as 403/restricted access at the time of research. **Not directly accessible** —
  reconstructed via a secondary source from the Association for Psychological Science and via
  PubMed: https://pubmed.ncbi.nlm.nih.gov/26173288/. Of 10 study techniques, only *practice
  testing* and *distributed practice* have **high** utility — basis for RF-2/RF-4 having the
  strongest backing in the inventory (`evidence.json`).
- **Wisniewski, Zierer & Hattie 2019** (Frontiers in Psychology):
  https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full — Meta-analysis of 435
  studies; informative feedback d=0.99 vs. reinforcement/praise/points d=0.24. Basis for the
  "informative feedback slot" requirement proposed for RF-4/RF-6. **Accessible, read in full**
  (open-access).
- **Fiorella & Mayer 2016** (original source, Springer/*Educational Psychology Review*): reported
  as login-required access at the time of research. **Not directly accessible** — via an
  accessible ERIC mirror: https://eric.ed.gov/?id=EJ1120458. 8 generative learning strategies;
  basis for the out-of-inventory candidates `SelfExplanation` and `ConceptMap` (v2 proposal, not
  to implement yet).
- **Sitzmann 2011** (original source, Wiley/*Personnel Psychology*): reported as 402/restricted
  access at the time of research. **Not directly accessible, verified only via the abstract's
  summary** — https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2011.01190.x. Simulation
  games with a positive but moderate effect (d 0.22-0.52) and a publication bias declared by the
  source itself; weighs against over-prioritizing a scenario/simulation component.

## 3. Libraries (dnd-kit, ts-fsrs, ink/inkjs, Sandpack, shadcn/ui, UI primitives)

- **dnd-kit**: https://github.com/clauderic/dnd-kit — Keyboard + ARIA + live regions built in;
  direct mitigation for the WCAG 2.5.7 non-compliance in RF-3. React 19 compatibility **not
  confirmed** in official documentation (secondary source only) — a candidate for a pinned
  dependency (RNF-5), not for copying. Accessible.
- **ts-fsrs**: https://github.com/open-spaced-repetition/ts-fsrs — Native TS implementation of the
  full FSRS scheduler, MIT, with no persistence of its own (same contract RF-2 requires).
  Multi-module package published on npm, not a trivial file to copy — third option for RF-2 as a
  pinned dependency. Accessible.
- **FSRS4Anki**: https://github.com/open-spaced-repetition/fsrs4anki — Reference for FSRS's DSR
  model (Difficulty/Stability/Retrievability) and its 19 default weights. Accessible.
- **"Implementing FSRS in 100 lines" (Borretti)**: https://borretti.me/article/implementing-fsrs-in-100-lines —
  Evidence that FSRS's *scheduler* (without the weight optimizer) is tractable within a reasonable
  amount of code for an MVP. Accessible.
- **SM-2 — original specification (SuperMemo)**: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2 —
  Exact formulas for the default spaced-repetition algorithm (initial EF 2.5, floor 1.3).
  Accessible.
- **SM-2 — Wikipedia**: https://en.wikipedia.org/wiki/SM-2_(algorithm) — Cross-check of the
  formulas from the original specification. Accessible.
- **Ink**: https://github.com/inkle/ink — Branching-script language compilable to JSON; justifies
  a new "branching scenario" component outside the current inventory, medium-low priority (see
  Sitzmann's evidence). Accessible.
- **inkjs**: https://github.com/y-lohse/inkjs — JavaScript/TypeScript runtime for Ink, relevant
  for integrating it into a React project without depending on a native runtime. Accessible.
- **Sandpack**: https://sandpack.codesandbox.io/ — Solves RF-11's execution (editor + in-browser
  runtime), not the checking. Apache-2.0 license (not MIT) — requires attribution if copied code
  is redistributed, relevant to the copy-paste model (RNF-5). Accessible.
- **shadcn/ui — registry (overview)**: https://ui.shadcn.com/docs/registry — Confirms the
  third-party registry mechanism works with any framework, not just React. Accessible.
- **shadcn/ui — building your own registry**: https://ui.shadcn.com/docs/registry/getting-started —
  Dedicated guide for non-official registries; basis for the RF-15 decision. Accessible.
- **shadcn/ui — `registry.json` schema**: https://ui.shadcn.com/docs/registry/registry-json —
  Root schema adopted literally in `packages/registry/registry.json`. Accessible.
- **shadcn/ui — `registry-item.json` schema**: https://ui.shadcn.com/docs/registry/registry-item-json —
  Confirms the `tailwind` field is deprecated in favor of `cssVars.theme` — basis for the decision
  not to require Tailwind (research.md P3). Accessible.
- **shadcn/ui — registry namespaces**: https://ui.shadcn.com/docs/registry/namespace —
  Decentralized installation model with no central authority. Accessible.
- **shadcn/ui — registry authentication**: https://ui.shadcn.com/docs/registry/authentication —
  Native authentication via HTTP headers + environment variables; no OAuth/OIDC. Accessible.
- **shadcn/ui — CLI v4 changelog (2026-03)**: https://ui.shadcn.com/docs/changelog/2026-03-cli-v4 —
  Documents `shadcn diff` for the official registry; **does not explicitly confirm** it works the
  same way with third-party namespaced registries — marked "not verified" in `research.md`.
  Accessible (the content, not the guarantee it was checked for).
- **shadcn/ui — React 19**: https://ui.shadcn.com/docs/react-19 — Confirms the peer-dependency
  friction between Radix UI/React Aria and stable React 19. Accessible.
- **shadcn/ui — Tailwind v4**: https://ui.shadcn.com/docs/tailwind-v4 — Shows that even within
  shadcn/ui, Tailwind is not a frozen version (v3→v4 migration with `@theme`/OKLCH). Accessible.
- **Radix UI — releases**: https://www.radix-ui.com/primitives/docs/overview/releases — Confirms
  "Full React 19 compatibility" (PR #2952) and React-19-specific fixes as recent as July 2026.
  Accessible.
- **MUI — React 19 update (Base UI)**: https://mui.com/blog/react-19-update/ — Evidence that the
  same team maintaining Base UI already migrated MUI to React 19; basis for "watch Base UI" as a
  Radix alternative in 3-6 months. Accessible.

## 4. Accessibility (WCAG 2.2 §2.5.7 Dragging Movements, EN 301 549)

- **WCAG 2.2 — full text**: https://www.w3.org/TR/WCAG22/ — Normative source for the core's
  minimum accessibility contract (`wcag-criteria.json`). Accessible.
- **WCAG 2.2 — Understanding Dragging Movements (2.5.7)**: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html —
  Basis for the "keyboard ≠ single-pointer-without-dragging" nuance documented in
  `packages/validators/a11y/README.md`. Accessible.
- **W3C WAI-COGA — Making Content Usable**: https://www.w3.org/TR/coga-usable/ — Guidance
  supplementary to WCAG with specific patterns for ADHD/autism/dyslexia/dyscalculia (timers,
  visual density, visual consistency). Accessible.
- **CAST — UDL Guidelines**: https://udlguidelines.cast.org/ — Neuroscience framework (3 networks:
  affective/recognition/strategic) used as a research framework, not a checklist. Accessible.
- **EN 301 549** (harmonized European standard, ETSI index): reported as not directly accessible
  at the time of research (403) — verified via secondary sources (Deque/WCAG.com, not cited with a
  direct URL in `research.md`). **Not verified**: the currently-in-force version of EN 301 549
  would reference WCAG 2.1, earlier than 2.2, so criterion 2.5.7 might not yet be literally
  incorporated — confirm against the official text before using it as a precise legal argument
  with a client.

---

## Methodological note

This list prioritizes the URLs explicitly cited in `research.md`; the full detail of each finding
(including verification methodology, e.g. live `peerDependencies` lookups against
`registry.npmjs.org`) lives in `research.md` and in the raw reports under `../reports/`. Where an
original source was not directly accessible, the reported reason (403/402/login) and the
secondary route used are documented — the same honesty standard `research.md` inherits from
`openui-adoption.md` §1.
