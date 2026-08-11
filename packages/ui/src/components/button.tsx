import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "../lib/cn.js";

/**
 * Button -- the foundational action primitive of `@didact/ui` (layers 1-2 of the 3-layer
 * architecture, design.md §2). Ported faithfully from a proven, widely-used headless-primitives +
 * Tailwind + `cva` reference kit (the same style/architecture reference `requirements.md` §0.2
 * names for the distribution model) rather than invented from scratch: same variant/size set, same
 * class structure, same `data-slot`/`data-variant`/`data-size` attributes, same `asChild`/Slot
 * escape hatch -- only the token source changed, from that reference's own CSS variables to
 * `@didact/theme`'s `--didact-*` tokens, read through Tailwind v4's arbitrary-value syntax
 * (`bg-[color:var(--didact-primary)]`) for the same reason documented in mastery-badge.tsx: a
 * consumer who copies this component through Didact's registry only receives the raw `--didact-*`
 * custom properties via the item's `cssVars.theme`, not necessarily a matching `@theme` alias.
 *
 * Variants (docs/interface-norms.md, Action hierarchy): `default` is the one primary action per
 * view; `secondary`/`outline` are secondary actions; `ghost` is tertiary/low-emphasis; `link` is
 * navigation-like; `destructive` is a destructive action. Never render two `default` buttons
 * side by side -- see that doc for the full rule.
 *
 * Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` -- the icon sizes are
 * square (`size-*`) with no text padding, for icon-only buttons that still need an accessible name
 * via `aria-label`.
 *
 * `asChild` (docs/design-principles.md §4): when true, Button renders its classes and behavior
 * onto the single child element (via Radix's `Slot`) instead of wrapping it in a `<button>` -- the
 * mechanism that lets Didact's button styling travel onto a router `<Link>` or any other custom
 * element that already owns its own semantics.
 */

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--didact-radius-md)] text-sm font-medium outline-none",
    "transition-all duration-[var(--didact-motion-duration)]",
    "focus-visible:border-[color:var(--didact-ring)] focus-visible:ring-[3px]",
    "focus-visible:ring-[color:var(--didact-ring)]/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-[color:var(--didact-destructive)] aria-invalid:ring-[color:var(--didact-destructive)]/20",
    "dark:aria-invalid:ring-[color:var(--didact-destructive)]/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[color:var(--didact-primary)] text-[color:var(--didact-primary-foreground)]",
          "hover:bg-[color:var(--didact-primary)]/90",
        ].join(" "),
        destructive: [
          "bg-[color:var(--didact-destructive)] text-[color:var(--didact-destructive-foreground)]",
          "hover:bg-[color:var(--didact-destructive)]/90",
          "focus-visible:ring-[color:var(--didact-destructive)]/20",
          "dark:bg-[color:var(--didact-destructive)]/60 dark:focus-visible:ring-[color:var(--didact-destructive)]/40",
        ].join(" "),
        outline: [
          "border border-[color:var(--didact-border)] bg-[color:var(--didact-background)]",
          "shadow-[var(--didact-shadow-xs)]",
          "hover:bg-[color:var(--didact-accent)] hover:text-[color:var(--didact-accent-foreground)]",
          "dark:border-[color:var(--didact-input)] dark:bg-[color:var(--didact-input)]/30 dark:hover:bg-[color:var(--didact-input)]/50",
        ].join(" "),
        secondary: [
          "bg-[color:var(--didact-secondary)] text-[color:var(--didact-secondary-foreground)]",
          "hover:bg-[color:var(--didact-secondary)]/80",
        ].join(" "),
        ghost: [
          "hover:bg-[color:var(--didact-accent)] hover:text-[color:var(--didact-accent-foreground)]",
          "dark:hover:bg-[color:var(--didact-accent)]/50",
        ].join(" "),
        link: "text-[color:var(--didact-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-[var(--didact-radius-md)] px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[var(--didact-radius-md)] px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-[var(--didact-radius-md)] px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-[var(--didact-radius-md)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /** Render onto the single child element instead of a `<button>` (docs/design-principles.md §4). */
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
