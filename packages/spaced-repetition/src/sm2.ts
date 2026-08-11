/**
 * SM-2 — Didact's default spaced-repetition algorithm.
 *
 * Source: `specs/education-components/research.md` Question 4. Formulas verified against:
 * - https://www.supermemo.com/en/archives1990-2015/english/ol/sm2 (original specification)
 * - https://en.wikipedia.org/wiki/SM-2_(algorithm)
 *
 * Why SM-2 is the default (research.md P4):
 * - ~40-60 lines of pure arithmetic, zero external dependencies.
 * - 35+ years in production (SuperMemo, Anki until 2023, and still an option today).
 * - "Medium" evidence in research.md's table (vs. "high" for FSRS, but FSRS costs 100-250 lines
 *   and an external library choice — see `fsrs.ts`).
 *
 * Algorithm parameters (verified against the sources above):
 * - Initial easiness factor (EF): 2.5, with a floor of 1.3 (never goes below that).
 * - Answer quality rating q in [0,5] in the original specification; this module derives it from
 *   the `ReviewGrade` vocabulary in `types.ts` (again/hard/good/easy) to keep a single rating
 *   scale across the whole library (see the mapping below).
 * - q >= 3 (success): EF is recalculated and the interval (I) grows by multiplying it by EF.
 * - q < 3 (failure): the repetition counter resets and the interval goes back to 1 day.
 *
 * STATUS: documented stub. The full arithmetic implementation is Phase 4 work in `ROADMAP.md`
 * (first wave of components); this file fixes the type contract and reference formulas so that
 * implementation doesn't have to re-research them.
 */

import type {
  ReviewGrade,
  ReviewResult,
  ReviewState,
  SpacedRepetitionScheduler,
} from "./types";

/** Internal shape of SM-2 state, see research.md P4 (algorithm table). */
export interface SM2State extends ReviewState {
  /** Number of consecutive correct repetitions. */
  repetitions: number;
  /** Easiness factor. Initial 2.5, floor 1.3. */
  easinessFactor: number;
  /** Current interval in days until the next review. */
  intervalDays: number;
}

const INITIAL_EASINESS_FACTOR = 2.5;
const MINIMUM_EASINESS_FACTOR = 1.3;

/**
 * Mapping from `ReviewGrade` (the library's common vocabulary) to the q∈[0,5] quality scale of
 * the original SM-2 specification. "again"/"hard" fall below the q=3 threshold (failure, resets
 * repetitions); "good"/"easy" clear it (success, grows the interval).
 */
export const SM2_GRADE_TO_QUALITY: Record<ReviewGrade, number> = {
  again: 0,
  hard: 2,
  good: 4,
  easy: 5,
};

/**
 * SM-2 scheduler. Implementation pending (Phase 4) — for now it throws if invoked, so that
 * accidental use at runtime is explicit instead of returning incorrect data.
 */
export const sm2Scheduler: SpacedRepetitionScheduler = {
  createInitialState(): SM2State {
    return {
      repetitions: 0,
      easinessFactor: INITIAL_EASINESS_FACTOR,
      intervalDays: 0,
    };
  },

  schedule(_state: ReviewState, _grade: ReviewGrade, _now?: Date): ReviewResult {
    throw new Error(
      "@didact/spaced-repetition/sm2: implementation pending (ROADMAP Phase 4). " +
        "Reference formulas and type contract already fixed in this file and in research.md P4.",
    );
  },
};

// Re-exported to record the floor documented in research.md, even though it isn't used yet in
// the implementation branch (avoids it feeling "magic" once schedule() gets implemented).
export const __SM2_MINIMUM_EASINESS_FACTOR = MINIMUM_EASINESS_FACTOR;
