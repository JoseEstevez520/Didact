import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as TogglePrimitive from "@radix-ui/react-toggle";

import { cn } from "../lib/cn.js";

/**
 * Toggle -- a two-state pressed/unpressed button, ported from the same reference kit as Button
 * (see button.tsx's header comment). Backed by `@radix-ui/react-toggle`'s `Root`, which manages
 * `aria-pressed`/`data-state` for us. `ToggleGroup`/`ToggleGroupItem` (toggle-group.tsx) reuse
 * `toggleVariants` directly rather than duplicating the class list, matching the reference's own
 * structure.
 */

const toggleVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-[var(--didact-radius-md)]",
    "text-sm font-medium whitespace-nowrap outline-none",
    "transition-[color,box-shadow] duration-[var(--didact-motion-duration)]",
    "hover:bg-[color:var(--didact-muted)] hover:text-[color:var(--didact-muted-foreground)]",
    "focus-visible:border-[color:var(--didact-ring)] focus-visible:ring-[3px]",
    "focus-visible:ring-[color:var(--didact-ring)]/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-[color:var(--didact-destructive)] aria-invalid:ring-[color:var(--didact-destructive)]/20",
    "dark:aria-invalid:ring-[color:var(--didact-destructive)]/40",
    "data-[state=on]:bg-[color:var(--didact-accent)] data-[state=on]:text-[color:var(--didact-accent-foreground)]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: [
          "border border-[color:var(--didact-input)] bg-transparent shadow-[var(--didact-shadow-xs)]",
          "hover:bg-[color:var(--didact-accent)] hover:text-[color:var(--didact-accent-foreground)]",
        ].join(" "),
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
