import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * MasteryBadge -- the trivial component that proves the ROADMAP.md Phase 3 scaffold end to end
 * (build, test, Storybook, registry, copy mechanism) before Phase 4 builds the real inventory in
 * design.md §5. It is named `MasteryBadge` in that same diagram (design.md §2), which is why this
 * component -- not an arbitrary generic Badge -- was picked as the proof.
 *
 * Layer 2 (styled layer, design.md §2): Tailwind v4 utilities + `cva` variants over
 * `@didact/theme`'s CSS custom properties (`--didact-color-*`, `--didact-radius-*`,
 * `--didact-focus-ring`). No Radix/layer-1 primitive is used here on purpose -- a static or
 * toggle-only badge needs no focus trap, portal, or roving tabindex behavior, so pulling in a
 * headless primitive for it would add a real dependency (RNF-5's pinned-and-drift-tested kind)
 * for no accessibility benefit (see packages/core/README.md and research.md Question 2).
 *
 * Accessibility (RF-12, "not color-only"): every level renders its own text label
 * (Beginner/Intermediate/Advanced), never only a color swatch -- WCAG 1.4.1 Use of Color, same
 * rule @didact/theme's tokens.css documents for its status tokens. The optional `interactive`
 * mode renders a native `<button>` (keyboard-operable, focusable, with `aria-pressed`) instead of
 * a `<div onClick>`, and its focus-visible style reads `--didact-focus-ring` (WCAG 2.4.7).
 *
 * Styling reads the tokens through Tailwind v4's `[type:var(--x)]` arbitrary-value syntax
 * (e.g. `bg-[color:var(--didact-color-muted)]`) instead of named theme-scale utilities like
 * `bg-didact-muted`. This was a deliberate correction made during the Phase 3 registry copy
 * proof (ROADMAP.md block F): `@didact/theme`'s own `@theme` block (which registers those named
 * utilities) is only guaranteed present for a consumer who imports the `@didact/theme` package
 * directly. A consumer who instead copies this component through the registry only receives the
 * raw `--didact-*` custom properties via the item's `cssVars.theme` (verified empirically --
 * `packages/registry/registry.json`'s comment on this item has the detail), not necessarily a
 * matching `@theme` alias. Reading the raw variable directly works in both cases and removes the
 * dependency on shadcn's `cssVars` auto-aliasing heuristic (which only auto-generates a
 * `--color-*` alias for values that look like colors, and does nothing for `--radius-*`/
 * `--font-*`-shaped tokens -- confirmed by inspecting its output, not assumed).
 */

const masteryLevels = ["beginner", "intermediate", "advanced"] as const;

export type MasteryLevel = (typeof masteryLevels)[number];

const masteryLevelLabel: Record<MasteryLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const masteryBadgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 border px-2.5 py-1",
    "rounded-[length:var(--didact-radius-md)]",
    "text-sm font-medium leading-none",
    "transition-colors duration-[var(--didact-motion-duration)]",
  ].join(" "),
  {
    variants: {
      level: {
        beginner: [
          "bg-[color:var(--didact-color-muted)]",
          "text-[color:var(--didact-color-muted-fg)]",
          "border-[color:var(--didact-color-border)]",
        ].join(" "),
        intermediate: [
          "bg-[color:var(--didact-color-warning-bg)]",
          "text-[color:var(--didact-color-warning)]",
          "border-[color:var(--didact-color-warning)]",
        ].join(" "),
        advanced: [
          "bg-[color:var(--didact-color-success-bg)]",
          "text-[color:var(--didact-color-success)]",
          "border-[color:var(--didact-color-success)]",
        ].join(" "),
      },
      interactive: {
        true: [
          "cursor-pointer select-none",
          "focus-visible:outline-none",
          "focus-visible:ring-[length:var(--didact-focus-ring-width)]",
          "focus-visible:ring-[color:var(--didact-focus-ring)]",
          "focus-visible:ring-offset-2",
          "hover:brightness-95",
        ].join(" "),
        false: "",
      },
    },
    defaultVariants: {
      level: "beginner",
      interactive: false,
    },
  },
);

const masteryBadgeFontFamily = "var(--didact-font-sans)";

export interface MasteryBadgeProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onClick">,
    VariantProps<typeof masteryBadgeVariants> {
  /** Mastery tier this badge represents. Always rendered as text, never color-only. */
  level: MasteryLevel;
  /**
   * Optional mastery percentage (0-100). Rounded and rendered as `"NN%"` text next to the level
   * label when provided.
   */
  percent?: number;
  /**
   * When true, renders a real `<button>` that toggles a short mastery detail sentence on click
   * (e.g. "62% mastery -- keep practicing"), instead of a static, non-interactive badge. Off by
   * default: most usages (a list of skills, a card header) are read-only status indicators.
   */
  interactive?: boolean;
}

function describeMastery(level: MasteryLevel, percent?: number): string {
  const label = masteryLevelLabel[level];
  if (percent === undefined) return label;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return `${label} -- ${clamped}%`;
}

export const MasteryBadge = React.forwardRef<HTMLButtonElement | HTMLSpanElement, MasteryBadgeProps>(
  function MasteryBadge(
    { level, percent, interactive = false, className, style, ...props },
    ref,
  ) {
    const [expanded, setExpanded] = React.useState(false);
    const label = masteryLevelLabel[level];
    const summary = describeMastery(level, percent);
    const classes = [masteryBadgeVariants({ level, interactive }), className]
      .filter(Boolean)
      .join(" ");
    const mergedStyle: React.CSSProperties = {
      fontFamily: masteryBadgeFontFamily,
      ...style,
    };

    if (!interactive) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          className={classes}
          style={mergedStyle}
          data-level={level}
        >
          {summary}
        </span>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        style={mergedStyle}
        data-level={level}
        aria-pressed={expanded}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        {...props}
      >
        <span>{label}</span>
        {expanded && percent !== undefined ? (
          <span
            className="font-normal"
            style={{ color: "var(--didact-color-muted-fg)" }}
          >
            {Math.max(0, Math.min(100, Math.round(percent)))}% mastery
          </span>
        ) : null}
      </button>
    );
  },
);
