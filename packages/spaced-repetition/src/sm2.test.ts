import { describe, expect, it } from "vitest";

import {
  sm2Scheduler,
  SM2_GRADE_TO_QUALITY,
  SM2_INITIAL_EASINESS_FACTOR,
  SM2_MINIMUM_EASINESS_FACTOR,
  type SM2State,
} from "./sm2";
import type { ReviewGrade } from "./types";

const NOW = new Date("2026-08-11T00:00:00.000Z");
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Number of whole days between `now` and a scheduled `dueAt`. */
function daysUntil(dueAt: Date, now: Date = NOW): number {
  return Math.round((dueAt.getTime() - now.getTime()) / MS_PER_DAY);
}

describe("sm2Scheduler.createInitialState", () => {
  it("starts a new card with 0 repetitions, the initial EF, and a 0-day interval", () => {
    expect(sm2Scheduler.createInitialState()).toEqual({
      repetitions: 0,
      easinessFactor: SM2_INITIAL_EASINESS_FACTOR,
      intervalDays: 0,
    });
  });

  it("returns a fresh object each call (no shared mutable state)", () => {
    const a = sm2Scheduler.createInitialState();
    const b = sm2Scheduler.createInitialState();
    expect(a).not.toBe(b);
  });
});

describe("SM2_GRADE_TO_QUALITY mapping", () => {
  it("maps again/hard below the q=3 success threshold and good/easy at or above it", () => {
    expect(SM2_GRADE_TO_QUALITY.again).toBe(0);
    expect(SM2_GRADE_TO_QUALITY.hard).toBe(2);
    expect(SM2_GRADE_TO_QUALITY.good).toBe(4);
    expect(SM2_GRADE_TO_QUALITY.easy).toBe(5);
    expect(SM2_GRADE_TO_QUALITY.again).toBeLessThan(3);
    expect(SM2_GRADE_TO_QUALITY.hard).toBeLessThan(3);
    expect(SM2_GRADE_TO_QUALITY.good).toBeGreaterThanOrEqual(3);
    expect(SM2_GRADE_TO_QUALITY.easy).toBeGreaterThanOrEqual(3);
  });
});

describe("sm2Scheduler.schedule -- interval progression on success", () => {
  it("uses I(1) = 1 day on the first successful review", () => {
    const initial = sm2Scheduler.createInitialState();
    const { state, dueAt } = sm2Scheduler.schedule(initial, "good", NOW);
    const next = state as SM2State;

    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(daysUntil(dueAt)).toBe(1);
  });

  it("uses I(2) = 6 days on the second consecutive successful review", () => {
    let state = sm2Scheduler.createInitialState();
    state = sm2Scheduler.schedule(state, "good", NOW).state;
    const { state: after, dueAt } = sm2Scheduler.schedule(state, "good", NOW);
    const next = after as SM2State;

    expect(next.repetitions).toBe(2);
    expect(next.intervalDays).toBe(6);
    expect(daysUntil(dueAt)).toBe(6);
  });

  it("uses I(n) = round(I(n-1) * EF) from the third successful review on", () => {
    let state: SM2State = sm2Scheduler.createInitialState() as SM2State;
    // Two "good" reviews leave EF unchanged at 2.5 (good, q=4, gives a +0 EF delta).
    state = sm2Scheduler.schedule(state, "good", NOW).state as SM2State;
    state = sm2Scheduler.schedule(state, "good", NOW).state as SM2State;
    expect(state.intervalDays).toBe(6);
    expect(state.easinessFactor).toBeCloseTo(2.5, 10);

    const third = sm2Scheduler.schedule(state, "good", NOW).state as SM2State;
    // round(6 * 2.5) = 15
    expect(third.repetitions).toBe(3);
    expect(third.intervalDays).toBe(15);
  });
});

