# Didact — Interface Norms

This document codifies the norms that make Didact's components consistent **by construction**,
not by convention that every author has to remember separately. It exists because Phase 3.5
introduced `@didact/ui` — a small, general-purpose primitive kit (Button, Card family, Toggle/
ToggleGroup, Separator, Badge; see `packages/ui/README.md` and `specs/education-components/
design.md` §2) — as the base every education component (`@didact/core`, layer 3) composes from,
instead of each one inventing its own button/card/spacing/focus treatment ad hoc. The norms below
are what that composition should look like in practice.

See [`design-principles.md`](./design-principles.md) for the customization mechanisms (tokens,
variants, `className`, `asChild`, copy-paste ownership) and [`visual-language.md`](./
visual-language.md) for the palette/shape/focus/typography/motion values themselves. This document
is about **how components are put together**, not what they look like in isolation.

## Action hierarchy

At most **one primary action per view**. A "view" here means a card, a dialog, a form step, an
exercise — any single unit of attention a learner looks at at once.

- **Primary — `Button` `default`.** The one action the learner is meant to take next ("Continue",
  "Submit answer", "Start lesson"). Exactly one per view. Never render two `default` buttons side
  by side — if two actions feel equally important, that is a sign one of them should be demoted,
  not a reason to make both primary.
- **Secondary — `Button` `secondary` or `outline`.** Alternative actions that matter but aren't the
  main path ("Save draft", "Skip for now"). `outline` reads slightly quieter than `secondary`;
  either is acceptable next to a `default` primary.
- **Tertiary / low-emphasis — `Button` `ghost`.** Actions that should be available without
  competing visually with anything else ("Dismiss", an icon-only toolbar action).
- **Navigation-like — `Button` `link`.** An action that behaves like following a link rather than
  submitting or committing something ("Learn more", "View all lessons"). Prefer `asChild` with a
  real `<a>`/router link under the hood when the action actually navigates, so keyboard and
  screen-reader users get real link semantics, not a button that happens to look like a link.
- **Destructive — `Button` `destructive`.** Reserved for actions with real, hard-to-reverse
  consequences ("Delete deck", "Reset progress"). Never used for anything merely negative-sounding
  ("Cancel" is secondary/outline, not destructive, unless canceling actually discards work).

Rule of thumb when reviewing a screen: count the `default`-variant buttons visible at once. If it's
more than one, the hierarchy is broken — pick the single most important action and demote the rest.

## Card composition

`Card` has five slots, each with one job (`packages/ui/src/components/card.tsx`):

- **`CardHeader`** — identity of the card: what it is. Contains `CardTitle` (required if the
  header is used at all), an optional `CardDescription` for one line of supporting context, and an
  optional `CardAction` for a single header-level control (a status `Badge`, an icon-only `Button`
  like an overflow menu) that sits in the header's own column, not inline with the title text.
- **`CardTitle`** — short, scannable name of the thing the card represents (a lesson, an exercise,
  a deck). Not a sentence.
- **`CardDescription`** — one line of muted supporting text. Not a place for the card's actual
  content.
- **`CardAction`** — at most one control, aligned to the header's top-right. If a card needs more
  than one header-level action, that's a sign some of them belong in `CardFooter` instead.
- **`CardContent`** — the body. This is where the card's actual substance lives (a summary, a
  progress figure, an embedded preview) — never a duplicate of the title/description.
- **`CardFooter`** — actions that operate on the card as a whole, laid out following the Action
  hierarchy above (one primary action, any number of secondary/tertiary ones).

Not every slot is required. A card can be `Card` > `CardContent` alone (no header, no footer) when
it's a static presentational block. What's not acceptable is skipping the slot system and putting
a title or an action loose inside `CardContent` — the point of the slots is that any Didact card
can be scanned the same way regardless of which component renders it.

## Spacing & sizing

The control height/padding scale comes from `Button`'s `size` variants
(`packages/ui/src/components/button.tsx`) — every other interactive primitive (`Toggle`,
`ToggleGroupItem`) is sized to match so a button and a toggle sitting next to each other line up:

| Size       | Height | Notes                                              |
| ---------- | ------ | --------------------------------------------------- |
| `xs`       | `h-6`  | Dense contexts (inline toolbars, compact lists).     |
| `sm`       | `h-8`  | Secondary UI, form rows.                             |
| `default`  | `h-9`  | The default control height for most of the interface.|
| `lg`       | `h-10` | A single emphasized primary action on a page.        |
| `icon-*`   | matches `xs`/`sm`/`default`(`icon`)/`lg` | Square, icon-only; always pair with `aria-label`. |

Pick a size scale for a whole view, not per button — mixing `xs` and `lg` buttons in the same
toolbar reads as an accident, not a hierarchy signal (hierarchy is `variant`'s job, per Action
hierarchy above, not size).

