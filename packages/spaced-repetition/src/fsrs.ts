/**
 * FSRS — Didact's advanced spaced-repetition mode (optional, not the default).
 *
 * Source: `specs/education-components/research.md` Question 4 and §9.3.
 *
 * FSRS (Free Spaced Repetition Scheduler) models each card with Difficulty/Stability/
 * Retrievability (DSR) and 19 default weights; it's Anki's default scheduler since 2023 and
 * beats SM-2 in the project's own benchmarks ("high" evidence in research.md's table, vs.
 * "medium" for SM-2). The cost is higher: 100-250 lines if the scheduler is reimplemented with
 * default weights (without the ML optimizer, avoidable for an MVP), or adopting the
 * already-published library.
 *
 * research.md explicitly leaves TWO paths open (not closed in Phase 1, to decide when this
 * module gets implemented):
 *
 *   (a) Reimplement only the FSRS scheduler with default weights (no optimizer), copied as our
 *       own code — consistent with Didact's registry-based copy-paste model (RF-15), but is
 *       non-trivial numerical verification work (19 weights, stability/difficulty formulas).
 *       References: https://github.com/open-spaced-repetition/fsrs4anki ,
 *       https://borretti.me/article/implementing-fsrs-in-100-lines
 *
 *   (b) Adopt `ts-fsrs` (MIT, native TypeScript, no heavy runtime dependencies, doesn't persist
 *       anything — the same contract RF-2 requires) as a PINNED EXTERNAL DEPENDENCY with an exact
 *       version + drift test, under the same pattern RNF-5 already requires for Radix UI (see
 *       `@didact/validators/drift`). Reference: https://github.com/open-spaced-repetition/ts-fsrs
 *       Note from research.md: `ts-fsrs` is a multi-module package published on npm, not a
 *       trivial file to copy — hence why it's treated as a pinned dependency, not copy-paste.
 *
 * Neither path is decided in Phase 1. This file fixes the type contract so that, whichever path
 * is chosen in Phase 4, the rest of the library (and its consumers) don't need to know which one
 * — exactly the purpose of the agnostic interface in `types.ts`.
 *
 * STATUS: documented stub. No implementation yet (ROADMAP Phase 4).
 */

import type {
  ReviewGrade,
  ReviewResult,
  ReviewState,
  SpacedRepetitionScheduler,
} from "./types";

/**
 * Internal shape of FSRS state (research.md P4, algorithm table): Stability, Difficulty, number
 * of repetitions, number of lapses (failures), and the date of the last review.
 */
export interface FSRSState extends ReviewState {
  /** Memory stability (S). */
  stability: number;
  /** Card difficulty (D). */
  difficulty: number;
  /** Total repetitions. */
  reps: number;
  /** Total lapses (failures). */
  lapses: number;
  /** Date of the last review, to compute the elapsed interval in `schedule`. */
  lastReviewedAt: Date | null;
}

/**
 * FSRS scheduler. Implementation pending (Phase 4) — the choice between reimplementing the
 * scheduler by hand (path a) or adopting `ts-fsrs` as a pinned dependency (path b) is made at
 * that point, not in this scaffold.
 */
export const fsrsScheduler: SpacedRepetitionScheduler = {
  createInitialState(): FSRSState {
    return {
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      lastReviewedAt: null,
    };
  },

  schedule(_state: ReviewState, _grade: ReviewGrade, _now?: Date): ReviewResult {
    throw new Error(
      "@didact/spaced-repetition/fsrs: implementation pending (ROADMAP Phase 4). " +
        "See research.md P4 and the two paths documented in this file (own scheduler vs. pinned ts-fsrs).",
    );
  },
};
