import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` -- the shadcn/ui class-composition helper (docs/shadcn-visual-reference.md §3.3):
 * `clsx` resolves conditional/array/falsy class inputs, `tailwind-merge` then resolves conflicting
 * Tailwind utilities (e.g. a caller's `className="px-4"` overriding this component's own `px-2`)
 * by keeping the last one instead of leaving both in the DOM. Every Didact component that accepts
 * `className` must merge it LAST through this helper, not a manual array-join, so a single
 * instance can be restyled inline the same way it works in shadcn.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
