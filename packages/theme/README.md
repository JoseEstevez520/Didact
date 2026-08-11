# @didact/theme

Didact's neutral default theme (**RF-16**): layer 2 ("styled layer") of the 3-layer architecture
in `specs/education-components/design.md` §2, consumed by `@didact/core`, `@didact/ui`, and by
`apps/docs`. No component should hardcode its own color/size or a specific consumer's (SkillNet
included) -- everything goes through this package's variables.

## Why it exists as a separate package

`design.md` §2 draws layer 2 as "a single place for theming" between the accessible primitives
(layer 1) and the education components (layer 3). Extracting it into its own package (instead of
living inside `@didact/core`) lets `apps/docs` consume it to render the catalog with the exact
same theme any project copying a component will see, without depending on `@didact/core` already
having a real implementation.

## Tailwind v4 (CSS-first)

`src/tokens.css` uses Tailwind v4's CSS-first configuration: `@import "tailwindcss"`, plain CSS
custom properties on `:root`/`.dark`, and an `@theme inline` block that remaps those variables
into Tailwind design tokens. That means:

1. **Plain CSS custom properties** (`:root { --background, --foreground, --primary, ... }`) --
   the level any consumer overrides to restyle, whether or not they use Tailwind (if someone
   copies a component into a project without Tailwind, the variables still work).
2. **An `@theme inline` block** that remaps those variables into Tailwind v4 design tokens
   (`bg-primary`, `text-muted-foreground`, `rounded-xl`, etc.), so components can be written with
   ordinary Tailwind utilities -- the utility still reads the CSS variable from (1).
3. **`@custom-variant dark (&:is(.dark *))`** so `dark:` utilities apply under a `.dark` ancestor
   class rather than only `prefers-color-scheme`, matching how `apps/docs` (and any consumer)
   toggles dark mode.

## Contents of `src/tokens.css`

Didact's visual style is a neutral, low-chroma, high-contrast system. The token set and OKLCH
values are the reference design system's own base palette, used verbatim (not renamed, not
recalculated):

- The full semantic set: `background`/`foreground`, `card`, `popover`, `primary`, `secondary`,
  `muted`, `accent`, `destructive`, `border`, `input`, `ring` (+ `-foreground` pairs where the
  reference defines one), plus a `.dark` block with the matching dark values and the
  `radius`/`radius-sm/md/lg/xl` scale.
- A `@layer base` rule applies `border-border`/`outline-ring/50` to every element and
  `bg-background`/`text-foreground` to `body`, so a consumer gets sensible base styling for free.

## Dependencies

`tailwindcss` as a devDependency, pinned version (RNF-5).

## Status

Didact's default theme, consumed as-is by `@didact/ui` and `@didact/core`. `packages/registry`'s
`cssVars.theme` entries still reference the previous `--didact-*` naming and are a known follow-up
(see `packages/registry/README.md`).
