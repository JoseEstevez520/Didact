import * as React from "react";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@didact/ui";
import {
  sm2Scheduler,
  type ReviewGrade,
  type ReviewResult,
  type ReviewState,
  type SpacedRepetitionScheduler,
} from "@didact/spaced-repetition";

import { cn } from "../lib/cn.js";
import { Flashcard, type FlashcardStatus } from "./flashcard.js";

/**
 * SpacedRepetitionDeck (RF-2) -- sequences a set of cards through a single review pass, showing the
 * current card as a `Flashcard` and, when the learner rates it, advancing to the next card while
 * asking a `SpacedRepetitionScheduler` (SM-2 by default) what the card's next review state and due
 * date should be.
 *
 * Presentation-only, no persistence (RF-2, the same contract the scheduler itself keeps): the deck
 * NEVER stores anything across sessions. It reads each card's optional incoming `state`, computes
 * the next `ReviewResult` with the scheduler (a pure function), and hands that result to the
 * consumer via `onReview` -- the consuming project decides where to persist it (localStorage, a
 * database, nowhere). Ordering is a straight pass over the `cards` array in the order given;
 * reordering by due date requires persisted state and therefore belongs to the consumer, not to a
 * presentation component.
 *
 * Composition (docs/interface-norms.md): the deck is a thin layout around `@didact/ui` primitives
 * and the existing `Flashcard` -- a progress line, the current `Flashcard`, and `Card`-based empty
 * and completion states. It adds no bespoke button/card styling of its own; every control is a
 * `@didact/ui` `Button` following the Action hierarchy (one primary action per view).
 *
 * Controlled / uncontrolled (same pattern as `Flashcard`): `index` is the position in the deck.
 * Pass it (updating from `onIndexChange`) to own the position yourself, or leave it out and let the
 * deck track its own, seeded from `defaultIndex`. `index === cards.length` is the terminal
 * "review complete" state.
 *
 * Rating -> grade: the `Flashcard`'s two-way "Known" / "Needs review" rating is mapped to the
 * scheduler's four-grade vocabulary via `gradeForStatus` (default: known -> "good", review ->
 * "again"). A consumer that wants finer control (e.g. review -> "hard") can pass its own mapping.
 *
 * Accessibility:
 * - The progress line is a `role="status"` `aria-live="polite"` region, so advancing to the next
 *   card is announced to screen-reader users without stealing focus (WCAG 4.1.3 Status Messages).
 * - All state is conveyed as text ("Card 2 of 5", "Review complete"), never color alone (RF-12,
 *   WCAG 1.4.1). The `Flashcard`'s own rating control keeps its icon+text treatment.
 * - No animation is introduced by the deck itself (RF-13/RF-14: advancing must not fling content
 *   around); the only motion in view is the `Flashcard`'s own reduced-motion-aware flip.
 */

/** A single card in the deck. `state` is the card's incoming opaque review state, if the consumer
 *  has one persisted; omit it for a card being seen for the first time. */
export interface SpacedRepetitionCard {
  /** Stable identity of the card. Changing card at a position remounts the `Flashcard` fresh. */
  id: string;
  /** Front (question) face, passed straight to `Flashcard`. */
  front: React.ReactNode;
  /** Back (answer) face, passed straight to `Flashcard`. */
  back: React.ReactNode;
  /** Opaque review state to seed the scheduler with; defaults to a brand-new state if omitted. */
  state?: ReviewState;
}

/** Payload handed to `onReview` each time the learner rates a card. */
export interface SpacedRepetitionReview {
  /** The card that was rated. */
  card: SpacedRepetitionCard;
  /** Its position in the deck. */
  index: number;
  /** The `Flashcard` rating the learner picked. */
  status: FlashcardStatus;
  /** The scheduler grade `status` was mapped to. */
  grade: ReviewGrade;
  /** The scheduler's result: the next opaque state to persist and the next due date. */
  result: ReviewResult;
}

const defaultGradeForStatus = (status: FlashcardStatus): ReviewGrade =>
  status === "known" ? "good" : "again";

export interface SpacedRepetitionDeckProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  /** The cards to review, in order. An empty array renders the empty state. */
  cards: SpacedRepetitionCard[];
  /** Scheduler to use. Defaults to the built-in SM-2 scheduler (`@didact/spaced-repetition`). */
  scheduler?: SpacedRepetitionScheduler;
  /** Controlled current index. `cards.length` means the deck is complete. */
  index?: number;
  /** Initial index for uncontrolled usage. Ignored once `index` is provided. Default 0. */
  defaultIndex?: number;
  /** Fires when the current index changes (advancing, or restarting from the completion state). */
  onIndexChange?: (index: number) => void;
  /** Maps a `Flashcard` rating to a scheduler grade. Default: known -> "good", review -> "again". */
  gradeForStatus?: (status: FlashcardStatus) => ReviewGrade;
  /** Fires when the learner rates a card, with the card, its rating/grade, and the scheduler result. */
  onReview?: (review: SpacedRepetitionReview) => void;
  /** Fires once when the last card has been rated and the deck reaches its complete state. */
  onComplete?: () => void;
  /** Size passed through to the current `Flashcard`. */
  size?: "sm" | "md" | "lg";
}

export const SpacedRepetitionDeck = React.forwardRef<HTMLDivElement, SpacedRepetitionDeckProps>(
  function SpacedRepetitionDeck(
    {
      cards,
      scheduler = sm2Scheduler,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      gradeForStatus = defaultGradeForStatus,
      onReview,
      onComplete,
      size = "md",
      className,
      ...props
    },
    ref,
  ) {
    const isIndexControlled = indexProp !== undefined;
    const [uncontrolledIndex, setUncontrolledIndex] = React.useState(defaultIndex);
    const rawIndex = isIndexControlled ? indexProp : uncontrolledIndex;
    // Clamp into [0, cards.length] so a stale controlled index can't index out of bounds.
    const index = Math.max(0, Math.min(rawIndex, cards.length));

    const setIndex = (next: number) => {
      if (!isIndexControlled) setUncontrolledIndex(next);
      onIndexChange?.(next);
    };

    const isEmpty = cards.length === 0;
    const isComplete = !isEmpty && index >= cards.length;
    const currentCard = isEmpty || isComplete ? undefined : cards[index];

    const handleMark = (status: FlashcardStatus) => {
      if (!currentCard) return;
      const grade = gradeForStatus(status);
      const incomingState = currentCard.state ?? scheduler.createInitialState();
      const result = scheduler.schedule(incomingState, grade);

      onReview?.({ card: currentCard, index, status, grade, result });

      const nextIndex = index + 1;
      setIndex(nextIndex);
      if (nextIndex >= cards.length) onComplete?.();
    };

    const restart = () => setIndex(0);

    if (isEmpty) {
      return (
        <Card
          ref={ref}
          className={cn("w-full max-w-sm", className)}
          data-slot="spaced-repetition-deck"
          data-state="empty"
          {...props}
        >
          <CardHeader>
            <CardTitle>No cards to review</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            There are no cards in this deck right now. Add some cards to start a review session.
          </CardContent>
        </Card>
      );
    }

    if (isComplete) {
      return (
        <div
          ref={ref}
          className={cn("flex w-full max-w-sm flex-col gap-4", className)}
          data-slot="spaced-repetition-deck"
          data-state="complete"
          {...props}
        >
          <p role="status" aria-live="polite" className="text-sm font-medium text-muted-foreground">
            Review complete -- you reviewed all {cards.length}{" "}
            {cards.length === 1 ? "card" : "cards"}.
          </p>
          <Card>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                Nice work. You can run through the deck again whenever you like.
              </p>
              <Button type="button" onClick={restart}>
                Review again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex w-full max-w-sm flex-col gap-4", className)}
        data-slot="spaced-repetition-deck"
        data-state="reviewing"
        {...props}
      >
        <p role="status" aria-live="polite" className="text-sm font-medium text-muted-foreground">
          Card {index + 1} of {cards.length}
        </p>
        <Flashcard
          key={currentCard!.id}
          front={currentCard!.front}
          back={currentCard!.back}
          size={size}
          onMark={handleMark}
        />
      </div>
    );
  },
);
