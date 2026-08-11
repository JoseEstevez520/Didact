import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.js";

/**
 * Flashcard -- the first real Phase 4 component (design.md §5 inventory), implementing RF-1: a
 * front/back card with a flip interaction and a "known" / "needs review" mark.
 *
 * Presentation only, no persistence (see `packages/core/README.md`'s layer diagram and
 * `docs/PHILOSOPHY.md` §1): this component holds no scheduling state and does not decide which
 * card to show next or when -- it only renders one card, flips it, and reports what the learner
 * did via `onFlip`/`onMark`. Ordering a deck by a review algorithm (SM-2 or equivalent) is RF-2's
 * `SpacedRepetitionDeck`, a separate, later component that is expected to compose `Flashcard`
 * rather than reimplement it.
 *
 * Controlled / uncontrolled (docs/design-principles.md's customization mechanisms apply to
 * behavior props too, not just style): both `flipped` and `status` follow the standard React
 * pattern -- pass the prop to drive the value yourself (and update it from `onFlip`/`onMark`), or
 * leave it out and let the component track its own state, seeded from `defaultFlipped` /
 * `defaultStatus`. `onFlip`/`onMark` fire in both modes, so a controlled caller always has a
 * signal to react to and an uncontrolled caller can still observe what happened.
 *
 * Flip mechanism: a real 3D transform (`rotateY`), not a crossfade -- the front and back are two
 * faces of one rotating element (`backface-visibility: hidden` on each), stacked in the same grid
 * cell (`col-start-1 row-start-1` on both) so the card's height follows whichever face is
 * currently larger instead of being pinned to the front's height. The rotation duration reads
 * `--didact-motion-duration` (never a hardcoded duration) -- the theme already collapses that
 * token to 0ms under `prefers-reduced-motion` (RF-13, see `packages/theme/src/tokens.css`), so the
 * flip becomes an instant state change with no separate reduced-motion branch needed here. Motion
 * carries no information of its own either way: the flip button's accessible name and the
 * revealed face's presence in the accessibility tree are what convey the state change, not the
 * animation.
 *
 * Accessibility:
 * - The flip control is a real `<button>` (native keyboard support, no custom key handling
 *   needed) whose accessible name states the action available from the current face ("Show
 *   answer" on the front, "Show question" on the back) and whose `aria-pressed` reflects whether
 *   the back is showing -- WCAG 2.1.1 (Keyboard) + 4.1.2 (Name, Role, Value).
 * - Both faces stay mounted (a flashcard's back is meant to be revealed, so keeping it in the DOM
 *   is fine, unlike e.g. Hint/Reveal's answer-leak concern), but the face that is not currently
 *   showing is taken out of the accessibility tree with `aria-hidden` + `inert` (the latter also
 *   stops it from being keyboard-focusable), so a screen-reader or keyboard user only ever
 *   encounters the one face that is visually showing -- no double-announcing, no landing on
 *   content that reads as hidden.
 * - "Known" / "needs review" is a pair of real `<button>`s, each labelled with its own word, and
 *   the currently-marked one additionally renders a checkmark icon (`aria-hidden`, decorative) --
 *   RF-12 / WCAG 1.4.1 Use of Color: the state is carried by text and icon, and only reinforced,
 *   never carried solely, by the background-color change between the two.
 * - Every interactive element's focus style reads `--didact-ring` with the same 3px/50%-opacity
 *   ring plus ring-colored border used across Didact (docs/visual-language.md, "Focus"; see
 *   `mastery-badge.tsx` for the same pattern) -- WCAG 2.4.7.
 *
 * Styling reads every color/radius through `--didact-*` via Tailwind v4's `[type:var(--x)]`
 * arbitrary-value syntax, the same approach `mastery-badge.tsx` documents in detail: a component
 * distributed by copy only reliably receives the raw custom properties (via the registry item's
 * `cssVars.theme`), not necessarily a matching Tailwind `@theme` alias, so reading the variable
 * directly works in both the "imports `@didact/theme`" and "copied through the registry" cases.
 *
 * Customization (docs/design-principles.md §1-3): `variant` (`default` | `outline`) and `size`
 * (`sm` | `md` | `lg`) are `cva`-driven named looks; `className` is merged LAST via `cn()` so a
 * single instance can be restyled inline without fighting the base classes. `asChild` is not
 * offered here -- this component is a stateful interactive widget with its own internal buttons
 * and layout, not a styling wrapper around a single consumer-supplied element (see
 * docs/design-principles.md §4's "where it makes sense" qualifier).
 */

export type FlashcardStatus = "known" | "review";