describe("sm2Scheduler.schedule -- easiness factor updates", () => {
  it("leaves EF unchanged for a 'good' (q=4) grade", () => {
    const initial = sm2Scheduler.createInitialState();
    const next = sm2Scheduler.schedule(initial, "good", NOW).state as SM2State;
    expect(next.easinessFactor).toBeCloseTo(2.5, 10);
  });

  it("raises EF for an 'easy' (q=5) grade by +0.1", () => {
    const initial = sm2Scheduler.createInitialState();
    const next = sm2Scheduler.schedule(initial, "easy", NOW).state as SM2State;
    expect(next.easinessFactor).toBeCloseTo(2.6, 10);
  });

  it("lowers EF for a 'hard' (q=2) grade", () => {
    const initial = sm2Scheduler.createInitialState();
    const next = sm2Scheduler.schedule(initial, "hard", NOW).state as SM2State;
    // 2.5 + (0.1 - 3*(0.08 + 3*0.02)) = 2.5 - 0.32 = 2.18
    expect(next.easinessFactor).toBeCloseTo(2.18, 10);
  });

  it("lowers EF sharply for an 'again' (q=0) grade", () => {
    const initial = sm2Scheduler.createInitialState();
    const next = sm2Scheduler.schedule(initial, "again", NOW).state as SM2State;
    // 2.5 + (0.1 - 5*(0.08 + 5*0.02)) = 2.5 - 0.8 = 1.7
    expect(next.easinessFactor).toBeCloseTo(1.7, 10);
  });

  it("never lets EF fall below the 1.3 floor, however many failures accumulate", () => {
    let state = sm2Scheduler.createInitialState();
    for (let i = 0; i < 10; i += 1) {
      state = sm2Scheduler.schedule(state, "again", NOW).state;
    }
    expect((state as SM2State).easinessFactor).toBe(SM2_MINIMUM_EASINESS_FACTOR);
    expect((state as SM2State).easinessFactor).toBeGreaterThanOrEqual(SM2_MINIMUM_EASINESS_FACTOR);
  });
});

describe("sm2Scheduler.schedule -- failure resets the schedule", () => {
  it("resets repetitions to 0 and the interval to 1 day on a failing grade", () => {
    // Build up a card to repetitions=3 / a long interval first.
    let state = sm2Scheduler.createInitialState();
    state = sm2Scheduler.schedule(state, "good", NOW).state;
    state = sm2Scheduler.schedule(state, "good", NOW).state;
    state = sm2Scheduler.schedule(state, "good", NOW).state;
    expect((state as SM2State).repetitions).toBe(3);

    const { state: failed, dueAt } = sm2Scheduler.schedule(state, "again", NOW);
    const next = failed as SM2State;
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
    expect(daysUntil(dueAt)).toBe(1);
  });

  it("treats 'hard' (q=2) as a failure for repetition/interval purposes", () => {
    let state = sm2Scheduler.createInitialState();
    state = sm2Scheduler.schedule(state, "good", NOW).state;
    const next = sm2Scheduler.schedule(state, "hard", NOW).state as SM2State;
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
  });
});

describe("sm2Scheduler.schedule -- purity and determinism", () => {
  it("does not mutate the input state", () => {
    const initial = sm2Scheduler.createInitialState();
    const snapshot = { ...initial };
    sm2Scheduler.schedule(initial, "good", NOW);
    expect(initial).toEqual(snapshot);
  });

  it("is deterministic: same (state, grade, now) yields an equal result", () => {
    const initial = sm2Scheduler.createInitialState();
    const a = sm2Scheduler.schedule(initial, "good", NOW);
    const b = sm2Scheduler.schedule(initial, "good", NOW);
    expect(a.state).toEqual(b.state);
    expect(a.dueAt.getTime()).toBe(b.dueAt.getTime());
  });

  it("computes dueAt relative to the provided `now`", () => {
    const initial = sm2Scheduler.createInitialState();
    const now = new Date("2030-01-01T12:00:00.000Z");
    const { dueAt } = sm2Scheduler.schedule(initial, "good", now);
    expect(dueAt.getTime()).toBe(now.getTime() + MS_PER_DAY);
  });

  it("throws a clear error when handed state that is not SM-2 state", () => {
    expect(() => sm2Scheduler.schedule({ foo: "bar" }, "good", NOW)).toThrow(/not SM-2 state/);
  });
});

describe("sm2Scheduler.preview", () => {
  it("previews all four grades without mutating the input, matching schedule() exactly", () => {
    const initial = sm2Scheduler.createInitialState();
    const snapshot = { ...initial };
    const preview = sm2Scheduler.preview?.(initial, NOW);

    expect(preview).toBeDefined();
    expect(initial).toEqual(snapshot);

    const grades: ReviewGrade[] = ["again", "hard", "good", "easy"];
    for (const grade of grades) {
      const direct = sm2Scheduler.schedule(initial, grade, NOW);
      expect(preview?.[grade].state).toEqual(direct.state);
      expect(preview?.[grade].dueAt.getTime()).toBe(direct.dueAt.getTime());
    }
  });
});
