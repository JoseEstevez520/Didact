# shadcn/ui Visual Reference (authoritative)

> Didact's components must **look and behave like shadcn/ui** (product decision, 2026-08-11).
> shadcn is our visual-style reference, not a dependency. This document captures shadcn's real
> design language so we build against verified values, not guesses. Everything here was pulled
> from the live source on 2026-08-11: tokens from https://ui.shadcn.com/docs/theming and the Badge
> component from the `shadcn-ui/ui` repo (`apps/v4/registry/new-york-v4/ui/badge.tsx`), plus a live
> inspection of ui.shadcn.com via browser automation.
>
> Verify against ui.shadcn.com with Claude in Chrome whenever building or reviewing a component.

## 1. Design tokens (default "neutral" theme, Tailwind v4 / OKLCH)

These are shadcn's exact defaults. Didact's `@didact/theme` mirrors this semantic set (keeping our
`--didact-*` naming as the override contract), plus a11y-specific status tokens on top.

### `:root` (light)
```
--radius: 0.625rem;
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0 0);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.97 0 0);
--secondary-foreground: oklch(0.205 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--accent: oklch(0.97 0 0);
--accent-foreground: oklch(0.205 0 0);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);
```

### `.dark`
```
--background: oklch(0.145 0 0);
--foreground: oklch(0.985 0 0);
--card: oklch(0.205 0 0);
--card-foreground: oklch(0.985 0 0);
--popover: oklch(0.205 0 0);
--popover-foreground: oklch(0.985 0 0);
--primary: oklch(0.922 0 0);
--primary-foreground: oklch(0.205 0 0);
--secondary: oklch(0.269 0 0);
--secondary-foreground: oklch(0.985 0 0);
--muted: oklch(0.269 0 0);
--muted-foreground: oklch(0.708 0 0);
--accent: oklch(0.269 0 0);
--accent-foreground: oklch(0.985 0 0);
--destructive: oklch(0.704 0.191 22.216);
--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
--ring: oklch(0.556 0 0);
```

### Radius scale (derived from `--radius`)
```
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

**Takeaways for the look:** near-monochrome neutral palette; foreground is near-black
(`0.145`), primary is dark gray (`0.205`) not a saturated brand color; secondary/muted/accent are
the same very light gray (`0.97`); borders are a light gray (`0.922`); the focus ring is a mid
gray (`0.708`) used at ~50% opacity. Restrained, low-chroma, high-contrast.

## 2. Component anatomy — Badge (verbatim from source)

```
base:
  inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden
  rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap
  transition-[color,box-shadow]
  focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
  aria-invalid:border-destructive aria-invalid:ring-destructive/20
  [&>svg]:pointer-events-none [&>svg]:size-3

variants:
  default:     bg-primary text-primary-foreground [a&]:hover:bg-primary/90
  secondary:   bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90
  destructive: bg-destructive text-white focus-visible:ring-destructive/20 ...
  outline:     border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground
  ghost:       [a&]:hover:bg-accent [a&]:hover:text-accent-foreground
  link:        text-primary underline-offset-4 [a&]:hover:underline
```

**Key facts:** pill shape (`rounded-full`), tiny padding (`px-2 py-0.5`), `text-xs font-medium`,
`gap-1`, transparent border by default, icons forced to `size-3`. Focus is a **3px ring at 50%
opacity** (`ring-ring/50 ring-[3px]`) plus a solid ring-colored border — NOT a 2px outline with
offset. Variants are neutral (primary/secondary/outline/ghost/link), never green/orange status
colors.

## 3. The shadcn model we must replicate (style customization)

shadcn's defining property — **every component is fully style-customizable** — is a requirement
Didact must carry forward, not just an aesthetic. It comes from four layered mechanisms; each
Didact component MUST support them:

1. **CSS-variable theming.** Nothing is hardcoded; colors/radius/etc. come from tokens on `:root`
   (and `.dark`). A consumer re-themes the whole library by overriding variables — no component
   edits. (Didact: the `--didact-*` contract in `@didact/theme`, RF-16.)
2. **`cva` variants + `size`.** Each component exposes named `variant` (and usually `size`) props
   built with `class-variance-authority`, so callers pick a look without writing CSS.
3. **`className` passthrough + `cn()` merge.** Every component accepts `className` and merges it
   last (via `tailwind-merge`), so any single instance can be overridden/extended inline.
4. **`asChild` / Slot.** Components can render as a different element/child (Radix `Slot`),
   so the style travels onto the consumer's own element.

Plus the distribution model: **copy-paste ownership** via the registry (the consumer owns the
source and can edit it freely). Didact already adopts this (Phase 1 P1). Together these are what
"customizable like shadcn" means — bake all of them into every Didact component from Phase 4 on.

## 4. How to verify a Didact component against shadcn

1. `pnpm --filter @didact/docs storybook` (dev server on :6006).
2. With Claude in Chrome: open the component's story and ui.shadcn.com side by side; compare
   radius, padding, text size/weight, border, focus ring, palette. Screenshot both.
3. Confirm the four customization mechanisms in §3 are present (variant/size, className merge,
   token-driven colors, asChild where it makes sense).