const flashcardVariants = cva(
  [
    "flex w-full flex-col gap-3 rounded-[var(--didact-radius-lg)] border p-4",
    "text-[color:var(--didact-card-foreground)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-[color:var(--didact-border)]",
          "bg-[color:var(--didact-card)]",
        ].join(" "),
        outline: [
          "border-[color:var(--didact-border)]",
          "bg-transparent",
        ].join(" "),
      },
      size: {
        sm: "max-w-xs",
        md: "max-w-sm",
        lg: "max-w-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const flashcardFaceVariants = cva(
  "col-start-1 row-start-1 flex flex-col items-center justify-center gap-2 text-center [backface-visibility:hidden]",
  {
    variants: {
      size: {
        sm: "min-h-24 p-3 text-sm",
        md: "min-h-32 p-4 text-base",
        lg: "min-h-40 p-5 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const controlButtonClasses = [
  "inline-flex items-center justify-center gap-1.5 rounded-[var(--didact-radius-md)]",
  "border border-[color:var(--didact-border)] bg-[color:var(--didact-secondary)]",
  "px-2.5 py-1 text-xs font-medium text-[color:var(--didact-secondary-foreground)]",
  "transition-[color,background-color,box-shadow] duration-[var(--didact-motion-duration)]",
  "hover:opacity-90 focus-visible:outline-none",
  "focus-visible:border-[color:var(--didact-ring)] focus-visible:ring-[3px]",
  "focus-visible:ring-[color:var(--didact-ring)]/50",
].join(" ");

const flipButtonClasses = cn(controlButtonClasses, "w-full py-1.5 text-sm");

const flashcardFontFamily = "var(--didact-font-sans)";

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

export interface FlashcardProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onClick">,
    VariantProps<typeof flashcardVariants> {
  /** Content shown on the front (question) face. Always in the DOM; see the class doc above. */
  front: React.ReactNode;
  /** Content shown on the back (answer) face. Always in the DOM; see the class doc above. */
  back: React.ReactNode;
  /** Controlled flip state -- when provided, the caller owns whether the back is showing. */
  flipped?: boolean;
  /** Initial flip state for uncontrolled usage. Ignored once `flipped` is provided. */
  defaultFlipped?: boolean;
  /** Fires whenever the flip control is activated, in both controlled and uncontrolled usage. */
  onFlip?: (flipped: boolean) => void;
  /** Controlled mark state -- when provided, the caller owns which mark (if any) is shown. */
  status?: FlashcardStatus;
  /** Initial mark state for uncontrolled usage. Ignored once `status` is provided. */
  defaultStatus?: FlashcardStatus;
  /** Fires whenever a mark control is activated, in both controlled and uncontrolled usage. */
  onMark?: (status: FlashcardStatus) => void;
}

export const Flashcard = React.forwardRef<HTMLDivElement, FlashcardProps>(function Flashcard(
  {
    front,
    back,
    flipped: flippedProp,
    defaultFlipped = false,
    onFlip,
    status: statusProp,
    defaultStatus,
    onMark,
    variant,
    size,
    className,
    style,
    ...props
  },
  ref,
) {
  const isFlippedControlled = flippedProp !== undefined;
  const [uncontrolledFlipped, setUncontrolledFlipped] = React.useState(defaultFlipped);
  const flipped = isFlippedControlled ? flippedProp : uncontrolledFlipped;

  const isStatusControlled = statusProp !== undefined;
  const [uncontrolledStatus, setUncontrolledStatus] = React.useState<FlashcardStatus | undefined>(
    defaultStatus,
  );
  const status = isStatusControlled ? statusProp : uncontrolledStatus;

  const flip = () => {
    const next = !flipped;
    if (!isFlippedControlled) setUncontrolledFlipped(next);
    onFlip?.(next);
  };

  const mark = (next: FlashcardStatus) => {
    if (!isStatusControlled) setUncontrolledStatus(next);
    onMark?.(next);
  };

  const flipLabel = flipped ? "Show question" : "Show answer";
  const mergedStyle: React.CSSProperties = {
    fontFamily: flashcardFontFamily,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cn(flashcardVariants({ variant, size }), className)}
      style={mergedStyle}
      data-flipped={flipped}
      data-status={status ?? "unmarked"}
      {...props}
    >
      <button
        type="button"
        onClick={flip}
        aria-pressed={flipped}
        className={flipButtonClasses}
      >
        {flipLabel}
      </button>

      <div className="[perspective:1000px]">
        <div
          className={cn(
            "grid [transform-style:preserve-3d] transition-transform ease-in-out",
            "duration-[var(--didact-motion-duration)]",
            flipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]",
          )}
        >
          <div
            className={flashcardFaceVariants({ size })}
            aria-hidden={flipped}
            inert={flipped || undefined}
          >
            {front}
          </div>
          <div
            className={cn(flashcardFaceVariants({ size }), "[transform:rotateY(180deg)]")}
            aria-hidden={!flipped}
            inert={!flipped || undefined}
          >
            {back}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => mark("known")}
          aria-pressed={status === "known"}
          className={cn(
            controlButtonClasses,
            status === "known" && [
              "border-transparent bg-[color:var(--didact-primary)]",
              "text-[color:var(--didact-primary-foreground)]",
            ].join(" "),
          )}
        >
          {status === "known" ? <CheckIcon /> : null}
          Known
        </button>
        <button
          type="button"
          onClick={() => mark("review")}
          aria-pressed={status === "review"}
          className={cn(
            controlButtonClasses,
            status === "review" && [
              "border-transparent bg-[color:var(--didact-primary)]",
              "text-[color:var(--didact-primary-foreground)]",
            ].join(" "),
          )}
        >
          {status === "review" ? <CheckIcon /> : null}
          Needs review
        </button>
      </div>
    </div>
  );
});
