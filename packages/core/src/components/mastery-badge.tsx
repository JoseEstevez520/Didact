import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.js";

/**
 * MasteryBadge -- the trivial component that proves the ROADMAP.md Phase 3 scaffold end to end
 * (build, test, Storybook, registry, copy mechanism) before Phase 4 builds the real inventory in
 * design.md §5. It is named `MasteryBadge` in that same diagram (design.md §2), which is why this
 * component -- not an arbitrary generic Badge -- was picked as the proof.
 *
 * Visual style (product decision, 2026-08-11): pill shape (`rounded-full`), tiny padding
 * (`px-2 py-0.5`), `text-xs font-medium`, transparent border, and a 3px/50%-opacity focus ring --
 * not the old 2px outline+offset (owner-rejected the previous look). Anatomy, class list, and
 * variants below implement Didact's neutral visual language, see `docs/visual-language.md`
 * (shape/scale and focus sections).
 *
 * Layer 2 (styled layer, design.md §2): Tailwind v4 utilities + `cva` variants over
 * `@didact/theme`'s CSS custom properties (`--didact-primary`, `--didact-secondary`,
 * `--didact-border`, `--didact-ring`, etc.). No Radix/layer-1 primitive is used here on purpose --
 * a static or toggle-only badge needs no focus trap, portal, or roving tabindex behavior, so
 * pulling in a headless primitive for it would add a real dependency (RNF-5's
 * pinned-and-drift-tested kind) for no accessibility benefit (see packages/core/README.md and
 * research.md Question 2).
 *
 * Accessibility (RF-12, "not color-only"): every level renders its own text label
 * (Beginner/Intermediate/Advanced), never only a color swatch -- WCAG 1.4.1 Use of Color. The
 * palette itself is also neutral only (no green/orange status colors on the badge, per
 * `docs/visual-language.md`'s badge guidance), so level is never implied by hue either. The
 * optional `interactive` mode renders a native `<button>` (keyboard-operable, focusable, with
 * `aria-pressed`) instead of a `<div onClick>`, and its focus-visible style reads `--didact-ring`
 * (WCAG 2.4.7).
 *
 * Styling reads the tokens through Tailwind v4's `[type:var(--x)]` arbitrary-value syntax
 * (e.g. `bg-[color:var(--didact-primary)]`) instead of named theme-scale utilities like
 * `bg-didact-primary`. This was a deliberate correction made during the Phase 3 registry copy
 * proof (ROADMAP.md block F): `@didact/theme`'s own `@theme` block (which registers those named
 * utilities) is only guaranteed present for a consumer who imports the `@didact/theme` package
 * directly. A consumer who instead copies this component through Didact's registry only receives
 * the raw `--didact-*` custom properties via the item's `cssVars.theme` (verified empirically --
 * `packages/registry/registry.json`'s comment on this item has the detail), not necessarily a
 * matching `@theme` alias. Reading the raw variable directly works in both cases and removes the
 * dependency on the registry CLI's `cssVars` auto-aliasing heuristic (which only auto-generates a
 * `--color-*` alias for values that look like colors, and does nothing for `--radius-*`/
 * `--font-*`-shaped tokens -- confirmed by inspecting its output, not assumed; see
 * `packages/registry/README.md` for the full empirical writeup).
 *
 * Customization (see `docs/design-principles.md` §2-3): this component accepts `variant` (a named
 * `cva` look) and `className`, merged LAST via `cn()` (`clsx` + `tailwind-merge`, see
 * `../lib/cn.ts`) so a single instance can be restyled inline without fighting the base classes.
 */

const masteryLevels = ["beginner", "intermediate", "advanced"] as const;

export type MasteryLevel = (typeof masteryLevels)[number];

const masteryLevelLabel: Record<MasteryLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Default `variant` per mastery `level` when no explicit `variant` prop is given. Neutral
 *  mapping only -- no color implies "better" or "worse" (WCAG 1.4.1). */
const masteryLevelDefaultVariant: Record<MasteryLevel, "default" | "secondary" | "outline"> = {
  beginner: "secondary",
  intermediate: "default",
  advanced: "outline",
};

const masteryBadgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden",
    "rounded-full border border-transparent px-2 py-0.5",
    "text-xs font-medium whitespace-nowrap",
    "transition-[color,box-shadow] duration-[var(--didact-motion-duration)]",
    "focus-visible:border-[color:var(--didact-ring)] focus-visible:ring-[3px]",
    "focus-visible:ring-[color:var(--didact-ring)]/50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[color:var(--didact-primary)]",
          "text-[color:var(--didact-primary-foreground)]",
        ].join(" "),
        secondary: [
          "bg-[color:var(--didact-secondary)]",
          "text-[color:var(--didact-secondary-foreground)]",
        ].join(" "),
        outline: [
          "border-[color:var(--didact-border)]",
          "text-[color:var(--didact-foreground)]",
        ].join(" "),
      },
      interactive: {
        true: [
          "cursor-pointer select-none",
          "focus-visible:outline-none",
          "hover:opacity-90",
        ].join(" "),
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
    },
  },
);

const masteryBadgeFontFamily = "var(--didact-font-sans)";

export interface MasteryBadgeProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onClick">,
    Omit<VariantProps<typeof masteryBadgeVariants>, "variant"> {
  /** Mastery tier this badge represents. Always rendered as text, never color-only. */
  level: MasteryLevel;
  /**
   * Named visual variant (`default` | `secondary` | `outline`). Defaults from `level`
   * (beginner -> secondary, intermediate -> default, advanced -> outline) but can be set
   * explicitly to override that mapping -- this is the customization hook described in
   * `docs/design-principles.md` §2.
   */
  variant?: "default" | "secondary" | "outline";
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
    { level, variant, percent, interactive = false, className, style, ...props },
    ref,
  ) {
    const [expanded, setExpanded] = React.useState(false);
    const resolvedVariant = variant ?? masteryLevelDefaultVariant[level];
    const label = masteryLevelLabel[level];
    const summary = describeMastery(level, percent);
    const classes = cn(masteryBadgeVariants({ variant: resolvedVariant, interactive }), className);
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
            style={{ color: "var(--didact-muted-foreground)" }}
          >
            {Math.max(0, Math.min(100, Math.round(percent)))}% mastery
          </span>
        ) : null}
      </button>
    );
  },
);
