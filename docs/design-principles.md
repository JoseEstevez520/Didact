# Didact — Design Principles

Didact's defining property is that **every component is fully customizable in style**, without
forking or fighting the library. This is a hard requirement for every component, not an aesthetic
preference. It rests on five mechanisms; each component MUST support all that apply to it.

See [`interface-norms.md`](./interface-norms.md) for the complementary set of norms about *how*
components are composed and used together (action hierarchy, card slots, spacing/sizing, focus and
state treatment, motion strategy) — this document is about the mechanisms that make a single
component customizable; that one is about consistency across components built from `@didact/ui`.

## 1. Token-driven theming

No component hardcodes a color, radius, spacing, or font. Everything reads from design tokens
exposed as CSS custom properties (`--didact-*`) on `:root`, with a matching dark scale. A project
re-themes the entire library by overriding those variables in one place — no component edits, no
rebuild of Didact. This is what makes the default theme neutral and every consumer's theme
first-class. See [`visual-language.md`](./visual-language.md) for the token set.

## 2. Variants and sizes

Each component exposes named `variant` (and, where it makes sense, `size`) props, built with
`class-variance-authority`. Callers pick a look by name — no CSS required. Domain props may pick a
sensible default variant, but an explicit `variant`/`size` always wins.

## 3. `className` passthrough, merged last

Every component accepts a `className` and merges it **last** using our `cn()` helper (`clsx` +
`tailwind-merge`), so a caller can override or extend any single instance inline and later classes
win over the component's defaults without specificity fights.

## 4. `asChild` / Slot

Where a component is essentially a styled wrapper, it accepts `asChild` and renders its styling and
behavior onto the consumer's own element instead of an extra wrapper node. This lets Didact's style
travel onto links, custom buttons, and framework primitives.

## 5. Copy-paste ownership

Because components are distributed by copy (see [`PHILOSOPHY.md`](./PHILOSOPHY.md) §1), the ultimate
customization is always available: the source is in the consumer's project and can be edited
directly. The four mechanisms above exist so that editing the source is rarely necessary — most
customization should be reachable through tokens, variants, and `className`.

## Consequences for authors

When adding a component:

- Read every visual value from a token; if a token is missing, add it to the theme rather than
  hardcoding.
- Expose the meaningful looks as `variant`s; don't make callers override `className` for things
  that should be first-class options.
- Always accept and merge `className` via `cn()`.
- Offer `asChild` when the component is a styling/behavior wrapper.
- Keep behavior (state, keyboard, ARIA) intact under every variant and restyle.
