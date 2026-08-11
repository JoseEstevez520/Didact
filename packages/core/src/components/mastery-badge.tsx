import * as React from "react";
import { Badge } from "@didact/ui";

import { cn } from "../lib/cn.js";

/**
 * MasteryBadge -- the trivial component that proves the ROADMAP.md Phase 3 scaffold end to end
 * (build, test, Storybook, registry, copy mechanism) before Phase 4 builds the real inventory in
 * design.md §5. It is named `MasteryBadge` in that same diagram (design.md §2), which is why this
 * component -- not an arbitrary generic Badge -- was picked as the proof.
 *
 * Rebuilt (2026-08-11, alongside the Flashcard rebuild) to compose from `@didact/ui`'s `Badge`
 * instead of re-declaring its own `cva` class list, per docs/interface-norms.md's "Consequences
 * for authors composing from @didact/ui": both `MasteryBadge` and the generic `Badge` now sit on
 * the same base pill shape (`rounded-full`), padding (`px-2 py-0.5`), `text-xs font-medium`, and
 * 3px/50%-opacity focus ring (docs/visual-language.md, shape/scale and focus sections) --
 * `MasteryBadge` only adds the domain-specific bits `Badge` doesn't know about: `level` ->
 * `variant` defaulting, the mastery-percent summary text, and the optional `interactive`
 * expand-on-click behavior.
 *
 * Layer 2 (styled layer, design.md §2), one level up from before: `Badge` itself is the
 * Tailwind v4 + `cva` styled layer over `@didact/theme`'s CSS custom properties (`--didact-
 * primary`, `--didact-secondary`, `--didact-border`, `--didact-ring`, etc.); `MasteryBadge` is
 * now a thin domain wrapper around it. Still no Radix/layer-1 primitive needed directly here --
 * a static or toggle-only badge needs no focus trap, portal, or roving tabindex behavior (see
 * packages/core/README.md and research.md Question 2) -- `Badge`'s own `asChild`/Slot escape
 * hatch (docs/design-principles.md §4) is what lets the `interactive` mode below render onto a
 * real `<button>` without `MasteryBadge` needing its own Radix dependency.
 *
 * Accessibility (RF-12, "not color-only"): every level renders its own text label
 * (Beginner/Intermediate/Advanced), never only a color swatch -- WCAG 1.4.1 Use of Color. The
 * palette itself is also neutral only (no green/orange status colors on the badge, per
 * `docs/visual-language.md`'s badge guidance), so level is never implied by hue either. The
 * optional `interactive` mode renders a native `<button>` (keyboard-operable, focusable, with
 * `aria-pressed`) instead of a `<div onClick>`, via `Badge`'s `asChild`, and its focus-visible
 * style reads `--didact-ring` (WCAG 2.4.7) the same way the static badge does, since it's the
 * same underlying `Badge` classes either way.
 *
 * Styling: `Badge` itself already reads every color through Tailwind v4's `[type:var(--x)]`
 * arbitrary-value syntax (e.g. `bg-[color:var(--didact-primary)]`) rather than named theme-scale
 * utilities like `bg-didact-primary`, for the reason `packages/registry/README.md`'s "Verified
 * caveats" section documents in detail (a copy-paste consumer only reliably receives the raw
 * `--didact-*` custom properties via the item's `cssVars.theme`, not necessarily a matching
 * `@theme` alias) -- `MasteryBadge` inherits that correctness for free by composing from `Badge`
 * instead of duplicating its class list.
 *
 * Customization (see `docs/design-principles.md` §2-3): this component accepts `variant` (mapped
 * onto `Badge`'s own `variant`) and `className`, merged LAST via `cn()` (`clsx` + `tailwind-
 * merge`, see `../lib/cn.ts`) on top of `Badge`'s own last-merged `className`, so a single
 * instance can still be restyled inline without fighting either component's base classes.
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

/**
 * Extra classes layered on top of `Badge`'s own variant classes when `interactive` -- `Badge`
 * itself has no notion of an interactive/clickable look (a generic badge is read-only by
 * default), so this is the one bit of styling `MasteryBadge` still owns directly, merged in via
 * `cn()` alongside any caller `className` rather than duplicated into a second `cva` block.
 */
const masteryBadgeInteractiveClasses = [
  "cursor-pointer select-none",
  "focus-visible:outline-none",
  "hover:opacity-90",
].join(" ");

const masteryBadgeFontFamily = "var(--didact-font-sans)";

export interface MasteryBadgeProps extends Omit<React.ComponentPropsWithoutRef<"button">, "onClick"> {
  /** Mastery tier this badge represents. Always rendered as text, never color-only. */
  level: MasteryLevel;
  /**
   * Named visual variant (`default` | `secondary` | `outline`), passed straight through to
   * `@didact/ui`'s `Badge`. Defaults from `level` (beginner -> secondary, intermediate -> default,
   * advanced -> outline) but can be set explicitly to override that mapping -- this is the
   * customization hook described in `docs/design-principles.md` §2. `Badge` also supports
   * `destructive`, deliberately not exposed here: no mastery level is ever "destructive".
   */
  variant?: "default" | "secondary" | "outline";
  /**
   * Optional mastery percentage (0-100). Rounded and rendered as `"NN%"` text next to the level
   * label when provided.
   */
  percent?: number;
  /**
   * When true, renders a real `<button>` (via `Badge`'s `asChild`, docs/design-principles.md §4)
   * that toggles a short mastery detail sentence on click (e.g. "62% mastery -- keep practicing"),
   * instead of a static, non-interactive badge. Off by default: most usages (a list of skills, a
   * card header) are read-only status indicators.
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
    const mergedStyle: React.CSSProperties = {
      fontFamily: masteryBadgeFontFamily,
      ...style,
    };

    if (!interactive) {
      return (
        <Badge
          ref={ref as React.Ref<HTMLSpanElement>}
          variant={resolvedVariant}
          className={className}
          style={mergedStyle}
          data-level={level}
        >
          {summary}
        </Badge>
      );
    }

    return (
      <Badge
        asChild
        variant={resolvedVariant}
        className={cn(masteryBadgeInteractiveClasses, className)}
      >
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
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
      </Badge>
    );
  },
);