`Card` padding is fixed at `px-6` (header/content/footer) with `py-6` on the outer card and a
`gap-6` between the header/content/footer blocks — don't override this per instance; if a card
feels cramped or sparse, that's a signal about what content belongs in it, not a reason to
special-case its padding.

## Focus & states

- **Focus:** every interactive primitive uses the same treatment — a 3px ring at the `--didact-
  ring` color, ~50% opacity, plus a solid `--didact-ring` border (`focus-visible:border-[color:
  var(--didact-ring)] focus-visible:ring-[3px] focus-visible:ring-[color:var(--didact-ring)]/50`).
  Never remove it and never invent a different focus style for a new component — WCAG 2.4.7
  requires focus to be visible, and a consistent treatment is what lets a learner recognize "this
  is focused" instantly across the whole interface. See `visual-language.md`'s "Focus" section for
  why this exact value.
- **Disabled:** `disabled:pointer-events-none disabled:opacity-50` — no click target, reduced
  opacity, but never hidden entirely (a learner should still see a disabled action exists and
  understand roughly why, from context/copy).
- **Loading:** a component in a loading state keeps its layout (no collapsing/reflow) and disables
  interaction the same way `disabled` does, while adding a visible, non-color-only cue (a spinner
  or "Loading…" text) — never a bare color change, per WCAG 1.4.1.
- **Invalid:** driven by `aria-invalid`, styled via `aria-invalid:border-[color:var(--didact-
  destructive)] aria-invalid:ring-[color:var(--didact-destructive)]/20` (already built into
  `Button`, `Badge`, and `Toggle`) — paired with real error text via `aria-describedby`, never the
  red border alone.
- **Empty:** an empty state is content, not a blank `Card`/`CardContent` — say what's missing and,
  when there's a next step, offer exactly one primary action for it (per Action hierarchy).
- **Error:** distinguish a **field-level** error (`aria-invalid`, above) from a **view-level**
  error (an exercise failed to load, a submission failed) — the latter gets its own message and a
  retry action, not a red border on an unrelated control.
- **Correct / incorrect:** never color-only (WCAG 1.4.1, RF-12). Pair the state with text/an icon
  that stands on its own — this is the same rule `MasteryBadge` already follows
  (`packages/core/src/components/mastery-badge.tsx`) and every quiz/exercise-style component built
  on `@didact/ui` must follow it too.

## Motion strategy (decided)

Didact's default animation mechanism is **CSS transitions/keyframes**, driven by the
`--didact-motion-duration` token and `data-state`/`data-orientation`/etc. attributes that Radix
primitives already expose — not a JS animation runtime. Concretely:

- Every transition reads its duration from `--didact-motion-duration` (never a hardcoded `200ms`
  written inline), and that token collapses to `0ms` under `prefers-reduced-motion: reduce`
  (`packages/theme/src/tokens.css`) — so respecting reduced motion is automatic for any component
  that uses the token, not something each component re-implements (RF-13).
- State-driven visuals (a `Toggle` turning on, a `ToggleGroupItem` becoming selected) animate off
  the primitive's own `data-state` attribute via plain CSS (`data-[state=on]:...`), not a
  JS-driven spring or timeline.
- **No JS animation library ships in the base kit.** This is a direct consequence of RNF-5
  (pinned, drift-tested dependencies) and the tree-shaking/minimal-deps goal: a general animation
  runtime is a heavy, broad-surface dependency for something CSS already does well for the
  transitions this kit needs (opacity/color/transform on state change).
- A JS animation library is only ever justified as an **isolated, opt-in escalation** for a
  specific component that genuinely needs physics or gesture orchestration a CSS transition can't
  express — and even then, drag physics is `dnd-kit`'s job, not a general-purpose animation
  library's. Any such escalation still has to be pinned to an exact version with a drift test
  (RNF-5); it never becomes a base-kit dependency that every consumer pays for.

## Consequences for authors composing from `@didact/ui`

- Reach for `@didact/ui`'s `Button`/`Card`/`Badge`/`Separator`/`Toggle`/`ToggleGroup` first; only
  build a bespoke primitive when none of these fit, and if that happens repeatedly for the same
  need, that's a signal the primitive kit is missing something, not that every component should
  route around it.
- Keep the Action hierarchy rule (one `default` per view) even inside a composed education
  component — a `Flashcard`'s own "Known"/"Needs review" controls, for instance, are not
  `default`-variant buttons precisely because they're not the card's one primary action.
- Never fork a primitive's classes to tweak a color/radius/shadow — override the underlying
  `--didact-*` token instead (`design-principles.md` §1). If a genuinely new visual value is
  needed, add a token to `@didact/theme`, don't hardcode it in the component.
