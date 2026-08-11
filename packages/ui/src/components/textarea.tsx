import * as React from "react";

import { cn } from "../lib/cn.js";

/**
 * Textarea -- a multi-line text field, ported verbatim from the same reference kit as Button (see
 * button.tsx's header comment). Like Input (input.tsx) it is a styled native element with no
 * headless primitive behind it: standard Tailwind utilities reading `@didact/theme`'s tokens, the
 * same `data-slot="textarea"` attribute, and the shared focus-ring / `aria-invalid` treatment. The
 * only change from the reference source is the `cn` import path.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
