# @didact/ui

Layers 1-2 of Didact's 3-layer architecture (`specs/education-components/design.md` §2),
materialized as one real package: a small, **general-purpose primitive kit** (Button, Card family,
ToggleGroup/Toggle, Separator, Badge) that `@didact/core` (layer 3, the education molecules)
composes from, instead of every education component styling its own button/card/focus treatment
ad hoc.

```
┌─────────────────────────────────────────────┐
│ 3. Education molecules                       │  @didact/core -- Flashcard, MatchingExercise,
│    (components with pedagogical meaning)     │  QuizItem, MasteryBadge… composes from below.
├─────────────────────────────────────────────┤
│ 2. Styled layer                               │  Tailwind v4 + cva over @didact/theme's tokens.
│    (neutral theme, restyleable)              │  This package.
├─────────────────────────────────────────────┤
│ 1. Accessible primitives                     │  Radix UI. This package.
│    (headless)                                │
└─────────────────────────────────────────────┘
```

## What's here

- `Button` -- variants `default`/`destructive`/`outline`/`secondary`/`ghost`/`link`, sizes
  `default`/`xs`/`sm`/`lg`/`icon`/`icon-xs`/`icon-sm`/`icon-lg`, `asChild` via `radix-ui`'s `Slot`.
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`.
- `Badge` -- variants `default`/`secondary`/`destructive`/`outline`/`ghost`/`link`, `asChild`.
- `Separator` -- backed by `radix-ui`'s `Separator`.
- `Toggle` / `ToggleGroup`, `ToggleGroupItem` -- backed by `radix-ui`'s `Toggle` and `ToggleGroup`.

See [`docs/interface-norms.md`](../../docs/interface-norms.md) for the composition norms this kit
exists to make possible by construction (action hierarchy, card slot usage, spacing/sizing scale,
focus/state treatment, motion strategy).

## How each primitive was built

Every component here is a **verbatim port** of the reference headless-primitives + Tailwind +
`cva` kit (the style/architecture reference `specs/education-components/requirements.md` §0.2
names for Didact's distribution model) -- not invented from scratch, and not re-tokenized. Same
variant/size sets, same class structure, same standard Tailwind utility classes (`bg-primary`,
`text-muted-foreground`, `rounded-xl`, `shadow-sm`, `focus-visible:ring-ring/50`, etc.) reading
`@didact/theme`'s CSS custom properties, same `data-slot`/`data-variant`/`data-size` attributes,
same `asChild`/Slot escape hatch where it applies, same unified `radix-ui` package import. The only
change from the reference source in every file is the `cn` import path.

## Pinned dependencies (RNF-5)

`radix-ui` (the unified package bundling `Slot`, `Separator`, `Toggle`, `ToggleGroup`, etc.) is
pinned to an exact version in `package.json`, verified to install cleanly against React 19 with no
`--legacy-peer-deps`/`--force` flag needed (see `design.md` §2 for the same verification already
done for the Radix packages this repo uses elsewhere).

## Relationship to the rest of the monorepo

- `@didact/theme` is the token source this package consumes; it never redefines a color/radius on
  its own.
- Each primitive here is also a `registry:ui` entry in `@didact/registry` (`packages/registry/
  registry.json`), for Didact's copy-paste distribution mechanism (RF-15) -- usable standalone by a
  consumer who only wants the primitive kit, with no pedagogical content.
- `@didact/core` composes its education molecules from these primitives; no primitive here should
  ever gain pedagogical-domain knowledge (a "correct answer" concept, a mastery level, etc.) -- that
  belongs one layer up.

See `specs/education-components/design.md` §2 for the full architecture and
`specs/education-components/requirements.md` §0.3 for the product-owner decision that brought this
package into scope.
