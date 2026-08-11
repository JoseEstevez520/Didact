import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "../lib/cn.js";

/**
 * Checkbox -- a two-state (or indeterminate) checkbox, ported from the same reference kit as Button
 * (see button.tsx's header comment). Backed by `radix-ui`'s `Checkbox` (the unified `radix-ui`
 * package, same import style as Toggle/ToggleGroup), which owns `aria-checked`/`data-state` and
 * keyboard toggling. Standard Tailwind utilities reading `@didact/theme`'s tokens, the same
 * `data-slot` attributes, and the same class structure as the reference.
 *
 * Two deviations from the reference source, both matching conventions already established in this
 * kit rather than the reference's own environment:
 * - the `cn` import path (`../lib/cn.js`), as in every other primitive here;
 * - the checked indicator is an inline SVG check instead of an icon-library import, exactly as
 *   `flashcard.tsx` inlines its own icons -- Didact's kit deliberately ships no icon-library
 *   dependency.
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className="size-3.5"
        >
          <path d="M3 8.5 6.5 12 13 4.5" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
