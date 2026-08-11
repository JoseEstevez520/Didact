import * as React from "react";

import { cn } from "../lib/cn.js";

/**
 * Input -- a single-line text field, ported verbatim from the same reference kit as Button (see
 * button.tsx's header comment for the porting rationale). It is a styled native `<input>` with no
 * headless-primitive behind it (a text field needs none): standard Tailwind utilities reading
 * `@didact/theme`'s tokens (`border-input`, `bg-transparent`, `text-foreground`, the shared
 * focus-ring and `aria-invalid` treatments), the same `data-slot="input"` attribute, and the same
 * class structure as the reference. The only change from the reference source is the `cn` import
 * path.
 *
 * Accessibility: pair every Input with a `Label` (label.tsx) via `htmlFor`/`id`, and drive its
 * error state with `aria-invalid` + real error text referenced by `aria-describedby` (never the
 * red ring alone) -- docs/interface-norms.md "Focus & states".
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
