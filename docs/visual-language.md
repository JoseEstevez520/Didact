# Didact — Visual Language

This is Didact's default look: a **neutral, low-chroma, high-contrast** system that looks finished
without imposing a brand. It is implemented as tokens in `@didact/theme` and consumed by every
component through those tokens (see [`design-principles.md`](./design-principles.md) §1). The
values below are Didact's defaults; any consumer overrides them.

## Palette

Near-monochrome by design. The default theme is built from neutral greys with a near-black
foreground and a near-white background; there is no saturated brand accent baked in. Semantic
roles (each available in a light `:root` scale and a `.dark` scale):

- `background` / `foreground` — page surface and primary text.
- `card` / `card-foreground`, `popover` / `popover-foreground` — raised surfaces.
- `primary` / `primary-foreground` — the strongest neutral emphasis (a dark surface with light
  text), used sparingly.
- `secondary` / `secondary-foreground`, `muted` / `muted-foreground`, `accent` /
  `accent-foreground` — quiet fills and secondary text.
- `border`, `input` — hairline separators and field outlines (a light grey, kept subtle).
- `ring` — the focus indicator color (a mid grey).
- `destructive` — the single reserved status color, for genuinely destructive actions.

Learning-specific status tokens (`success` / `warning` / `danger` with soft backgrounds) exist for
components that need them, but are **never used alone**: they are always paired with text or an
icon, never color as the only signal.

## Shape and scale

- **Radius:** a single base radius of `0.625rem`, with a derived `sm / md / lg / xl` scale
  (`calc()` off the base). Small interactive chips are fully rounded (pill); surfaces use the base.
- **Restraint:** components are compact and quiet. Small text with medium weight, tight padding,
  hairline borders, no heavy shadows or gradients. The interface should recede so the learning
  content stands out.
- **Badges/chips:** pill-shaped, `text-xs` / medium weight, minimal padding, transparent border by
  default — a small, calm status marker, not a loud button.

## Focus

Focus is always visible and never removed without a substitute (WCAG 2.4.7). The default is a
**3px ring in the `ring` color at ~50% opacity**, plus a ring-colored border — soft but
unmistakable, and consistent across every interactive component.

## Typography

Sans-serif by default, with relative (never fixed-`px`) sizes so users can scale text. Long-form
text is line-length limited (~60–70 characters) and never justified, for readability including
dyslexic readers.

## Motion

Motion is subtle and centralized through a duration token. Every animation respects
`prefers-reduced-motion` (WCAG 2.3.3): when reduced motion is requested, durations collapse to
zero. Motion is never required to understand state.

## Contrast — status

The default token values target WCAG AA contrast (normal text ≥ 4.5:1, non-text ≥ 3:1) but the
palette has **not yet been audited with a contrast tool** — this is a known open item, to be
verified before the first real component wave, not assumed from the values alone.
