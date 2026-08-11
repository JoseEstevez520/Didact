# Didact — Philosophy

Didact is a general-purpose library of **educational UI components** for React: flashcards,
spaced-repetition decks, quiz variants, matching and sequencing exercises, hints, glossaries,
progress and mastery indicators, timelines, rubrics, and more. It gives teams a shared, accessible
vocabulary for building learning experiences, the way general UI libraries did for buttons and
dialogs.

These are the principles the whole project is held to. Everything in this repository — the
components, the theme, the registry, the validators — exists to serve them.

## 1. You own your components (copy-paste distribution)

Didact is distributed as a **registry**: when you add a component, its source code is copied into
your project. From that moment it is *your* code — you can read it, change it, and it will never be
broken by an upgrade you did not choose to make. There is no runtime package that can shift under
you. The central registry is the source of truth for *new* copies and for anyone who wants to pull
updates, not a shared dependency you are locked to.

## 2. Accessible by default, not as an afterthought

Every component is operable by keyboard and screen reader, exposes state through ARIA, never
conveys meaning by color alone, respects reduced-motion preferences, and meets WCAG 2.2 AA as a
minimum contract. In many markets this is also a legal requirement for anyone selling software, so
we treat accessibility as first-class and check it in CI — not as a nice-to-have.

## 3. Grounded in evidence

The component set and its priorities are led by learning-science evidence, not by what looks
impressive. Techniques with strong evidence (retrieval practice, spaced practice, informative
feedback) come first and are supported deeply; components without that backing are still welcome
but are not allowed to crowd out the ones that demonstrably help people learn.

## 4. Neutral by default, yours to restyle

Didact ships a neutral, restrained default theme so components look finished out of the box without
imposing a brand. It is not the look of any particular product. Everything is themeable through
tokens, so any project can make Didact its own. See [`design-principles.md`](./design-principles.md)
for how customization works and [`visual-language.md`](./visual-language.md) for the default look.

## 5. General-purpose first

Didact is not built for one product. Every core component must make sense to someone who has never
heard of any specific consumer of the library. Anything specific to one product lives in an
optional adapter outside the core, never inside a component.
