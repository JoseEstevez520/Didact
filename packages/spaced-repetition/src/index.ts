/**
 * @didact/spaced-repetition — persistence-agnostic spaced-repetition schedulers (RF-2).
 *
 * Public entry point. The package exposes:
 * - the agnostic interface (`SpacedRepetitionScheduler`) plus its `ReviewState`/`ReviewGrade`/
 *   `ReviewResult` vocabulary (see `types.ts`) — the contract retrieval-practice flows
 *   and any consumer program against, without knowing which algorithm is behind it;
 * - `sm2Scheduler` (the default, fully implemented SM-2 arithmetic — see `sm2.ts`);
 * - `fsrsScheduler` (an advanced mode whose numerical implementation is still a documented stub —
 *   see `fsrs.ts`).
 *
 * Nothing here persists anything: a scheduler receives the current opaque state and returns the
 * next one, and the consuming project decides where that state lives.
 */

export type {
  ReviewState,
  ReviewGrade,
  ReviewResult,
  SpacedRepetitionScheduler,
} from "./types.js";

export {
  sm2Scheduler,
  SM2_GRADE_TO_QUALITY,
  SM2_MINIMUM_EASINESS_FACTOR,
  SM2_INITIAL_EASINESS_FACTOR,
  type SM2State,
} from "./sm2.js";

export { fsrsScheduler, type FSRSState } from "./fsrs.js";
