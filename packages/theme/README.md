# @didact/theme

Didact's neutral default theme (**RF-16**): layer 2 ("styled layer") of the 3-layer architecture
in `specs/education-components/design.md` §2, consumed by `@didact/core` and by `apps/docs`. No
core component should hardcode its own color/size or a specific consumer's (SkillNet included) —
everything goes through this package's variables.

## Why it exists as a separate package

`design.md` §2 draws layer 2 as "a single place for theming" between the accessible primitives
(layer 1) and the education components (layer 3). Extracting it into its own package (instead of
living inside `@didact/core`) lets `apps/docs` consume it to render the catalog with the exact
same theme any project copying a component will see, without depending on `@didact/core` already
having a real implementation.

## Product decision: Tailwind v4, yes, despite research.md P3

`specs/education-components/research.md` Question 3 concluded, with evidence, that Didact's
distribution mechanism **does not require** Tailwind (the `tailwind` field in
`registry-item.json` is deprecated in favor of `cssVars.theme`) — that technical conclusion still
stands and is not rewritten. What changes is a **later product decision** (Jose, 2026-08-11, see
`../../research/decisions.md` D1): Didact adopts **Tailwind v4** (CSS-first: `@theme`, OKLCH
colors) as its real styling layer, for visual consistency with Didact's own visual language (see
`docs/visual-language.md`) — not because the registry mechanism required it.

`src/tokens.css` exposes the theme in **two levels** precisely to not lose the advantage P3
identified:

1. **Plain CSS custom properties** (`:root { --didact-* }`) — the level any consumer overrides to
   restyle, whether or not they use Tailwind (if someone copies a component into a project without
   Tailwind, the variables still work).
2. **A `@theme` block** that remaps those variables into Tailwind v4 design tokens
   (`bg-didact-primary`, `rounded-didact-md`, etc.), so `@didact/core`'s components can be written
   with Tailwind utilities without fixing values — Tailwind still reads the CSS variable from (1).

## Contents of `src/tokens.css`

Product decision (2026-08-11): Didact's visual style is a neutral, low-chroma, high-contrast
system (owner rejected the previous, invented look). The token set and OKLCH values below
implement that visual language exactly as specified (`docs/visual-language.md`), under the same
`--didact-*` naming contract:

- The full semantic set: `background`/`foreground`, `card`, `popover`, `primary`, `secondary`,
  `muted`, `accent`, `destructive`, `border`, `input`, `ring` (+ `-foreground` pairs), plus a
  `.dark` block with the matching dark values and the `radius`/`radius-sm/md/lg/xl` scale.
- **Extra status tokens** (`success`/`warning`/`danger-bg`) — not part of that base semantic set,
  kept as EXTRA tokens for non-badge components, explicitly documented as "never used alone":
  every component consuming them must pair them with an icon/text, never rely on color alone
  (British Dyslexia Association Style Guide 2023 + WCAG 1.4.1 Use of Color). `MasteryBadge` does
  not use these; it's neutral-palette only, per `docs/visual-language.md`'s Badge guidance.
- **Sans-serif by default** typography, relative sizes (never fixed `px`), a ~60-70
  character-per-line limit (BDA Style Guide 2023) — genuinely ours.
- Centralized motion duration, overridden under `prefers-reduced-motion` (WCAG 2.3.3 + RF-13) —
  also ours.

**Honest caveat (same standard as `research.md`):** the base OKLCH values were calibrated against
a well-established neutral design reference and are used verbatim, but the a11y-specific additions
we layered on top (status tokens) are a reasonable starting point traced to `research.md` P5's
*criteria* (contrast ≥4.5:1 for text, ≥3:1 for borders/icons) and **are not audited with a real
tool** (axe, Pa11y, etc.) yet. Don't consider contrast satisfied just because the formula suggests
it — verify it in Phase 4 before freezing the palette.

## Dependencies

`tailwindcss` as a devDependency, pinned version (RNF-5) — see `research/decisions.md` for the
caveat that this version is a reference as of this update's date, not verified live against
`registry.npmjs.org` (unlike the rest of `research.md`, which did).

## Status

Scaffold (Phase 1-3). Reference palette and scales, not audited or frozen — adjustable without
breaking the variable *name* contract, which is what `@didact/core`'s real components will
consume in Phase 4.
