# @didact/spaced-repetition

Spaced-repetition algorithms for `RetrievalPracticeSession` and consumer-defined practice flows (RF-2 in
`requirements.md`), behind a **persistence-agnostic interface**: the scheduler never saves
anything, it only receives and returns state — the consuming project decides where it lives
(localStorage, its own database, etc.).

## Contract (`src/types.ts`)

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

Interface taken literally from `specs/education-components/research.md` Question 4, derived from
how `ts-fsrs` already solves the same design problem.

## Algorithms

### SM-2 (`src/sm2.ts`) — default

~40-60 lines of pure arithmetic, zero dependencies, 35+ years in production (SuperMemo, and Anki
until 2023). "Medium" evidence per the `research.md` P4 table — enough to be the default for its
simplicity and zero cost, not for being the most accurate algorithm available. Formulas verified
against SuperMemo's original specification and Wikipedia (cited in the file). Documented stub;
full arithmetic implementation pending Phase 4.

### FSRS (`src/fsrs.ts`) — advanced mode

Models each card with Difficulty/Stability/Retrievability and 19 weights; Anki's default scheduler
since 2023, "high" evidence (beats SM-2 in the FSRS project's own benchmarks). `research.md`
leaves two paths open for when it gets implemented (neither decided in Phase 1):

1. Reimplement only the scheduler with default weights (100-250 lines, without the ML optimizer,
   which is expensive and avoidable for an MVP), copied as our own code.
2. Adopt `ts-fsrs` (MIT, native TypeScript) as an **external dependency pinned to an exact
   version + drift test** (the same RNF-5 pattern as `@didact/core`'s primitives layer), accepting
   its maintenance cost in exchange for better evidence. `ts-fsrs` is a multi-module package
   published on npm, not a trivial file to copy — hence why it's treated as a pinned dependency
   rather than pure copy-paste.

### Leitner — not included as the main algorithm

`research.md` rules it out as the default algorithm (too crude: 1 integer, one box) and reserves
it as a possible optional "simple mode," not implemented in this scaffold.

## What's non-negotiable

Whichever algorithm is active, it's always exposed behind the agnostic interface above — switching
algorithms must not break consumers who already integrated the scheduler contract.

## Status

Scaffold (Phase 1-3 of `ROADMAP.md`). Both schedulers are stubs that document the contract and the
reference formulas/decisions; they throw if invoked. Real implementation in Phase 4.
