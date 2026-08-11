import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "../lib/cn.js";

/**
 * Badge -- a small status/label primitive, ported from the same reference kit as Button (see
 * button.tsx's header comment). Unlike `MasteryBadge` (packages/core, a domain-specific component
 * with a fixed `level` prop and no layer-1 primitive), this is the generic, reusable primitive
 * `@didact/core` components can compose from for any label/tag/status chip that isn't specifically
 * about mastery. Variants: `default`, `secondary`, `destructive`, `outline`.
 */

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden",
    "rounded-full border border-transparent px-2 py-0.5",
    "text-xs font-medium whitespace-nowrap",
    "transition-[color,box-shadow] duration-[var(--didact-motion-duration)]",
    "focus-visible:border-[color:var(--didact-ring)] focus-visible:ring-[3px]",
    "focus-visible:ring-[color:var(--didact-ring)]/50",
    "aria-invalid:border-[color:var(--didact-destructive)] aria-invalid:ring-[color:var(--didact-destructive)]/20",
    "dark:aria-invalid:ring-[color:var(--didact-destructive)]/40",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[color:var(--didact-primary)] text-[color:var(--didact-primary-foreground)]",
          "[a&]:hover:bg-[color:var(--didact-primary)]/90",
        ].join(" "),
        secondary: [
          "bg-[color:var(--didact-secondary)] text-[color:var(--didact-secondary-foreground)]",
          "[a&]:hover:bg-[color:var(--didact-secondary)]/90",
        ].join(" "),
        destructive: [
          "bg-[color:var(--didact-destructive)] text-[color:var(--didact-destructive-foreground)]",
          "focus-visible:ring-[color:var(--didact-destructive)]/20",
          "dark:bg-[color:var(--didact-destructive)]/60 dark:focus-visible:ring-[color:var(--didact-destructive)]/40",
          "[a&]:hover:bg-[color:var(--didact-destructive)]/90",
        ].join(" "),
        outline: [
          "border-[color:var(--didact-border)] text-[color:var(--didact-foreground)]",
          "[a&]:hover:bg-[color:var(--didact-accent)] [a&]:hover:text-[color:var(--didact-accent-foreground)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  /** Render onto the single child element instead of a `<span>` (docs/design-principles.md §4). */
  asChild?: boolean;
}

function Badge({ className, variant = "default", asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
